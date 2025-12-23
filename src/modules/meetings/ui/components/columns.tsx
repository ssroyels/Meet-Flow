"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import humanizeDuration from "humanize-duration";
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockArrowUpIcon,
  Loader2,
  Calendar,
  Activity,
  History,
} from "lucide-react";

import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { MeetingGetMany } from "../../types";
import { cn } from "@/lib/utils";

/* ========================= HELPER: DURATION FORMATTER ========================= */
function formatDuration(seconds: number) {
  return humanizeDuration(seconds * 1000, {
    largest: 1,
    round: true,
    spacer: "",
    language: "shortEn",
    // languages: {
    //   shortEn: { h: () => "h", m: () => "m", s: () => "s" },
    // },
  });
}

/* ========================= CONFIG: STATUS MAPPING ========================= */
const statusConfig = {
  upcoming: {
    icon: ClockArrowUpIcon,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    label: "Scheduled",
  },
  active: {
    icon: Activity,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse",
    label: "Live Now",
  },
  completed: {
    icon: CircleCheckIcon,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Finished",
  },
  processing: {
    icon: Loader2,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    label: "Analyzing",
  },
  cancelled: {
    icon: CircleXIcon,
    className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    label: "Cancelled",
  },
} as const;

/* ========================= TABLE COLUMNS ========================= */
export const columns: ColumnDef<MeetingGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: () => <span className="pl-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Session Details</span>,
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1.5 py-2 pl-2">
        <span className="text-sm font-bold tracking-tight text-foreground truncate max-w-[200px] md:max-w-[300px] capitalize">
          {row.original.name || "Unnamed Session"}
        </span>

        <div className="flex items-center gap-x-3">
          <div className="flex items-center gap-x-1.5 group">
            <div className="relative">
              <GeneratedAvatar
                seed={row.original.agent.name}
                className="size-5 rounded-md border border-border shadow-sm"
              />
              {row.original.status === "active" && (
                <span className="absolute -top-0.5 -right-0.5 size-2 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground/80 truncate max-w-[120px]">
              {row.original.agent.name}
            </span>
          </div>

          <div className="flex items-center gap-x-1 text-muted-foreground/50">
             <span className="text-xs">/</span>
             <Calendar className="size-3" />
             <span className="text-[11px] font-medium tracking-tighter">
                {row.original.startedAt ? format(new Date(row.original.startedAt), "MMM d, HH:mm") : "N/A"}
             </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Status</span>,
    cell: ({ row }) => {
      const status = (row.original.status || "upcoming") as keyof typeof statusConfig;
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <Badge
          variant="outline"
          className={cn(
            "h-7 rounded-lg border px-2.5 font-bold text-[10px] uppercase tracking-wider flex items-center gap-x-1.5 transition-all",
            config.className
          )}
        >
          <Icon className={cn("size-3.5", status === "processing" && "animate-spin")} />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: () => <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground hidden md:inline">Time Log</span>,
    cell: ({ row }) => {
      const duration = row.original.duration;
      
      return (
        <div className="hidden md:flex items-center gap-x-3">
          <Badge
            variant="secondary"
            className="h-8 rounded-xl bg-muted/50 border border-border/40 px-3 font-mono text-xs flex items-center gap-x-2"
          >
            <History className={cn("size-3.5", duration && duration > 3600 ? "text-primary" : "text-muted-foreground")} />
            {duration ? formatDuration(duration) : "--"}
          </Badge>
          
          {/* FEATURE: MINI PROGRESS BAR FOR DURATION (Visual Feedback) */}
          {duration && (
             <div className="w-12 h-1 bg-muted rounded-full overflow-hidden hidden lg:block">
                <div 
                  className="h-full bg-primary/40 rounded-full" 
                  style={{ width: `${Math.min((duration / 3600) * 100, 100)}%` }} 
                />
             </div>
          )}
        </div>
      );
    },
  },
];