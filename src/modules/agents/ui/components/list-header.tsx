"use client";

import { useState } from "react";
import { 
  PlusIcon, 
  XCircleIcon, 
  FilterIcon, 
  Sparkles,
  Settings2,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { NewAgentDialog } from "./new-agents-dialog";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { SearchFilter } from "./agents-filters";
import { DEFAULT_PAGE } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ListHeader = () => {
  const [filters, setFilters] = useAgentsFilters();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const isAnyFilterModified = !!filters.search;

  const onClearFilter = () => {
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <>
      <NewAgentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      
      <div className="relative pt-8 pb-4 px-4 md:px-8 space-y-6">
        {/* TOP LEVEL: TITLE & PRIMARY ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="size-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                My Agents
              </h1>
            </div>
            <p className="text-muted-foreground text-sm pl-11">
              Manage your autonomous AI workforce
            </p>
          </div>

          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="group relative overflow-hidden rounded-xl bg-primary px-6 py-6 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2 font-bold">
              <PlusIcon className="size-5 transition-transform group-hover:rotate-90" />
              New Agent
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </div>

        {/* BOTTOM LEVEL: SEARCH & FILTERS DOCK */}
        <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
          <div className="flex-1 min-w-[240px]">
            <SearchFilter />
          </div>

          <div className="h-8 w-[1px] bg-border/60 mx-1 hidden sm:block" />

          <AnimatePresence mode="wait">
            {isAnyFilterModified ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <Badge 
                  variant="secondary" 
                  className="h-9 px-3 rounded-xl border-primary/20 bg-primary/5 text-primary gap-2 animate-in fade-in zoom-in duration-300"
                >
                  <Sparkles className="size-3" />
                  Search active
                </Badge>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearFilter}
                  className="h-9 px-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors gap-2"
                >
                  <XCircleIcon className="size-4" />
                  Reset
                </Button>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground/60 px-3 italic text-xs">
                <FilterIcon className="size-3" />
                No filters applied
              </div>
            )}
          </AnimatePresence>

          <div className="ml-auto flex items-center gap-2">
             <Button variant="outline" size="icon" className="size-9 rounded-xl border-muted-foreground/20">
                <Settings2 className="size-4" />
             </Button>
          </div>
        </div>
      </div>
    </>
  );
};