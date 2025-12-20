"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlusCircle, 
  SlidersHorizontal, 
  CalendarDays, 
  Search, 
  RefreshCcw,
  Video,
  ArrowRight
} from "lucide-react";
import {
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { columns } from "../components/columns";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DataPagination } from "@/modules/agents/ui/components/data-pagination";

/* ========================= MAIN VIEW ========================= */

export const MeetingsView = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const [filters, setFilters] = useMeetingsFilters();
  const queryClient = useQueryClient();

  const { data, isRefetching } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="relative flex flex-1 flex-col gap-y-6 px-4 py-6 md:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
      
      {/* HEADER SECTION - THE TERMINAL LOOK */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8 border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-x-3">
             <div className="p-2 rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Video className="size-6" />
             </div>
             <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
               Meetings <span className="text-muted-foreground/40 font-light">/</span> History
             </h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium pl-14">
            Track and manage your {data.items.length} recent AI-assisted interactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* REFRESHING INDICATOR */}
          <AnimatePresence>
            {isRefetching && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-bold"
              >
                <RefreshCcw className="size-3 animate-spin" />
                Updating Live
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex rounded-xl h-10 px-4 border-muted-foreground/20 hover:bg-muted font-bold gap-2"
            onClick={() => alert("Toggle Filter Drawer")}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>

          <Button
            onClick={() => router.push("/meetings/new")}
            className="h-10 px-6 rounded-xl font-bold bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all gap-2"
          >
            <PlusCircle className="size-4" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* MOBILE FILTERS - BAWAAL STICKY BAR */}
      <div className="flex items-center justify-between md:hidden gap-x-2">
         <Button variant="ghost" className="flex-1 rounded-xl h-11 bg-muted/50 border gap-2 font-bold" onClick={() => {}}>
            <Search className="size-4" /> Search
         </Button>
         <Button variant="outline" className="size-11 rounded-xl shrink-0" onClick={() => {}}>
            <SlidersHorizontal className="size-4" />
         </Button>
      </div>

      {/* DATA TABLE CONTAINER - GLASSMORPHISM */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-2xl"
      >
        <div className="overflow-x-auto">
          <DataTable
            data={data.items}
            columns={columns}
            onRowClick={(row) => router.push(`/meetings/${row.id}`)}
          />
        </div>

        {/* EMPTY STATE - INTEGRATED */}
        {data.items.length === 0 && (
          <div className="py-20 px-4">
            <EmptyState
              title="No Sessions Logged"
              description="Your meeting history will appear here once you start your first session with an agent."
              action={
                <Button onClick={() => router.push("/meetings/new")} className="rounded-xl px-8 h-12 font-bold gap-2 shadow-xl shadow-primary/20">
                  <Video className="size-4" />
                  Launch First Session
                  <ArrowRight className="size-4" />
                </Button>
              }
            />
          </div>
        )}

        {/* PAGINATION DOCK */}
        {data.items.length > 0 && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
            <DataPagination
              page={filters.page}
              totalPages={data.totalPages}
              onPageChange={(page) => setFilters({ page })}
            />
          </div>
        )}
      </motion.div>

      {/* QUICK STATS - FOOTER DECOR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
         {[
           { label: "Active Sessions", val: "4 Live", icon: RefreshCcw, color: "text-emerald-500" },
           { label: "Total Minutes", val: "1,240m", icon: CalendarDays, color: "text-blue-500" },
           { label: "Agent Efficiency", val: "94%", icon: Video, color: "text-purple-500" }
         ].map((stat, i) => (
           <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-between">
              <div className="space-y-0.5">
                 <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{stat.label}</p>
                 <p className="text-lg font-extrabold">{stat.val}</p>
              </div>
              <stat.icon className={cn("size-5", stat.color)} />
           </div>
         ))}
      </div>
    </div>
  );
};

/* ========================= LOADING ========================= */

export const MeetingsViewLoading = () => (
  <div className="flex flex-1 flex-col items-center justify-center min-h-[400px] px-4 md:px-8">
    <div className="relative">
       <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
       <LoadingState
         title="Syncing Meetings"
         description="Connecting to your secure cloud storage..."
       />
    </div>
  </div>
);

/* ========================= ERROR ========================= */

export const MeetingsViewError = () => {
  const queryClient = useQueryClient();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <ErrorState
          title="Terminal Connection Failed"
          description="We encountered a protocol error while fetching your history. Our systems have been notified."
          action={
            <Button
              size="lg"
              className="w-full rounded-2xl font-bold bg-destructive hover:bg-destructive/90 shadow-xl shadow-destructive/20"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: [["meetings", "getMany"]],
                })
              }
            >
              Force Reconnect
            </Button>
          }
        />
      </div>
    </div>
  );
};

// Utility
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");