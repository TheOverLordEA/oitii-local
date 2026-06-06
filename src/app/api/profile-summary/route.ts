import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

/**
 * GET /api/profile-summary
 * Returns the hydrated UserProfile for the current session.
 * Called on widget mount to power the profile-aware greeting.
 * Returns { profile: null } for sessions with no saved profile.
 */
export async function GET() {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({ profile: null });
  }

  const row = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!row) {
    return NextResponse.json({ profile: null });
  }

  const safeParseJson = (v: string | null | undefined) => {
    if (!v) return null;
    try { return JSON.parse(v); } catch { return null; }
  };

  return NextResponse.json({
    profile: {
      basicDetails:      safeParseJson(row.basicDetails),
      targetTitles:      safeParseJson(row.targetTitles) ?? [],
      locations:         safeParseJson(row.locations) ?? [],
      workStyle:         row.workStyle,
      salaryFloor:       row.salaryFloor,
      inferredSeniority: row.inferredSeniority,
      inferredSalary:    row.inferredSalary,
      dealbreakers:      safeParseJson(row.dealbreakers) ?? [],
      resumeId:          row.resumeId,
    },
  });
}
