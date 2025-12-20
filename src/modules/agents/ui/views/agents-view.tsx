"use client";

import { motion } from "framer-motion";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Bot, ShieldCheck, Activity } from "lucide-react";

import { columns } from "../components/columns";
import { DataTable } from "@/components/data-table";
import { DataPagination } from "../components/data-pagination";
import { EmptyState } from "@/components/empty-state";
// import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { cn } from "@/lib/utils";

export const AgentsView = () => {
  const [filters, setFilters] = useAgentsFilters();
  const trpc = useTRPC();
  const router = useRouter();

  const { data } = useSuspenseQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
    })
  );

  // Stats for the top cards (Example logic)
  const stats = [
    { label: "Total Agents", value: data.total, icon: Bot, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Now", value: data.items.length, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Security Verified", value: "100%", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col gap-y-6 p-4 md:p-8 bg-background/50"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            AI Agents
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and deploy intelligent agents for your digital workspace.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/agents/create")}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 h-11 px-6 rounded-xl transition-all hover:scale-[1.02]"
        >
          <Plus className="size-5" />
          Create New Agent
        </Button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl border bg-card/50 backdrop-blur-sm flex items-center gap-4 hover:border-primary/30 transition-colors"
          >
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("size-6", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TABLE CONTAINER */}
      <div className="relative rounded-2xl border bg-card/30 backdrop-blur-md shadow-sm overflow-hidden flex flex-col">
        {data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
               <DataTable 
                 data={data.items} 
                 columns={columns}
                 onRowClick={(row) => router.push(`/agents/${row.id}`)} 
               />
            </div>
            <div className="p-4 border-t bg-muted/20">
              <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
              />
            </div>
          </>
        ) : (
          <div className="py-20 px-4">
            <EmptyState
              title="No Agents Found"
              description="Deploy your first AI agent to start automating your meetings and workflows."
            />
            <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => router.push("/agents/create")}>
                    Get Started
                </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* LOADING STATE - Skeleton-like feel */
export const AgentsViewLaoding = () => {
  return (
    <div className="flex-1 p-8 space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="h-[400px] bg-muted/50 rounded-2xl" />
    </div>
  );
};

/* ERROR STATE - Stylish Alert */
export const AgentsViewError = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <ErrorState 
        title="Connection Interrupted" 
        description="We're having trouble reaching the agents server. Please check your connection and try again."
      />
    </div>
  );
};