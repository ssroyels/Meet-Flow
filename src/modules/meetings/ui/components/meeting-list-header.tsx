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
  Download, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  X,
  History,
  Activity,
  CalendarDays
} from "lucide-react";
import { StatusFilter } from "./status-filter";
import { AgentFilter } from "./agent-filter";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { Badge } from "@/components/ui/badge";
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
    year: "numeric"
  }).format(new Date());

  const isAnyFilterActive = !!filters.status || !!filters.search || !!filters.agentId;

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
          
          {/* TOP TIER: TITLE & PRIMARY ACTIONS */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Meetings</h1>
                <div className="hidden sm:flex items-center gap-2 self-end pb-1">
                  <div className={cn(
                    "size-2 rounded-full",
                    isSynced ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-spin"
                  )} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {isSynced ? "Neural Link Active" : "Syncing Nodes..."}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                {todayLabel} • <span className="opacity-70">AI-Powered Session Management</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center bg-muted/50 p-1 rounded-xl border">
                <ViewToggle active={view === "list"} onClick={() => setView("list")} icon={List} />
                <ViewToggle active={view === "grid"} onClick={() => setView("grid")} icon={LayoutGrid} />
              </div>
              
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="rounded-xl bg-primary px-6 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus className="mr-2 size-4 stroke-[3px]" /> New Session
              </Button>
            </div>
          </div>

          {/* MIDDLE TIER: ANALYTICS CARDS (Zehar Glow) */}
          {stats && !scrolled && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard label="Total Index" value={stats.total} icon={History} color="text-blue-500" />
              <StatsCard label="Live Now" value={stats.active} icon={Activity} color="text-emerald-500" isLive />
              <StatsCard label="Scheduled" value={stats.upcoming} icon={CalendarDays} color="text-amber-500" />
              <StatsCard label="Finalized" value={stats.completed} icon={CheckCircle2} color="text-purple-500" />
            </div>
          )}

          {/* BOTTOM TIER: SEARCH & FILTERS */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:flex-1 group">
               <div className="absolute inset-0 bg-primary/5 rounded-xl blur-lg group-focus-within:bg-primary/10 transition-all" />
               <MeetingsSearchFilter />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={cn(
                  "rounded-xl border-border/60 font-bold text-xs h-10 gap-2 transition-all",
                  showAdvancedFilters && "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                )}
              >
                <Filter size={14} strokeWidth={3} /> Filters
              </Button>

              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/60">
                <Download size={16} />
              </Button>

              {isAnyFilterActive && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilters({ search: "", status: null, agentId: "", page: 1 })}
                  className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* ADVANCED FILTER DRAWER */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-dashed border-border/60">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">Session Status</span>
                    <StatusFilter />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50 px-1">Host Agent</span>
                    <AgentFilter />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
}

/* ========================= MINI COMPONENTS (ZEHAR STYLING) ========================= */

function ViewToggle({ active, onClick, icon: Icon }: any) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      size="icon"
      onClick={onClick}
      className={cn("h-8 w-8 rounded-lg transition-all", active && "shadow-md")}
    >
      <Icon size={16} />
    </Button>
  );
}

function StatsCard({ label, value, icon: Icon, color, isLive }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
    >
      {isLive && (
        <div className="absolute top-2 right-2 flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl bg-muted group-hover:bg-background transition-colors", color)}>
          <Icon size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{label}</span>
          <span className="text-xl font-black tracking-tight">{value}</span>
        </div>
      </div>
    </motion.div>
  );
}