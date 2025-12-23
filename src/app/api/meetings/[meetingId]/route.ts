import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Context {
  params: Promise<{
    meetingId: string;
  }>;
}

export async function GET(
  _req: Request,
  { params }: Context
) {
  try {
    // ✅ Next.js 15: await params
    const { meetingId } = await params;

    // 🔐 Auth check
    const session = await auth.api.getSession({
      headers: await headers(), // ✅ NO await
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 📌 Fetch meeting
    const [meeting] = await db
      .select({
        id: meetings.id,
        name: meetings.name,
        summary: meetings.summary,
        recordingUrl: meetings.recordingUrl,
        createdAt: meetings.createdAt,
      })
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // ✅ Minimal safe response
    return NextResponse.json({
      id: meeting.id,
      name: meeting.name,
      summary: meeting.summary ?? "",
      recordingUrl: meeting.recordingUrl ?? null,
      createdAt: meeting.createdAt,
    });
  } catch (err) {
    console.error("GET /api/meetings/[meetingId] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
