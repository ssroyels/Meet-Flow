"use client";

import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import type { MeetingStatus } from "../../types";
import {
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import CommandSelect from "@/components/command-select";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* STATUS META                                                                 */
/* -------------------------------------------------------------------------- */

const STATUS_META: Record<
  MeetingStatus,
  {
    label: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    description: string;
  }
> = {
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

/* -------------------------------------------------------------------------- */
/* OPTIONS                                                                     */
/* -------------------------------------------------------------------------- */

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
  ...(
    Object.entries(STATUS_META) as [
      MeetingStatus,
      (typeof STATUS_META)[MeetingStatus]
    ][]
  ).map(([key, meta]) => ({
    label: meta.label,
    value: key,
    description: meta.description,
  })),
];

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                   */
/* -------------------------------------------------------------------------- */

export const StatusFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const current = filters.status;

  // ✅ FIX IS HERE
  const selectedMeta = current ? STATUS_META[current] : null;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {/* SELECT */}
        <CommandSelect
          placeholder="Filter Status"
          options={statusOptions}
          value={current ?? ""}
          onChange={(value) =>
            setFilters({
              status: value ? (value as MeetingStatus) : undefined,
            })
          }
          className={cn(
            "h-10 w-[160px] rounded-xl",
            current && "border-primary ring-1 ring-primary/20"
          )}
        />

        {/* ACTIVE BADGE */}
        <AnimatePresence mode="wait">
          {selectedMeta && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-10 px-3 gap-2 rounded-xl border",
                      selectedMeta.bg,
                      selectedMeta.color
                    )}
                  >
                    <selectedMeta.icon
                      className={cn(
                        "size-3.5",
                        (current === "active" ||
                          current === "processing") &&
                          "animate-spin"
                      )}
                    />
                    <span className="text-[11px] font-black uppercase">
                      {selectedMeta.label}
                    </span>
                    <button
                      onClick={() =>
                        setFilters({ status: undefined })
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedMeta.description}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QUICK TABS */}
        <div className="hidden lg:flex gap-1 ml-2">
          <QuickTab
            active={current === "active"}
            onClick={() =>
              setFilters({ status: "active" })
            }
            icon={Loader2}
            label="Live"
            color="text-emerald-500"
          />
          <QuickTab
            active={current === "processing"}
            onClick={() =>
              setFilters({ status: "processing" })
            }
            icon={Sparkles}
            label="AI"
            color="text-amber-500"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

/* -------------------------------------------------------------------------- */
/* QUICK TAB                                                                  */
/* -------------------------------------------------------------------------- */

interface QuickTabProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  color: string;
}

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
        "h-8 px-3 gap-2 text-[10px] font-black uppercase",
        active
          ? `bg-background shadow-sm ${color}`
          : "text-muted-foreground"
      )}
    >
      <Icon className={cn("size-3", active && "animate-spin")} />
      {label}
    </Button>
  );
}
