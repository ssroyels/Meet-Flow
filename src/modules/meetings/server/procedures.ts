import { z } from "zod";
import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import JSONL from "jsonl-parse-stringify";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  sql,
} from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import { TRPCError } from "@trpc/server";
import { MeetingsInsertSchema } from "../schema";
import { MeetingStatus, StreamTranscriptItem } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { streamChat } from "@/lib/stream-chat";
import { generateAvatarUri } from "@/lib/avatar";

/* =============================================================================
   MEETINGS ROUTER (FINAL)
============================================================================= */

export const meetingsRouter = createTRPCRouter({
  /* -------------------------------------------------------------------------- */
  /* CHAT TOKEN                                                                 */
  /* -------------------------------------------------------------------------- */
  generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {
    await streamChat.upsertUser({
      id: ctx.auth.user.id,
      role: "admin",
    });

    return streamChat.createToken(ctx.auth.user.id);
  }),

  /* -------------------------------------------------------------------------- */
  /* VIDEO TOKEN                                                                */
  /* -------------------------------------------------------------------------- */
  generateToken: protectedProcedure.mutation(async ({ ctx }) => {
    await streamVideo.upsertUsers([
      {
        id: ctx.auth.user.id,
        name: ctx.auth.user.name,
        role: "admin",
        image:
          ctx.auth.user.image ??
          generateAvatarUri({
            seed: ctx.auth.user.name ?? ctx.auth.user.id,
            variant: "initials",
          }),
      },
    ]);

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    return streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      iat,
      exp,
    });
  }),

  /* -------------------------------------------------------------------------- */
  /* GET TRANSCRIPTS                                                            */
  /* -------------------------------------------------------------------------- */
  getTranscripts: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        );

      if (!meeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      if (!meeting.transcriptUrl) return [];

      const transcript = await fetch(meeting.transcriptUrl)
        .then((res) => res.text())
        .then((text) =>
          JSONL.parse<StreamTranscriptItem>(text)
        )
        .catch(() => []);

      if (!transcript.length) return [];

      const speakerIds = [
        ...new Set(transcript.map((t) => t.speaker_id)),
      ];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((u) => ({
            id: u.id,
            name: u.name,
            image:
              u.image ??
              generateAvatarUri({
                seed: u.name,
                variant: "initials",
              }),
          }))
        );

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((a) => ({
            id: a.id,
            name: a.name,
            image: generateAvatarUri({
              seed: a.name,
              variant: "botttsNeutral",
            }),
          }))
        );

      const speakers = [...userSpeakers, ...agentSpeakers];

      return transcript.map((item) => {
        const speaker = speakers.find(
          (s) => s.id === item.speaker_id
        );

        return {
          start_ts: item.start_ts,
          text: item.text,
          user: speaker
            ? { name: speaker.name, image: speaker.image }
            : {
                name: "Unknown",
                image: generateAvatarUri({
                  seed: "Unknown",
                  variant: "initials",
                }),
              },
        };
      });
    }),

  /* -------------------------------------------------------------------------- */
  /* CREATE                                                                     */
  /* -------------------------------------------------------------------------- */
  create: premiumProcedure("meetings")
    .input(MeetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [meeting] = await db
        .insert(meetings)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      const call = streamVideo.video.call(
        "default",
        meeting.id
      );

      await call.create({
        data: {
          created_by_id: ctx.auth.user.id,
          custom: {
            meetingId: meeting.id,
            meetingName: meeting.name,
          },
          settings_override: {
            transcription: {
              language: "en",
              mode: "auto-on",
              closed_caption_mode: "auto-on",
            },
            recording: {
              mode: "auto-on",
              quality: "1080p",
            },
          },
        },
      });

      return meeting;
    }),

  /* -------------------------------------------------------------------------- */
  /* UPDATE                                                                     */
  /* -------------------------------------------------------------------------- */
  update: protectedProcedure
    .input(
      MeetingsInsertSchema.omit({ agentId: true })
        .partial()
        .extend({ id: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      if (!Object.keys(data).length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      const [updated] = await db
        .update(meetings)
        .set(data)
        .where(
          and(
            eq(meetings.id, id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .returning(getTableColumns(meetings));

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      return updated;
    }),

  /* -------------------------------------------------------------------------- */
  /* DELETE                                                                     */
  /* -------------------------------------------------------------------------- */
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [deleted] = await db
        .delete(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        )
        .returning(getTableColumns(meetings));

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      return deleted;
    }),

  /* -------------------------------------------------------------------------- */
  /* GET ONE                                                                    */
  /* -------------------------------------------------------------------------- */
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [meeting] = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`
            EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))
          `.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
          )
        );

      if (!meeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      return meeting;
    }),

  /* -------------------------------------------------------------------------- */
  /* GET MANY                                                                   */
  /* -------------------------------------------------------------------------- */
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z.nativeEnum(MeetingStatus).nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize, status, agentId } = input;

      const where = and(
        eq(meetings.userId, ctx.auth.user.id),
        search ? ilike(meetings.name, `%${search}%`) : undefined,
        status ? eq(meetings.status, status) : undefined,
        agentId ? eq(meetings.agentId, agentId) : undefined
      );

      const items = await db
        .select({
          ...getTableColumns(meetings),
          agent: agents,
          duration: sql<number>`
            EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))
          `.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(where)
        .orderBy(desc(meetings.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(meetings)
        .where(where);

      return {
        items,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };
    }),

    /* -------------------------------------------------------------------------- */
/* GET COMPLETED MEETING (DASHBOARD)                                           */
/* -------------------------------------------------------------------------- */
getCompletedMeeting: protectedProcedure
  .input(
    z.object({
      meetingId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const [meeting] = await db
      .select({
        id: meetings.id,
        title: meetings.name,
        summary: meetings.summary,
        recordingUrl: meetings.recordingUrl,
        transcriptUrl: meetings.transcriptUrl,
        createdAt: meetings.createdAt,
        duration: sql<number>`
          EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))
        `.as("duration"),
        agentId:meetings.agentId,
        userName:meetings.userId,
      })
      .from(meetings)
      .where(
        and(
          eq(meetings.id, input.meetingId),
          eq(meetings.userId, ctx.auth.user.id),
          eq(meetings.status, "completed")
        )
      );

    if (!meeting) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Completed meeting not found",
      });
    }

    return meeting;
  }),


});

