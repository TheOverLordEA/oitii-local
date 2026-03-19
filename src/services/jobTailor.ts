import { generateObject } from "ai";
import { getAIModel } from "../lib/aiProvider";
import { ResumeSchema, ResumeData } from "./resumeParser";

export async function tailorResumeForJob(resumeJson: ResumeData, jobDescription: string): Promise<ResumeData> {
  const { object } = await generateObject({
    model: getAIModel(),
    schema: ResumeSchema,
    prompt: `You are an expert resume writer. Tailor the following resume to the job description perfectly.
Do NOT hallucinate or invent new experience. Keep facts accurate, but rewrite bullet points to highlight relevant impact and reorder skills to match the job description.

Job Description:
${jobDescription}

Current Resume JSON:
${JSON.stringify(resumeJson, null, 2)}`,
  });

  return object;
}
