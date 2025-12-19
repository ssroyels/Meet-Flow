"use client";

import { motion } from "framer-motion";
import { Ban, AlertCircle, RefreshCw, LifeBuoy, FileX2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
  meetingId: string;
}

export const CancelledState = ({ meetingId }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <Card className="relative overflow-hidden border-destructive/20 bg-destructive/[0.02] backdrop-blur-sm">
        {/* 1. TOP STRIPE (Visual Indicator) */}
        <div className="absolute top-0 left-0 h-1 w-full bg-destructive/30" />

        <div className="p-6 flex flex-col gap-6">
          {/* 2. HEADER SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive shadow-inner">
                <Ban className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">Session Terminated</h3>
                  <Badge variant="destructive" className="h-5 text-[10px] font-black uppercase px-2">
                    Void
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  ID: <span className="line-through opacity-50">{meetingId}</span>
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="w-fit border-destructive/20 text-destructive/80 font-bold bg-destructive/5">
              Non-Recoverable
            </Badge>
          </div>

          <Separator className="bg-destructive/10" />

          {/* 3. MESSAGE & INFO */}
          <div className="flex gap-4 p-4 rounded-2xl bg-destructive/[0.03] border border-destructive/10">
            <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-destructive/90">Policy Enforcement</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This meeting was manually cancelled or timed out. All AI compute resources for this session have been de-allocated and transcripts are no longer accessible.
              </p>
            </div>
          </div>

          {/* 4. RESPONSIVE ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-xl font-bold border-destructive/20 hover:bg-destructive/5 hover:text-destructive gap-2 h-12 transition-all"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="size-4" />
              Check Status
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 rounded-xl font-bold text-muted-foreground hover:bg-muted gap-2 h-12"
            >
              <LifeBuoy className="size-4" />
              Support
            </Button>
          </div>
        </div>

        {/* 5. BACKGROUND DECOR */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none rotate-12">
          <FileX2 className="size-32" />
        </div>
      </Card>

      {/* FOOTER HINT */}
      <p className="mt-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
        Status Log: Termination Finalized 
      </p>
    </motion.div>
  );
};