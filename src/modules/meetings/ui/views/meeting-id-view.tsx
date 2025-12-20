"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  // Clock,
  // User,
  Trash2,
  // Edit3,
  RefreshCcw,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Activity,
  LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
// import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  // AlertDialog,
  // AlertDialogTrigger,
  // AlertDialogContent,
  // AlertDialogHeader,
  // AlertDialogTitle,
  // AlertDialogDescription,
  // AlertDialogFooter,
  // AlertDialogCancel,
  // AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { UpcomingState } from "../components/upcoming-state";
import { ActiveState } from "../components/active-state";
import { CancelledState } from "../components/cancel-state";
import { ProcessingState } from "../components/processing-state";
import CompletedMeetingDashboard from "../components/completed-state";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */

interface Props {
  meetingId: string;
}

type MeetingStatus =
  | "active"
  | "completed"
  | "upcoming"
  | "processing"
  | "cancelled"
  | "unknown";

interface StatusStyle {
  color: string;
  icon: LucideIcon;
}

/* ================= COMPONENT ================= */

export const MeetingIdView = ({ meetingId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: meeting } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.premium.getFreeUsage.queryOptions()
        );
        toast.success("Meeting permanently deleted");
        router.push("/meetings");
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleRemove = () => removeMeeting.mutate({ id: meetingId });

  const startedAt = meeting.startedAt
    ? new Date(meeting.startedAt)
    : null;

  const dateLabel = startedAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(startedAt)
    : "Not scheduled";

  const status: MeetingStatus = meeting.status ?? "unknown";

  /* ================= STATUS CONFIG ================= */

  const statusStyles: Record<MeetingStatus, StatusStyle> = {
    active: { color: "text-emerald-500", icon: Activity },
    completed: { color: "text-blue-500", icon: ShieldCheck },
    upcoming: { color: "text-amber-500", icon: Zap },
    processing: { color: "text-purple-500", icon: RefreshCcw },
    cancelled: { color: "text-rose-500", icon: Trash2 },
    unknown: { color: "text-muted-foreground", icon: Activity },
  };

  const StatusIcon = statusStyles[status].icon;

  /* ================= RENDER ================= */

  return (
    <div className="relative min-h-screen bg-background">
      <UpdateMeetingDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialValues={meeting}
      />

      <div className="relative z-10 flex flex-col gap-y-8 px-4 py-8 md:px-10 lg:max-w-7xl lg:mx-auto">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/meetings")}
            className="group rounded-full font-bold"
          >
            <ChevronLeft className="mr-1 size-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>

          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full flex items-center gap-2"
          >
            <StatusIcon
              className={cn("size-3 animate-pulse", statusStyles[status].color)}
            />
            <span className="uppercase text-[10px] font-black tracking-widest">
              {status}
            </span>
          </Badge>
        </div>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] bg-neutral-900 p-8 md:p-12 text-white"
        >
          <h1 className="text-4xl md:text-6xl font-black">
            {meeting.name || "Untitled Session"}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-neutral-400">
            <CalendarDays className="size-4" />
            {dateLabel}
          </div>
        </motion.div>

        {/* STATE HANDLER */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {status === "upcoming" && (
              <UpcomingState
                meetingId={meetingId}
                onCancelMeeting={handleRemove}
                isCancelling={removeMeeting.isPending}
              />
            )}
            {status === "active" && (
              <ActiveState meetingId={meetingId} />
            )}
            {status === "completed" && (
              <CompletedMeetingDashboard meetingId={meetingId} />
            )}
            {status === "cancelled" && (
              <CancelledState meetingId={meetingId} />
            )}
            {status === "processing" && (
              <ProcessingState meetingId={meetingId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ================= LOADING & ERROR ================= */

export const MeetingIdViewLoading = () => (
  <LoadingState
    title="Decrypting Session"
    description="Accessing encrypted meeting protocols..."
  />
);

export const MeetingIdViewError = () => (
  <ErrorState
    title="System Link Severed"
    description="We could not establish a connection to this meeting ID."
  />
);
