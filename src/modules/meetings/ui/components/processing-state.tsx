"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Cpu, 
  Network, 
  Database, 
  ShieldCheck, 
  Sparkles,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import { cn } from "@/lib/utils";

interface Props {
  meetingId: string;
}

const LOADING_STEPS = [
  { label: "Establishing neural link...", icon: Network },
  { label: "Syncing with AI Orchestrator...", icon: Cpu },
  { label: "Indexing meeting database...", icon: Database },
  { label: "Securing session protocols...", icon: ShieldCheck },
  { label: "Finalizing workspace...", icon: Sparkles },
];

export const ProcessingState = ({ meetingId }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Status logs rotation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[400px] w-full p-4">
      <Card className="relative w-full max-w-lg overflow-hidden border-border/40 bg-background/50 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-10">
        
        {/* Top Floating Glow */}
        <div className="absolute -top-24 -left-24 size-48 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-emerald-500/10 blur-[100px] rounded-full" />

        <div className="relative flex flex-col items-center text-center space-y-6">
          
          {/* Main Animated Icon */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="size-24 rounded-full border-t-2 border-r-2 border-primary shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="size-8 text-primary animate-pulse" />
            </div>
          </div>

          {/* Title & Meeting ID */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
              Preparing Your Session
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              ID: {meetingId.slice(0, 12)}...
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
              transition={{ duration: 1.5 }}
            />
          </div>

          {/* Dynamic Status Steps */}
          <div className="w-full space-y-3 pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-3 text-sm font-semibold text-foreground"
              >
                {(() => {
                  const Icon = LOADING_STEPS[currentStep].icon;
                  return <Icon className="size-4 text-primary animate-bounce" />;
                })()}
                {LOADING_STEPS[currentStep].label}
              </motion.div>
            </AnimatePresence>

            {/* Sub-log history (Subtle) */}
            <div className="flex flex-col gap-1 opacity-40">
              {LOADING_STEPS.slice(0, currentStep).map((step, idx) => (
                <div key={idx} className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest line-through decoration-primary/50 text-muted-foreground">
                   <ShieldCheck className="size-3 text-emerald-500" />
                   {step.label}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="pt-4 flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl border border-dashed border-border">
            <Loader2 className="size-3 animate-spin" />
            Optimizing experience for your connection speed
          </div>
        </div>
      </Card>
    </div>
  );
};
