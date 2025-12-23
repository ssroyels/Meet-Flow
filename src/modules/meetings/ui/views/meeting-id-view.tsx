"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  User, 
  Trash2, 
  Edit3, 
  RefreshCcw, 
  ChevronLeft,
  ShieldCheck,
  Zap,
  Activity,
  LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import { 
  useMutation, 
  useQueryClient, 
  useSuspenseQuery 
} from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { UpcomingState } from "../components/upcoming-state";
import { ActiveState } from "../components/active-state";
import { CancelledState } from "../components/cancel-state";
import { ProcessingState } from "../components/processing-state";
import CompletedMeetingDashboard from "../components/completed-state";
import { cn } from "@/lib/utils";


interface Props {
  meetingId: string;
}

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
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        await queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions());
        toast.success("Meeting permanentally deleted");
        router.push("/meetings");
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleRemove = () => removeMeeting.mutate({ id: meetingId });

  const startedAt = meeting.startedAt ? new Date(meeting.startedAt) : null;
  const dateLabel = startedAt ? new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(startedAt) : "Not scheduled";

  const status = meeting.status ?? "unknown";

  // Dynamic Status Configurations
  const statusStyles: Record<string, { color: string; icon: LucideIcon }> = {
    active: { color: "text-emerald-500", icon: Activity },
    completed: { color: "text-blue-500", icon: ShieldCheck },
    upcoming: { color: "text-amber-500", icon: Zap },
    processing: { color: "text-purple-500", icon: RefreshCcw },
    cancelled: { color: "text-rose-500", icon: Trash2 },
  };

  const StatusIcon = statusStyles[status]?.icon || Activity;

  return (
    <div className="relative min-h-screen bg-background">
      {/* 1. ANIMATED AMBIENT GLOW */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute -top-[10%] -right-[10%] h-[500px] w-[500px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000",
          status === "active" ? "bg-emerald-500" : "bg-primary"
        )} />
      </div>

      <UpdateMeetingDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialValues={meeting}
      />

      <div className="relative z-10 flex flex-col gap-y-8 px-4 py-8 md:px-10 lg:max-w-7xl lg:mx-auto">
        
        {/* 2. TOP NAVIGATION BAR */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/meetings")}
            className="group rounded-full hover:bg-muted font-bold"
          >
            <ChevronLeft className="mr-1 size-4 transition-transform group-hover:-translate-x-1" />
            Back to Hub
          </Button>

          <div className="flex items-center gap-x-3">
             <Badge variant="outline" className="bg-background/50 backdrop-blur-md px-3 py-1 rounded-full border-primary/20">
                <StatusIcon className={cn("mr-2 size-3 animate-pulse", statusStyles[status]?.color)} />
                <span className="uppercase tracking-widest text-[10px] font-black">{status}</span>
             </Badge>
          </div>
        </div>

        {/* 3. HERO SECTION (BENTO HEADER) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-neutral-900 p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Zap className="size-40 rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter capitalize leading-none">
                {meeting.name || "Untitled Session"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-neutral-400">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                   <CalendarDays className="size-4 text-emerald-400" />
                   <span className="text-sm font-medium">{dateLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsEditOpen(true)}
                className="rounded-2xl bg-white/10 px-6 py-6 font-bold hover:bg-white/20 backdrop-blur-md transition-all"
              >
                <Edit3 className="mr-2 size-4" /> Edit Details
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="rounded-2xl px-6 py-6 font-bold shadow-lg shadow-rose-500/20"
                  >
                    <Trash2 className="mr-2 size-4" />
                    {removeMeeting.isPending ? "Purging..." : "Delete"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-rose-500/20 shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black">Permanent Deletion?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base font-medium">
                      This will erase all transcripts and agent memory associated with this session.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-xl font-bold">Abort</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemove}
                      className="rounded-xl bg-rose-600 font-bold hover:bg-rose-700"
                    >
                      Confirm Purge
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </motion.div>

        {/* 4. MAIN DASHBOARD GRID */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
          
          {/* LEFT: CORE INTELLIGENCE */}
          <div className="space-y-6">
            <Card className="p-8 rounded-[2rem] border-none bg-muted/30 backdrop-blur-xl shadow-inner">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> Session Intelligence
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-4 rounded-2xl bg-background/50 border border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Assigned Agent</p>
                    <div className="flex items-center gap-3">
                       <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {meeting?.agent?.name?.charAt(0)}
                       </div>
                       <span className="font-bold text-foreground">{meeting?.agent?.name || "System Default"}</span>
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-background/50 border border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Session Length</p>
                    <div className="flex items-center gap-3 font-bold text-foreground">
                       <Clock className="size-4 text-primary" />
                       <span>{meeting.duration ? `${Math.round(meeting.duration / 60)}m` : "LIVE"}</span>
                    </div>
                 </div>
              </div>

              {meeting.name && (
                <div className="mt-8 space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Brief</p>
                   <div className="p-5 rounded-2xl bg-background border leading-relaxed text-muted-foreground italic font-medium">
                     {"{meeting.name}"}
                   </div>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Button variant="outline" onClick={() => router.refresh()} className="h-14 rounded-2xl border-dashed font-bold hover:border-primary transition-all gap-2">
                  <RefreshCcw className="size-4" /> Force Sync Data
               </Button>
               <Button variant="outline" className="h-14 rounded-2xl border-dashed font-bold hover:border-primary transition-all gap-2">
                  <User className="size-4" /> Transfer Ownership
               </Button>
            </div>
          </div>

          {/* RIGHT: DYNAMIC STATE HANDLER */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {status === "upcoming" && (
                  <UpcomingState
                    meetingId={meetingId}
                    onCancelMeeting={handleRemove}
                    isCancelling={removeMeeting.isPending}
                  />
                )}
                {status === "active" && <ActiveState meetingId={meetingId} />}
                {status === "completed" && <CompletedMeetingDashboard meetingId={meetingId} />}
                {status === "cancelled" && <CancelledState meetingId={meetingId} />}
                {status === "processing" && <ProcessingState meetingId={meetingId} />}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

export const MeetingIdViewLoading = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
     <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
        <LoadingState title="Decrypting Session" description="Accessing encrypted meeting protocols..." />
     </div>
  </div>
);

export const MeetingIdViewError = () => (
  <div className="h-screen w-full flex items-center justify-center p-8">
    <ErrorState title="System Link Severed" description="We could not establish a connection to this meeting ID." />
  </div>
);