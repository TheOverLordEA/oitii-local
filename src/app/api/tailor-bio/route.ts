export const runtime = "edge";

import { generateText } from "ai";
import { getAIModel } from "@/lib/aiProvider";

export async function POST(req: Request) {
  try {
    const { currentBio } = await req.json();
    
    if (!currentBio) {
      return new Response(JSON.stringify({ error: "Missing currentBio" }), { status: 400 });
    }

    const { text } = await generateText({
      model: getAIModel(),
      system: `You are an expert resume writer and career coach. 
      Your task is to take a user's raw bio or professional summary and rewrite it to be high-impact, professional, and optimized for Applicant Tracking Systems (ATS).
      
      RULES:
      1. Keep it professional but modern.
      2. Use strong action verbs.
      3. Focus on achievements rather than just duties.
      4. Keep the output concise (max 3-4 sentences).
      5. Output ONLY the polished bio text. No introduction or outro.`,
      prompt: `Polish this resume bio: "${currentBio}"`,
    });

    return new Response(JSON.stringify({ polishedBio: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Tailor Bio API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to polish bio" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
