"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  MonitorCheck,
} from "lucide-react";

import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { cn } from "@/lib/utils";

/* =============================================================================
   TYPES
============================================================================= */

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StepItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export const NewMeetingDialog = ({
  open,
  onOpenChange,
}: NewMeetingDialogProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (id?: string) => {
    setIsSubmitting(true);

    setTimeout(() => {
      onOpenChange(false);
      setIsSubmitting(false);

      if (id) {
        router.push(`/meetings/${id}`);
      }
    }, 1200);
  };

  return (
    <ResponsiveDialog
      title="Initialize Meeting"
      description="Deploy a new AI-powered session to your neural network."
      open={open}
      onOpenChange={onOpenChange}
    >
      {/* CUSTOM HEADER (JSX moved here safely) */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Sparkles className="size-4 text-primary animate-pulse" />
        </div>
        <span className="font-black tracking-tight text-lg">
          Initialize Meeting
        </span>
      </div>

      <div className="relative overflow-hidden p-1">
        {/* STEP INDICATOR */}
        <div className="flex items-center justify-between mb-8 px-2">
          <StepItem icon={ShieldCheck} label="Identity" active />
          <div className="h-px flex-1 bg-border mx-4 mt-[-10px]" />
          <StepItem icon={Zap} label="Orchestrator" active />
          <div className="h-px flex-1 bg-border mx-4 mt-[-10px]" />
          <StepItem icon={MonitorCheck} label="Launch" />
        </div>

        {/* SUCCESS OVERLAY */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-xl"
            >
              <div className="relative">
                <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto size-6 text-primary" />
              </div>

              <p className="mt-4 font-black text-lg animate-bounce">
                Deploying Session...
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to meeting dashboard
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM */}
        <div
          className={cn(
            "transition-all duration-500",
            isSubmitting
              ? "blur-md scale-95 opacity-50"
              : "opacity-100"
          )}
        >
          <MeetingForm
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-6 p-3 rounded-xl bg-muted/30 border border-dashed border-border flex items-center gap-3">
          <div className="size-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
            <ArrowRight className="size-4 text-muted-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            By creating this meeting, you agree to allocate AI resources for
            real-time transcription and analysis.
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
};

/* =============================================================================
   STEP ITEM
============================================================================= */

function StepItem({ icon: Icon, label, active = false }: StepItemProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "size-8 rounded-xl flex items-center justify-center transition-all duration-500",
          active
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
            : "bg-muted text-muted-foreground opacity-50"
        )}
      >
        <Icon className="size-4" />
      </div>

      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-tighter",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
