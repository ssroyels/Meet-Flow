import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { streamVideo } from "@/lib/stream-video";
import { geminiModel } from "@/lib/gemini";
import { streamChat } from "@/lib/stream-chat";
import { generateAvatarUri } from "@/lib/avatar";

import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */
type StreamWebhookPayload = {
  type?: string;
  call?: {
    custom?: {
      meetingId?: string;
    };
  };
  call_cid?: string;
  call_transcription?: {
    url?: string;
  };
  user?: {
    id?: string;
  };
  channel_id?: string;
  message?: {
    text?: string;
  };
};

/* -------------------------------------------------------------------------- */
/* VERIFY STREAM SIGNATURE                                                     */
/* -------------------------------------------------------------------------- */
function verifySignature(body: string, signature: string) {
  return streamVideo.verifyWebhook(body, signature);
}

/* -------------------------------------------------------------------------- */
/* WEBHOOK                                                                     */
/* -------------------------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const body = await req.text();

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: StreamWebhookPayload;

  try {
    payload = JSON.parse(body) as StreamWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.type;

  /* ------------------------------------------------------------------------ */
  /* CALL START                                                                */
  /* ------------------------------------------------------------------------ */
  if (eventType === "call.session_started") {
    const meetingId = payload.call?.custom?.meetingId;
    if (!meetingId) return NextResponse.json({ status: "ok" });

    await db
      .update(meetings)
      .set({ status: "active", startedAt: new Date() })
      .where(eq(meetings.id, meetingId));

    return NextResponse.json({ status: "ok" });
  }

  /* ------------------------------------------------------------------------ */
  /* CALL ENDED                                                                */
  /* ------------------------------------------------------------------------ */
  if (eventType === "call.session_ended") {
    const meetingId = payload.call?.custom?.meetingId;
    if (!meetingId) return NextResponse.json({ status: "ok" });

    await db
      .update(meetings)
      .set({ status: "processing", endedAt: new Date() })
      .where(eq(meetings.id, meetingId));

    return NextResponse.json({ status: "ok" });
  }

  /* ------------------------------------------------------------------------ */
  /* TRANSCRIPTION READY                                                       */
  /* ------------------------------------------------------------------------ */
  if (eventType === "call.transcription_ready") {
    const meetingId = payload.call_cid?.split(":")?.[1];
    const transcriptUrl = payload.call_transcription?.url;

    if (!meetingId || !transcriptUrl) {
      return NextResponse.json({ status: "ok" });
    }

    const [meeting] = await db
      .update(meetings)
      .set({ transcriptUrl })
      .where(eq(meetings.id, meetingId))
      .returning();

    if (meeting) {
      await inngest.send({
        name: "meetings/processing",
        data: {
          meetingId: meeting.id,
          transcriptUrl,
        },
      });
    }

    return NextResponse.json({ status: "ok" });
  }

  /* ------------------------------------------------------------------------ */
  /* CHAT → GEMINI                                                             */
  /* ------------------------------------------------------------------------ */
  if (eventType === "message.new") {
    const userId = payload.user?.id;
    const channelId = payload.channel_id;
    const text = payload.message?.text;

    if (!userId || !channelId || !text) {
      return NextResponse.json({ status: "ok" });
    }

    const [meeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    if (!meeting) return NextResponse.json({ status: "ok" });

    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, meeting.agentId));

    if (!agent || userId === agent.id) {
      return NextResponse.json({ status: "ok" });
    }

    const channel = streamChat.channel("messaging", channelId);
    await channel.watch();

    const history = channel.state.messages
      .slice(-5)
      .map((m) => `${m.user?.name}: ${m.text}`)
      .join("\n");

    const prompt = `
Meeting summary:
${meeting.summary}

Agent instructions:
${agent.instructions}

Conversation history:
${history}

User question:
${text}
`;

    const result = await geminiModel.generateContent(prompt);
    const reply = result.response.text();

    if (!reply) return NextResponse.json({ status: "ok" });

    const avatarUrl = generateAvatarUri({
      seed: agent.name,
      variant: "botttsNeutral",
    });

    await streamChat.upsertUser({
      id: agent.id,
      name: agent.name,
      image: avatarUrl,
    });

    await channel.sendMessage({
      text: reply,
      user: {
        id: agent.id,
        name: agent.name,
        image: avatarUrl,
      },
    });
  }

  return NextResponse.json({ status: "ok" });
}
