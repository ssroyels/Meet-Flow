"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, PhoneCall, Radio, Activity } from "lucide-react";

interface Props {
  meetingId: string;
  onContactAgent?: () => void;
}

export const ActiveState = ({ meetingId, onContactAgent }: Props) => {
  return (
    <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md shadow-2xl shadow-emerald-500/10">
      {/* 1. TOP LIVE INDICATOR */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Live Session Active
          </span>
        </div>
        <Radio className="size-4 text-emerald-500 animate-pulse" />
      </div>

      {/* 2. CENTER VISUALIZER (Bawaal Look) */}
      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        <div className="flex items-end gap-1 h-8">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((i, idx) => (
            <motion.div
              key={idx}
              initial={{ height: "20%" }}
              animate={{ height: ["20%", "100%", "20%"] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: idx * 0.1,
              }}
              className="w-1 bg-emerald-500 rounded-full"
            />
          ))}
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">Session Identifier</p>
          <code className="text-lg font-mono font-bold tracking-wider text-foreground">
            {meetingId.slice(0, 8)}...
          </code>
        </div>
      </div>

      {/* 3. ACTION BUTTONS */}
      <div className="grid grid-cols-1 gap-3 mt-6 relative z-10">
        <Link href={`/call/${encodeURIComponent(meetingId)}`} className="w-full">
          <Button 
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 gap-2"
          >
            <Video className="size-5" />
            Join Live Call
          </Button>
        </Link>

        <Button
          variant="outline"
          onClick={() => onContactAgent?.()}
          className="h-12 rounded-xl border-emerald-500/30 hover:bg-emerald-500/10 font-bold gap-2 group transition-all"
        >
          <PhoneCall className="size-4 transition-transform group-hover:rotate-12" />
          Ping Agent
        </Button>
      </div>

      {/* 4. BACKGROUND DECOR (The "Zahar" Touch) */}
      <div className="absolute -bottom-6 -right-6 opacity-10 text-emerald-500">
        <Activity className="size-24" />
      </div>
    </Card>
  );
};