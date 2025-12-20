"use client";

import { useState } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { MeetingForm } from "./meeting-form";
import { MeetingGetOne } from "../../types";
import {
  Settings2,
  History,
  AlertCircle,
  Fingerprint,
  Info,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UpdateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: MeetingGetOne;
}

export const UpdateMeetingDialog = ({
  open,
  onOpenChange,
  initialValues,
}: UpdateMeetingDialogProps) => {
  const [activeTab, setActiveTab] = useState<"general" | "advanced">("general");

  return (
    <ResponsiveDialog
      title="System Override"
      description="Modify session parameters and neural configurations."
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="relative space-y-6 pt-2">
        {/* ✅ CUSTOM HEADER (moved here) */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shadow-sm border border-amber-200/50">
            <Settings2 className="size-4 animate-[spin_4s_linear_infinite]" />
          </div>

          <div className="flex flex-col">
            <span className="font-black tracking-tight text-lg">
              System Override
            </span>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint className="size-3" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                ID: {initialValues.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border w-fit">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
              activeTab === "general"
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground"
            )}
          >
            General Details
          </button>

          <button
            onClick={() => setActiveTab("advanced")}
            className={cn(
              "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
              activeTab === "advanced"
                ? "bg-background shadow-sm text-amber-600"
                : "text-muted-foreground"
            )}
          >
            Permissions
          </button>
        </div>

        {/* INFO BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3 rounded-2xl bg-blue-500/5 border border-blue-200/30 text-blue-700"
        >
          <Info className="size-4 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong>Live Sync Active:</strong> Changes propagate in real time.
          </p>
        </motion.div>

        {/* FORM */}
        <AnimatePresence mode="wait">
          {activeTab === "general" ? (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <MeetingForm
                initialValues={initialValues}
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="py-10 text-center border-2 border-dashed rounded-3xl"
            >
              <AlertCircle className="size-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm font-bold text-muted-foreground">
                Advanced Node Settings
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Requires Admin Level-2 Authorization
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUDIT LOG */}
        <div className="flex items-center justify-between pt-4 border-t border-dashed">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3" />
            <span className="text-[10px] font-bold uppercase">
              Last modified: {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border">
            <History className="size-3" /> Revision v2.4
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
