"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { MeetingsSearchFilter } from "./meetings-filters";
import {
  LayoutGrid,
  List,
  Filter,

  CheckCircle2,
  Sparkles,
  Plus,
  History,
  Activity,
  CalendarDays,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusFilter } from "./status-filter";
import { AgentFilter } from "./agent-filter";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { cn } from "@/lib/utils";

interface MeetingListHeaderProps {
  stats?: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
}

export function MeetingListHeader({ stats }: MeetingListHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  console.log(isSynced)
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
    !!filters.status || !!filters.search || !!filters.agentId;

  return (
    <>
      <NewMeetingDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

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
            <div>
              <h1 className="text-3xl font-black">Meetings</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                {todayLabel}
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
                className="rounded-xl bg-primary px-6 font-bold"
              >
                <Plus className="mr-2 size-4" /> New Session
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

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowAdvancedFilters(!showAdvancedFilters)
              }
            >
              <Filter size={14} /> Filters
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
              >
                Reset
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <StatusFilter />
                <AgentFilter />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* MINI COMPONENTS (NO ANY)                                                    */
/* -------------------------------------------------------------------------- */

interface ViewToggleProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
}

function ViewToggle({
  active,
  onClick,
  icon: Icon,
}: ViewToggleProps) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="icon"
      onClick={onClick}
      className="h-8 w-8 rounded-lg"
    >
      <Icon size={16} />
    </Button>
  );
}

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  isLive?: boolean;
}

function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  isLive,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      {isLive && (
        <span className="absolute top-2 right-2 size-2 bg-emerald-500 rounded-full animate-ping" />
      )}
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl", color)}>
          <Icon size={18} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase">
            {label}
          </span>
          <span className="text-xl font-black">
            {value}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
