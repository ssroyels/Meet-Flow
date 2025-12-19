import { inngest } from "@/inngest/client";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const meetingProcessing = inngest.createFunction(
  { id: "meeting-processing" },
  { event: "meetings/processing" },

  async ({ event }) => {
    const { meetingId, transcriptUrl } = event.data;

    if (!meetingId) {
      return { error: "Missing meetingId" };
    }

    await db
      .update(meetings)
      .set({
        status: "completed",
        transcriptUrl,
      })
      .where(eq(meetings.id, meetingId));

    return { success: true };
  }
);

