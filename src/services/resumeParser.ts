import { generateText } from "ai";
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
  // --- Onboarding inference fields ---
  inferredSeniority: z
    .enum(["junior", "mid", "senior", "staff", "principal"])
    .nullable()
    .catch(null)
    .optional(),
  inferredSalary: z
    .number()
    .int()
    .nullable()
    .catch(null)
    .optional(),
  workArrangement: z
    .enum(["remote", "hybrid", "onsite", "any"])
    .nullable()
    .catch(null)
    .optional(),
  dealbreakers: z
    .array(z.string())
    .nullable()
    .catch([])
    .optional(),
});

export type ResumeData = z.infer<typeof ResumeSchema>;

export async function extractResumeData(rawText: string): Promise<ResumeData> {
  const prompt = `You are a precise resume parser. Extract structured data from the resume text below.

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (optional)",
  "phone": "string (optional)",
  "skills": ["string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string",
      "endDate": "string (optional)",
      "bulletPoints": ["string"]
    }
  ],
  "inferredSeniority": "junior | mid | senior | staff | principal",
  "inferredSalary": number (integer USD baseline salary),
  "workArrangement": "remote | hybrid | onsite | any",
  "dealbreakers": ["string"]
}

Rules for inference:
- Base inferredSeniority on total years of experience and the most senior title held. If unknown, output null.
- Base inferredSalary on the US market rate for this candidate's level and primary skills (integer, USD/year). If unknown, output null.
- Base workArrangement on any explicit mentions. Use ONLY "remote", "hybrid", "onsite", or "any". Default to "any" if ambiguous.
- Base dealbreakers only on explicit statements; return [] if none.

Resume text:
${rawText}

OUTPUT STRICT JSON ONLY. NO MARKDOWN. NO BACKTICKS. NO INTRO TEXT.`;

  const { text } = await generateText({
    model: getAIModel(),
    prompt,
  });

  // Clean the output in case the LLM wrapped it in markdown code blocks anyway
  const cleanJson = text.replace(/^```(json)?|```$/gi, "").trim();
  
  const parsed = JSON.parse(cleanJson);
  return ResumeSchema.parse(parsed);
}
