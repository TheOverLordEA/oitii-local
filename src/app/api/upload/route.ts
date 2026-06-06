import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require("pdf-parse/lib/pdf-parse.js");
import { getOrCreateSessionId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { extractResumeData } from "@/services/resumeParser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 415 });
    }

    // 1. Convert File → Buffer → extract raw text locally (no external call)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = await pdfParse(buffer);
    const rawText = parsed.text?.trim() ?? "";

    if (!rawText) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. Try a text-based PDF, not a scanned image." },
        { status: 422 }
      );
    }

    const sessionId = await getOrCreateSessionId();

    // 2. Persist the raw text to Resume table
    const resume = await prisma.resume.create({
      data: {
        sessionId,
        fileName: file.name,
        localPath: "",
        parsedText: rawText,
      },
    });

    // 3. Run local AI inference to extract structured profile fields
    const structured = await extractResumeData(rawText);

    // 4. Persist parsed JSON back onto the Resume row
    await prisma.resume.update({
      where: { id: resume.id },
      data: { parsedJson: JSON.stringify(structured) },
    });

    // 5. Upsert UserProfile with all LLM-inferred fields
    await prisma.userProfile.upsert({
      where: { sessionId },
      create: {
        sessionId,
        resumeId: resume.id,
        basicDetails: JSON.stringify({
          firstName: structured.firstName,
          lastName: structured.lastName,
          email: structured.email,
          phone: structured.phone,
        }),
        inferredSeniority: structured.inferredSeniority ?? null,
        inferredSalary: structured.inferredSalary ?? null,
        dealbreakers: structured.dealbreakers ? JSON.stringify(structured.dealbreakers) : null,
        workStyle: structured.workArrangement ?? null,
      },
      update: {
        resumeId: resume.id,
        basicDetails: JSON.stringify({
          firstName: structured.firstName,
          lastName: structured.lastName,
          email: structured.email,
          phone: structured.phone,
        }),
        inferredSeniority: structured.inferredSeniority ?? null,
        inferredSalary: structured.inferredSalary ?? null,
        dealbreakers: structured.dealbreakers ? JSON.stringify(structured.dealbreakers) : null,
        workStyle: structured.workArrangement ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      profile: {
        name: `${structured.firstName} ${structured.lastName}`.trim(),
        seniority: structured.inferredSeniority,
        salary: structured.inferredSalary,
        workArrangement: structured.workArrangement,
        dealbreakers: structured.dealbreakers,
      },
    });
  } catch (error) {
    console.error("Upload API Error (Full Details):", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process resume: ${msg}` },
      { status: 500 }
    );
  }
}
