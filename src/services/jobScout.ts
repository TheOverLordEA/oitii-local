import { prisma } from "@/lib/prisma";
import { getAIModel } from "@/lib/aiProvider";
import { generateText } from "ai";
import { z } from "zod";

// --- Part A: Ingestion ---

export async function fetchVerifiedJobs() {
  try {
    const response = await fetch("https://api.oitii.com/v1/jobs/verified");
    
    if (!response.ok) {
      console.warn("Failed to fetch verified jobs from Oitii API. Status:", response.status);
      return;
    }

    const jobs = await response.json();

    if (!Array.isArray(jobs)) {
      console.warn("Expected an array of jobs, got:", typeof jobs);
      return;
    }

    let addedCount = 0;

    for (const job of jobs) {
      // Ignore jobs that already exist by URL
      const existing = await prisma.discoveredJob.findFirst({
        where: { url: job.url },
      });

      if (!existing) {
        await prisma.discoveredJob.create({
          data: {
            title: job.title,
            company: job.company,
            url: job.url,
            description: job.description,
            postedAt: job.postedAt ? new Date(job.postedAt) : new Date(),
            isProcessed: false,
          },
        });
        addedCount++;
      }
    }

    console.log(`Ingested ${addedCount} new jobs from Oitii network.`);
  } catch (error) {
    console.error("Error fetching verified jobs:", error);
  }
}

// --- Part B: Scoring ---

const ScoringSchema = z.object({
  match_score: z.number(),
  reasoning: z.string(),
  triggers_dealbreaker: z.boolean(),
});

export async function scorePendingJobs(sessionId: string) {
  // Fetch the local UserProfile
  const profile = await prisma.userProfile.findUnique({
    where: { sessionId },
  });

  if (!profile) {
    console.warn(`No user profile found for session ${sessionId}. Cannot score jobs.`);
    return;
  }

  // Fetch all DiscoveredJob records where isProcessed == false
  const pendingJobs = await prisma.discoveredJob.findMany({
    where: { isProcessed: false },
  });

  if (pendingJobs.length === 0) {
    console.log("No pending jobs to score.");
    return;
  }

  console.log(`Found ${pendingJobs.length} pending jobs. Starting AI scoring...`);

  for (const job of pendingJobs) {
    // Construct the strict evaluation prompt
    const prompt = `You are an expert technical recruiter AI. Your task is to evaluate a job description against a candidate's profile.

CANDIDATE PROFILE:
- Inferred Seniority: ${profile.inferredSeniority || "Unknown"}
- Base Salary Target: ${profile.salaryFloor ? `$${profile.salaryFloor}` : (profile.inferredSalary ? `$${profile.inferredSalary}` : "Unknown")}
- Preferred Work Style: ${profile.workStyle || "Any"}
- Known Dealbreakers: ${profile.dealbreakers || "None"}
- Target Titles: ${profile.targetTitles || "Any"}
- Basic Details / Skills: ${profile.basicDetails || "None"}

JOB LISTING:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "match_score": number (0-100, where 100 is a perfect match),
  "reasoning": "string (brief 1-2 sentence explanation of why it's a good or bad fit)",
  "triggers_dealbreaker": boolean (true if the job explicitly violates a candidate's dealbreaker)
}

OUTPUT STRICT JSON ONLY. NO MARKDOWN. NO BACKTICKS. NO INTRO TEXT.`;

    try {
      // Pass the job description and user profile into our getAIModel()
      const { text } = await generateText({
        model: getAIModel(),
        prompt,
      });

      // Clean output and manually parse to guarantee provider-agnostic JSON compatibility
      const cleanJson = text.replace(/^```(json)?|```$/gi, "").trim();
      const parsed = JSON.parse(cleanJson);
      
      // Force the LLM output into the Zod schema
      const result = ScoringSchema.parse(parsed);

      // If match_score > 85 and triggers_dealbreaker == false, save to CuratedMatch
      if (result.match_score > 85 && !result.triggers_dealbreaker) {
        await prisma.curatedMatch.create({
          data: {
            jobId: job.id,
            userId: profile.id,
            matchScore: result.match_score,
            aiReasoning: result.reasoning,
            status: "Pending_Approval",
          },
        });
        console.log(`Matched! Job ID: ${job.id} | Score: ${result.match_score}`);
      }

    } catch (error) {
      console.error(`AI Scoring failed for job ${job.id}:`, error);
      // Depending on retry strategy, you might want to skip marking as processed here.
      // But we will mark it processed so it doesn't get stuck in a bad parsing loop.
    } finally {
      // Mark the DiscoveredJob as isProcessed = true
      await prisma.discoveredJob.update({
        where: { id: job.id },
        data: { isProcessed: true },
      });
    }
  }

  console.log("Finished scoring jobs.");
}
