import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCuratedJobs } from "@/actions/jobs";

/**
 * Agent tool registry.
 *
 * Each tool is sandboxed to the caller's `sessionId` so one user can never
 * read or mutate another user's data. The registry is built per-request so
 * the closure captures the active session.
 *
 * Design rules:
 *  - Tools are deterministic and side-effect-aware. Destructive actions
 *    (e.g. submitting a job application) MUST go through `request_apply`
 *    which only surfaces a confirmation card — the actual submission
 *    happens client-side after explicit user click.
 *  - Tools never throw upward; they return shaped error payloads so the
 *    LLM can recover and tell the user something useful.
 */

const APPLICATION_STATUSES = ["PENDING", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"] as const;
type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Helper: turn an array into a JSON string for SQLite columns. */
const jsonArray = (v: string[] | undefined) => (v ? JSON.stringify(v) : undefined);

/** Helper: parse a JSON-string column back into an array, safely. */
function safeParseArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Hydrate a stored UserProfile row into a structured object. */
function hydrateProfile(row: any) {
  if (!row) return null;
  return {
    sessionId: row.sessionId,
    targetTitles: safeParseArray(row.targetTitles),
    locations: safeParseArray(row.locations),
    workStyle: row.workStyle ?? null,
    salaryFloor: row.salaryFloor ?? null,
    basicDetails: row.basicDetails ? safeJsonParse(row.basicDetails) : null,
    resumeId: row.resumeId ?? null,
    updatedAt: row.updatedAt,
  };
}

function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function buildAgentTools(sessionId: string) {
  return {
    /* ------------------------------------------------------------------ */
    /* SEARCH                                                              */
    /* ------------------------------------------------------------------ */
    search_jobs: tool({
      description:
        "CRITICAL: DO NOT use this tool if the user is asking HOW you work, WHAT you can do, or seeking general advice (e.g., 'How can you help me find a job?'). ONLY use this tool for TRANSACTIONAL commands where the user explicitly asks you to fetch, find, or show real job listings right now.",
      inputSchema: z.object({
        query: z.string().optional().describe("Free-text role/keyword search, e.g. 'react frontend'"),
        location: z.string().optional(),
        remote: z.boolean().optional().describe("Set true if the user wants remote roles"),
        limit: z.number().int().min(1).max(20).default(10),
      }),
      execute: async ({ limit }) => {
        const jobs = await getCuratedJobs(limit);
        return {
          count: jobs?.length ?? 0,
          jobs: jobs ?? [],
        };
      },
    }),

    /* ------------------------------------------------------------------ */
    /* APPLICATIONS — read                                                 */
    /* ------------------------------------------------------------------ */
    list_my_applications: tool({
      description:
        "List the current user's job applications. Use when the user asks 'what have I applied to', 'show my applications', or wants to update one.",
      inputSchema: z.object({
        status: z.enum(APPLICATION_STATUSES).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
      execute: async ({ status, limit }) => {
        const apps = await prisma.jobApplication.findMany({
          where: { sessionId, ...(status ? { status } : {}) },
          orderBy: { updatedAt: "desc" },
          take: limit,
        });
        return { count: apps.length, applications: apps };
      },
    }),

    get_application_count: tool({
      description: "Return the count of the user's pending/active job applications.",
      inputSchema: z.object({}),
      execute: async () => {
        const count = await prisma.jobApplication.count({
          where: {
            sessionId,
            status: { in: ["PENDING", "APPLIED", "INTERVIEWING"] },
          },
        });
        return { count };
      },
    }),

    /* ------------------------------------------------------------------ */
    /* APPLICATIONS — write (state machine)                                */
    /* ------------------------------------------------------------------ */
    update_application_status: tool({
      description:
        "Update the status of one of the user's existing job applications. Valid statuses: PENDING, APPLIED, INTERVIEWING, OFFER, REJECTED.",
      inputSchema: z.object({
        applicationId: z.string(),
        status: z.enum(APPLICATION_STATUSES),
        notes: z.string().optional(),
      }),
      execute: async ({ applicationId, status, notes }) => {
        // Scope check: only allow updates to apps owned by this session.
        const existing = await prisma.jobApplication.findFirst({
          where: { id: applicationId, sessionId },
        });
        if (!existing) {
          return { ok: false, error: "Application not found for this user." };
        }
        const updated = await prisma.jobApplication.update({
          where: { id: applicationId },
          data: { status, ...(notes !== undefined ? { notes } : {}) },
        });
        return { ok: true, application: updated };
      },
    }),

    /* ------------------------------------------------------------------ */
    /* PROFILE                                                             */
    /* ------------------------------------------------------------------ */
    get_my_profile: tool({
      description:
        "Get the user's saved search profile (target titles, locations, work style, salary floor). Always call this before suggesting roles so you respect their preferences.",
      inputSchema: z.object({}),
      execute: async () => {
        const row = await prisma.userProfile.findUnique({ where: { sessionId } });
        return { profile: hydrateProfile(row) };
      },
    }),

    update_my_profile: tool({
      description:
        "Save or update the user's job-search preferences. Call this whenever the user shares new criteria (titles, locations, remote/hybrid/onsite, salary). Pass only the fields you learned — others stay unchanged.",
      inputSchema: z.object({
        targetTitles: z.array(z.string()).optional(),
        locations: z.array(z.string()).optional(),
        workStyle: z.enum(["remote", "hybrid", "onsite", "any"]).optional(),
        salaryFloor: z.number().int().nonnegative().optional(),
        basicDetails: z
          .object({
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string().optional().describe("User's email address"),
            phone: z.string().optional(),
          })
          .partial()
          .optional(),
      }),
      execute: async (input) => {
        const data: Record<string, unknown> = {};
        if (input.targetTitles) data.targetTitles = jsonArray(input.targetTitles);
        if (input.locations) data.locations = jsonArray(input.locations);
        if (input.workStyle) data.workStyle = input.workStyle;
        if (input.salaryFloor !== undefined) data.salaryFloor = input.salaryFloor;
        if (input.basicDetails) data.basicDetails = JSON.stringify(input.basicDetails);

        const row = await prisma.userProfile.upsert({
          where: { sessionId },
          create: { sessionId, ...data },
          update: data,
        });
        return { profile: hydrateProfile(row) };
      },
    }),

    /* ------------------------------------------------------------------ */
    /* APPLY (confirmation gate)                                           */
    /* ------------------------------------------------------------------ */
    request_apply: tool({
      description:
        "Surface an application-confirmation card to the user. Call this when the user wants to apply to a SPECIFIC job (with a known url). NEVER auto-submit applications — only the user's click on the rendered card may trigger the actual submission. After calling this, end your reply with one short sentence explaining what you're confirming.",
      inputSchema: z.object({
        jobTitle: z.string(),
        company: z.string(),
        jobUrl: z.string().url(),
        location: z.string().optional(),
      }),
      execute: async ({ jobTitle, company, jobUrl, location }) => {
        // Pre-create a PENDING application so we can later transition it.
        const app = await prisma.jobApplication.create({
          data: {
            sessionId,
            company,
            role: jobTitle,
            jobUrl,
            status: "PENDING",
          },
        });
        // The frontend renders this payload as an interactive confirmation card.
        return {
          ok: true,
          confirm: {
            applicationId: app.id,
            jobTitle,
            company,
            location: location ?? null,
            jobUrl,
          },
        };
      },
    }),
    /* ------------------------------------------------------------------ */
    /* GENERATIVE UI TOOLS                                                */
    /* ------------------------------------------------------------------ */
    render_job_list: tool({
      description:
        "CRITICAL: DO NOT use this tool for informational chat. ONLY use this tool immediately after a successful search_jobs call to display the fetched jobs to the user.",
      inputSchema: z.object({
        jobs: z.array(
          z.object({
            id: z.string().describe("Unique identifier for the job/match"),
            company: z.string(),
            title: z.string(),
            matchScore: z.number().int().min(0).max(100),
            reasoning: z.string().describe("1-2 sentences explaining why this is a good fit"),
            salary: z.string().optional(),
            location: z.string().optional(),
            techStack: z.array(z.string()).optional(),
            url: z.string().url().describe("The URL where the job was found"),
          })
        ),
      }),
      execute: async (input) => {
        // Return the structured payload directly so the Generative UI can intercept and render it.
        return {
          ok: true,
          jobs: input.jobs,
        };
      },
    }),

    configure_active_mode: tool({
      description:
        "Call this immediately when the user indicates they are actively searching for a job. Renders the parameter form (Target Title, Minimum Salary, Location) so the user can lock in their search criteria.",
      inputSchema: z.object({}),
      execute: async () => {
        return { ok: true };
      },
    }),

    configure_passive_mode: tool({
      description:
        "Call this immediately when the user indicates they are passively browsing. Renders the radar threshold options (Salary Bump, Top-Tier Companies, Tech-Stack Matches) so the user can set alert criteria.",
      inputSchema: z.object({}),
      execute: async () => {
        return { ok: true };
      },
    }),

  } as const;
}

export type AgentTools = ReturnType<typeof buildAgentTools>;
