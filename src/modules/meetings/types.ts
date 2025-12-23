import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

/* -------------------------------------------------------------------------- */
/* tRPC OUTPUT TYPES                                                          */
/* -------------------------------------------------------------------------- */

export type MeetingGetOne =
  inferRouterOutputs<AppRouter>["meetings"]["getOne"];

export type MeetingGetMany =
  inferRouterOutputs<AppRouter>["meetings"]["getMany"]["items"];

/* -------------------------------------------------------------------------- */
/* MEETING STATUS (STRING UNION – DRIZZLE SAFE)                                */
/* -------------------------------------------------------------------------- */

export const MEETING_STATUSES = [
  "upcoming",
  "active",
  "completed",
  "processing",
  "cancelled",
] as const;

export type MeetingStatus =
  (typeof MEETING_STATUSES)[number];

/* -------------------------------------------------------------------------- */
/* TRANSCRIPT                                                                 */
/* -------------------------------------------------------------------------- */

export type StreamTranscriptItem = {
  speaker_id: string;
  type: string;
  text: string;
  start_ts: number;
  stop_ts: number;
};
