import { NextResponse } from "next/server";
import { LocalAutoApplier, LLMConfig, UserProfile } from "@/lib/auto_apply";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jobUrl: string = body.jobUrl;
    const llmConfig: LLMConfig = body.llmConfig;
    const userProfile: UserProfile = body.userProfile;

    if (!jobUrl || !llmConfig || !userProfile) {
      return NextResponse.json(
        { error: "Missing required fields: jobUrl, llmConfig, and userProfile." },
        { status: 400 }
      );
    }

    const applier = new LocalAutoApplier(llmConfig, userProfile);
    
    // We run headless by default, but the developer could pass a param in the body if desired
    const headless = body.headless !== false; 
    
    // The engine runs playwright and will take a screenshot of the filled form
    const resultBase64Image = await applier.runApplication(jobUrl, headless);

    return NextResponse.json({
      success: true,
      message: "Successfully mapped and filled out the application.",
      screenshot: resultBase64Image
    });
  } catch (error: unknown) {
    console.error("Local Auto Apply Error:", error);
    
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
