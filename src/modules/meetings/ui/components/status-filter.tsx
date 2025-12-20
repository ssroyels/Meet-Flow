"use client";

import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { MeetingStatus } from "../../types";
import type { LucideIcon } from "lucide-react";

import {
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import CommandSelect from "@/components/command-select";
import { cn } from "@/lib/utils";

/* =============================================================================
   TYPES
============================================================================= */

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  description: string;
};

interface QuickTabProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  color: string;
}

/* =============================================================================
   STATUS META CONFIG
============================================================================= */

const STATUS_META: Record<MeetingStatus, StatusMeta> = {
  upcoming: {
    label: "Upcoming",
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Scheduled but not yet started",
  },
  active: {
    label: "Active",
    icon: Loader2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    description: "Currently in progress & recording",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    description: "Successfully finished & saved",
  },
  processing: {
    label: "Processing",
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    description: "AI is generating notes & insights",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    description: "Session was terminated or skipped",
  },
};

/* =============================================================================
   OPTIONS
============================================================================= */

const statusOptions: {
  label: string;
  value: MeetingStatus | "";
  description: string;
}[] = [
  {
    label: "All Status",
    value: "",
    description: "Show every meeting node",
  },
  ...Object.entries(STATUS_META).map(([key, meta]) => ({
    label: meta.label,
    value: key as MeetingStatus,
    description: meta.description,
  })),
];

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export const StatusFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();

  const current = filters.status ?? null;
  const selectedMeta = current ? STATUS_META[current] : null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {/* DROPDOWN */}
        <div className="relative group">
          <div
            className={cn(
              "absolute -inset-0.5 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500",
              current && "opacity-50"
            )}
          />

          <CommandSelect
            placeholder="Filter Status"
            className={cn(
              "h-10 w-[140px] md:w-[180px] rounded-xl border-border/60 bg-background/50 backdrop-blur-sm transition-all",
              current && "border-primary/50 ring-1 ring-primary/20"
            )}
            options={statusOptions}
            value={current ?? ""}
            onChange={(value) =>
              setFilters({
                status: value ? (value as MeetingStatus) : undefined,
              })
            }
          />
        </div>

        {/* ACTIVE BADGE */}
        <AnimatePresence mode="wait">
          {selectedMeta && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-10 px-3 rounded-xl border flex items-center gap-2 transition-all shadow-sm",
                      selectedMeta.bg,
                      selectedMeta.color,
                      "border-current/20"
                    )}
                  >
                    <selectedMeta.icon
                      className={cn(
                        "size-3.5",
                        (current === "active" || current === "processing") && "animate-spin"
                      )}
                    />
                    <span className="font-bold text-[11px] uppercase tracking-wider">
                      {selectedMeta.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilters({ status: undefined })}
                      className="ml-1 hover:bg-current/10 rounded-full p-0.5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="rounded-xl p-3 shadow-xl border-border/50">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-[10px] uppercase tracking-widest opacity-50">
                      Status Info
                    </span>
                    <p className="text-xs font-medium leading-tight max-w-[150px]">
                      {selectedMeta.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QUICK TABS */}
        <div className="hidden lg:flex items-center bg-muted/40 p-1 rounded-xl border border-border/40 ml-2">
          <QuickTab
            active={current === "active"}
            onClick={() => setFilters({ status: "active" as MeetingStatus })}
            icon={Loader2}
            label="Live"
            color="text-emerald-500"
          />
          <QuickTab
            active={current === "processing"}
            onClick={() => setFilters({ status: "processing" as MeetingStatus })}
            icon={Sparkles}
            label="AI"
            color="text-amber-500"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

/* =============================================================================
   QUICK TAB
============================================================================= */

function QuickTab({
  active,
  onClick,
  icon: Icon,
  label,
  color,
}: QuickTabProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 px-3 transition-all",
        active
          ? cn("bg-background shadow-sm", color)
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-3",
          active && (label === "Live" || label === "AI") && "animate-spin"
        )}
      />
      {label}
    </Button>
  );
}
