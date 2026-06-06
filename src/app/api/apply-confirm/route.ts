import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";
import { LocalAutoApplier } from "@/lib/auto_apply";

/**
 * POST /api/apply-confirm
 * Executes a pending job application using Playwright automation.
 * Called when the user clicks "Confirm Apply" on the confirmation card.
 */
export async function POST(req: Request) {
  try {
    const sessionId = await getSessionId();
    if (!sessionId) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 });
    }

    const { applicationId } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });
    }

    // Verify the application exists and belongs to this session
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId, sessionId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        { error: `Application already ${application.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (!application.jobUrl) {
      return NextResponse.json({ error: "No job URL available" }, { status: 400 });
    }

    // Get user profile for form filling
    const profile = await prisma.userProfile.findUnique({
      where: { sessionId },
    });

    // Prepare user data for auto-fill
    const basicDetails = profile?.basicDetails ? JSON.parse(profile.basicDetails) : {};
    const userProfile = {
      resumeText: "", // Could be populated from parsed resume if available
      basicDetails: {
        firstName: basicDetails.firstName || "",
        lastName: basicDetails.lastName || "",
        email: basicDetails.email || "",
        phone: basicDetails.phone || "",
        location: profile?.locations ? JSON.parse(profile.locations)[0] : "",
      },
    };

    // Execute the auto-apply using Playwright
    const llmConfig = {
      provider: "openai" as const,
      apiKey: process.env.OPENAI_API_KEY,
    };
    const applier = new LocalAutoApplier(llmConfig, userProfile);
    const screenshotBase64 = await applier.runApplication(application.jobUrl, true);

    // Mark as APPLIED on success
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPLIED",
        notes: `Auto-applied successfully.`,
      },
    });

    return NextResponse.json({
      success: true,
      applicationId,
      screenshot: screenshotBase64,
    });
  } catch (error) {
    console.error("Apply confirm error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
