"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * SERVER ACTION: Dynamic Application Status Fetcher
 * Queries the SQLite database for live counts of active job applications.
 */
export async function getPendingApplicationsCount(): Promise<number> {
  try {
    // Define active statuses that contribute to the "pending" count
    const activeStatuses = ["PENDING", "APPLIED", "INTERVIEWING"];

    const count = await prisma.jobApplication.count({
      where: {
        status: {
          in: activeStatuses,
        },
      },
    });

    return count;
    
  } catch (error) {
    console.error("Error fetching application count:", error);
    // Graceful fallback to zero to prevent UI crashes in the ChatWidget
    return 0;
  }
}
