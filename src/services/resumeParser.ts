import { generateObject } from "ai";
import { z } from "zod";
import { getAIModel } from "../lib/aiProvider";

export const ResumeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      bulletPoints: z.array(z.string()),
    })
  ),
});

export type ResumeData = z.infer<typeof ResumeSchema>;

export async function extractResumeData(rawText: string): Promise<ResumeData> {
  const { object } = await generateObject({
    model: getAIModel(),
    schema: ResumeSchema,
    prompt: `Extract the following resume details from the raw text provided. 
    
    Raw text:
    ${rawText}`,
  });

  return object;
}
