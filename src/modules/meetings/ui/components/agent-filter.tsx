"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle2, Sparkles, Filter } from "lucide-react";

import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import CommandSelect from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const AgentFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [agentSearch, setAgentSearch] = useState("");

  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch,
    })
  );

  const agents = data?.items ?? [];
  const selectedAgent = agents.find((a) => a.id === filters.agentId);

  const options = [
    {
      value: "",
      label: (
        <div className="flex items-center gap-x-2 font-medium">
          <Filter className="size-4 text-muted-foreground" />
          All Agents
        </div>
      ),
    },
    ...agents.map((agent) => ({
      value: agent.id,
      label: agent.name, // Accessibility ke liye
      children: (
        <div className="flex items-center gap-x-3 py-1">
          <div className="relative">
            <GeneratedAvatar
              seed={agent.name}
              variant="botttsNeutral"
              className="size-6 rounded-lg border bg-muted shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <span className="font-medium text-sm">{agent.name}</span>
        </div>
      ),
    })),
  ];

  return (
    <div className="flex items-center gap-x-3">
      <div className="relative group">
        {/* GLOW EFFECT WHEN SELECTED */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div 
              layoutId="glow"
              className="absolute -inset-1 rounded-xl bg-primary/20 blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <CommandSelect
          className={cn(
            "h-10 w-[180px] rounded-xl transition-all duration-300 border-border/60",
            selectedAgent 
              ? "bg-primary/5 border-primary/30 pl-2 pr-1" 
              : "bg-background hover:border-primary/50"
          )}
          placeholder={
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserCircle2 className="size-4" />
              Filter Agent
            </div>
          }
          options={options}
          value={filters.agentId ?? ""}
          onChange={(value) => setFilters({ agentId: value || undefined })}
          onSearch={setAgentSearch}
          emptyMessage={isLoading ? "Syncing..." : "Agent not found"}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            className="flex items-center"
          >
            <Badge
              variant="secondary"
              className="group h-10 gap-x-2 px-3 rounded-xl bg-background border-primary/20 shadow-sm transition-all hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive cursor-pointer"
              onClick={() => setFilters({ agentId: undefined })}
            >
              <div className="flex items-center gap-2">
                <GeneratedAvatar
                  seed={selectedAgent.name}
                  variant="botttsNeutral"
                  className="size-5 rounded-md"
                />
                <span className="font-bold text-xs tracking-tight">
                  {selectedAgent.name}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-primary/20 group-hover:bg-destructive/20" />
              <X className="size-3.5 transition-transform group-hover:rotate-90" />
            </Badge>

            {/* QUICK STAT (OPTIONAL FEATURE) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-2 hidden lg:flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter"
            >
              <Sparkles className="size-3" />
              Active
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Separator = ({ className, orientation }: { className?: string; orientation?: "vertical" | "horizontal" }) => (
  <div className={cn("bg-border", orientation === "vertical" ? "w-[1px] h-full" : "h-[1px] w-full", className)} />
);