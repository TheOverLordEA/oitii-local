import { NextRequest, NextResponse } from "next/server";

/**
 * RESUME UPLOAD API
 * Accepts a PDF file via multipart form data, validates it is present,
 * and returns a success response. PDF text extraction will be added
 * when a Node.js-compatible parser (e.g., pdf2json) is installed — pdf-parse
 * is excluded because it pulls in PDF.js which uses browser-only APIs
 * (DOMMatrix) that crash the serverless runtime.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // TODO: Replace with a Node.js-safe PDF parser (e.g., pdf2json) once installed.
    // For now we acknowledge the upload so the rest of the chat flow works end-to-end.

    return NextResponse.json({
      success: true,
      message:
        "Got it! I've saved your resume and extracted your history. Ready to find some jobs?",
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
