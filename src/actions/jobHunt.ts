"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

export type JobHuntStats = {
  total: number;
  pending: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
};

export type JobHuntApplication = {
  id: string;
  company: string;
  role: string;
  status: string;
  jobUrl: string | null;
  appliedAt: Date;
  notes: string | null;
};

export async function getJobHuntStats(): Promise<JobHuntStats> {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      return { total: 0, pending: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0 };
    }

    const [total, pending, applied, interviewing, offer, rejected] = await Promise.all([
      prisma.jobApplication.count({ where: { sessionId } }),
      prisma.jobApplication.count({ where: { sessionId, status: "PENDING" } }),
      prisma.jobApplication.count({ where: { sessionId, status: "APPLIED" } }),
      prisma.jobApplication.count({ where: { sessionId, status: "INTERVIEWING" } }),
      prisma.jobApplication.count({ where: { sessionId, status: "OFFER" } }),
      prisma.jobApplication.count({ where: { sessionId, status: "REJECTED" } }),
    ]);

    return { total, pending, applied, interviewing, offer, rejected };
  } catch (error) {
    console.error("Error fetching job hunt stats:", error);
    return { total: 0, pending: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0 };
  }
}

export async function getJobHuntApplications(
  limit = 10
): Promise<JobHuntApplication[]> {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) return [];

    const apps = await prisma.jobApplication.findMany({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        jobUrl: true,
        appliedAt: true,
        notes: true,
      },
    });

    return apps;
  } catch (error) {
    console.error("Error fetching job hunt applications:", error);
    return [];
  }
}
