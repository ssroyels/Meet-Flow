"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import {
  LayoutGrid,
  List,
  Filter,
  Download,
  CheckCircle2,
  Sparkles,
  Plus,
  History,
  Activity,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { MeetingsSearchFilter } from "./meetings-filters";
import { StatusFilter } from "./status-filter";
import { AgentFilter } from "./agent-filter";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { cn } from "@/lib/utils";

/* =============================================================================
   TYPES
============================================================================= */

interface MeetingListHeaderProps {
  stats?: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
}

interface ViewToggleProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
}

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  isLive?: boolean;
}

/* =============================================================================
   MAIN COMPONENT
============================================================================= */

export function MeetingListHeader({ stats }: MeetingListHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const [filters, setFilters] = useMeetingsFilters();

  useEffect(() => {
    setIsSynced(false);
    const t = setTimeout(() => setIsSynced(true), 800);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const todayLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const isAnyFilterActive =
    Boolean(filters.status) ||
    Boolean(filters.search) ||
    Boolean(filters.agentId);

  return (
    <>
      <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "sticky top-0 z-30 w-full transition-all duration-300 px-4 py-4 md:px-8",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b shadow-[0_2px_20px_-12px_rgba(0,0,0,0.1)] py-3"
            : "bg-transparent border-b-transparent"
        )}
      >
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">
                  Meetings
                </h1>

                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      isSynced
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500 animate-spin"
                    )}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {isSynced ? "Neural Link Active" : "Syncing Nodes..."}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                {todayLabel} • AI-Powered Session Management
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center bg-muted/50 p-1 rounded-xl border">
                <ViewToggle
                  active={view === "list"}
                  onClick={() => setView("list")}
                  icon={List}
                />
                <ViewToggle
                  active={view === "grid"}
                  onClick={() => setView("grid")}
                  icon={LayoutGrid}
                />
              </div>

              <Button
                onClick={() => setIsDialogOpen(true)}
                className="rounded-xl bg-primary px-6 font-bold shadow-lg shadow-primary/20"
              >
                <Plus className="mr-2 size-4" />
                New Session
              </Button>
            </div>
          </div>

          {/* STATS */}
          {stats && !scrolled && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                label="Total Index"
                value={stats.total}
                icon={History}
                color="text-blue-500"
              />
              <StatsCard
                label="Live Now"
                value={stats.active}
                icon={Activity}
                color="text-emerald-500"
                isLive
              />
              <StatsCard
                label="Scheduled"
                value={stats.upcoming}
                icon={CalendarDays}
                color="text-amber-500"
              />
              <StatsCard
                label="Finalized"
                value={stats.completed}
                icon={CheckCircle2}
                color="text-purple-500"
              />
            </div>
          )}

          {/* FILTERS */}
          <div className="flex flex-col md:flex-row gap-3">
            <MeetingsSearchFilter />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setShowAdvancedFilters((prev) => !prev)
                }
                className={cn(
                  "rounded-xl font-bold text-xs h-10 gap-2",
                  showAdvancedFilters &&
                    "bg-primary text-primary-foreground"
                )}
              >
                <Filter size={14} /> Filters
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
              >
                <Download size={16} />
              </Button>

              {isAnyFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      search: "",
                      status: null,
                      agentId: "",
                      page: 1,
                    })
                  }
                  className="text-[10px] font-black uppercase tracking-wider text-rose-500"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* ADVANCED FILTERS */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-dashed">
                  <StatusFilter />
                  <AgentFilter />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}

/* =============================================================================
   SMALL COMPONENTS
============================================================================= */

function ViewToggle({ active, onClick, icon: Icon }: ViewToggleProps) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="icon"
      onClick={onClick}
      className={cn("h-8 w-8 rounded-lg", active && "shadow-md")}
    >
      <Icon size={16} />
    </Button>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  isLive = false,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative rounded-2xl border bg-card p-4 shadow-sm hover:shadow-xl transition-all"
    >
      {isLive && (
        <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald-500 animate-ping" />
      )}

      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl bg-muted", color)}>
          <Icon size={18} />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <div className="text-xl font-black">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}
