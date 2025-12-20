"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CalendarDays, 
  Clock, 
  User, 
  XCircle, 
  Play, 
  Share2, 
  ShieldCheck,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  meetingId: string;
  onCancelMeeting: () => void;
  isCancelling: boolean;
}

export const UpcomingState = ({
  meetingId,
  onCancelMeeting,
  isCancelling,
}: Props) => {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  // Feature: Live Countdown Simulation (Extra Feature 1)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().toLocaleTimeString('en-GB');
      setTimeLeft(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/call/${meetingId}`);
    toast.success("Meeting link copied!");
  };

  return (
    <Card className="relative overflow-hidden p-6 flex flex-col gap-6 bg-[#052c1e] border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.2)] rounded-[2rem] text-emerald-50">
      
      {/* Background Animated Gradient (Extra Feature 2) */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 size-40 bg-emerald-500/20 blur-[80px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 size-40 bg-teal-500/10 blur-[80px] rounded-full" />

      {/* TOP SECTION: Status & Timer */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 rounded-full w-fit flex gap-2 items-center">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest">Conf. Secured</span>
          </Badge>
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <CalendarDays className="size-4 text-emerald-400/60" />
            <span className="text-xs font-medium">Scheduled for Today</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-lg">
            <Timer className="size-4" />
            {timeLeft}
          </div>
          <span className="text-[9px] uppercase tracking-tighter text-emerald-500/60 font-black">Local Node Time</span>
        </div>
      </div>

      {/* MIDDLE SECTION: Illustration & ID */}
      <div className="relative flex flex-col items-center gap-4 py-4 z-10">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative size-32 rounded-3xl overflow-hidden border-2 border-emerald-500/20 group shadow-2xl"
        >
          <img
            src="https://img.freepik.com/free-photo/room-used-official-event_23-2151054262.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Upcoming Meeting"
            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#052c1e] via-transparent to-transparent" />
        </motion.div>

        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-1">Access Protocol</p>
          <h2 className="text-2xl font-black tracking-tighter text-white drop-shadow-md">
            {meetingId.toUpperCase()}
          </h2>
        </div>
      </div>

      {/* BOTTOM SECTION: Actions (Extra Feature 3: Action Grid) */}
      <div className="grid grid-cols-1 gap-3 z-10">
        
        <Link href={`/call/${meetingId}`} className="w-full">
          <Button
            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#052c1e] font-black text-base shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-95 gap-3"
          >
            <Play className="size-5 fill-current" />
            LAUNCH SESSION
          </Button>
        </Link>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="rounded-xl border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-200 font-bold text-xs gap-2"
          >
            <Share2 className="size-3.5" />
            Copy Link
          </Button>

          <Button
            variant="outline"
            className="rounded-xl border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-200 font-bold text-xs gap-2"
          >
            <User className="size-3.5" />
            Agent Info
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCancelMeeting}
          disabled={isCancelling}
          className="mt-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-bold text-[10px] uppercase tracking-widest gap-2 opacity-60 hover:opacity-100 transition-all"
        >
          {isCancelling ? (
            <span className="animate-pulse">Aborting Node...</span>
          ) : (
            <>
              <XCircle className="size-3" />
              Terminate Meeting
            </>
          )}
        </Button>
      </div>

      {/* Security Footer */}
      <div className="flex justify-center items-center gap-2 pt-2 opacity-30">
        <ShieldCheck className="size-3" />
        <span className="text-[9px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
      </div>
    </Card>
  );
};

// Simple Badge component if not already in your UI library
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>{children}</div>;
}
