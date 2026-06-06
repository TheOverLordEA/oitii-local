"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { LocalAutoApplier } from "@/lib/auto_apply";

export async function getPendingSniperMatch() {
  const sessionId = await getSessionId();
  if (!sessionId) return null;

  const profile = await prisma.userProfile.findUnique({
    where: { sessionId },
  });

  if (!profile) return null;

  const pendingMatch = await prisma.curatedMatch.findFirst({
    where: {
      userId: profile.id,
      status: "Pending_Approval",
    },
    include: {
      job: true,
    },
    orderBy: {
      matchScore: "desc", // Show the highest score first
    },
  });

  if (!pendingMatch) return null;

  return {
    id: pendingMatch.id,
    company: pendingMatch.job.company,
    title: pendingMatch.job.title,
    matchScore: pendingMatch.matchScore,
    reasoning: pendingMatch.aiReasoning,
    jobUrl: pendingMatch.job.url,
  };
}

export async function skipSniperMatch(matchId: string) {
  const sessionId = await getSessionId();
  if (!sessionId) throw new Error("Unauthorized");

  await prisma.curatedMatch.update({
    where: { id: matchId },
    data: { status: "Skipped" },
  });

  return { success: true };
}

export async function deploySniperMatch(matchId: string, jobUrl: string) {
  const sessionId = await getSessionId();
  if (!sessionId) throw new Error("Unauthorized");

  const profile = await prisma.userProfile.findUnique({
    where: { sessionId },
  });

  if (!profile) throw new Error("Profile not found");

  let resumeText = "";
  if (profile.resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: profile.resumeId },
    });
    resumeText = resume?.parsedText || "";
  }

  // Setup auto applier - For now, using Ollama as it's default in the existing script
  // To avoid changing auto_apply.ts for now
  const applier = new LocalAutoApplier(
    { provider: "ollama" },
    {
      resumeText,
      basicDetails: profile.basicDetails ? JSON.parse(profile.basicDetails) : {},
    }
  );

  try {
    // Run Playwright headless on the server
    const screenshot = await applier.runApplication(jobUrl, true);

    await prisma.curatedMatch.update({
      where: { id: matchId },
      data: { status: "Applied" },
    });

    return { success: true, screenshot };
  } catch (error: any) {
    console.error("Playwright Deployment Error:", error);
    // Mark as failed if it completely crashed
    await prisma.curatedMatch.update({
      where: { id: matchId },
      data: { status: "Failed" },
    });
    throw new Error(error.message || "Deployment failed");
  }
}
