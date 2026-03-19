// Next.js API Route: The webhook endpoint for OpenClaw messages
import { NextResponse } from 'next/server';
import { OitiiClient } from '@/lib/api_client';
import { LocalAutoApplier } from '@/lib/auto_apply';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // AI Editor: Parse OpenClaw intent from 'body'
        // Route to OitiiClient for job searches OR AutoApplier for applying

        return NextResponse.json({
            success: true,
            message: "Action received and processing."
        });
    } catch (error) {
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
}