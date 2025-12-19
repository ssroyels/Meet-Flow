"use client";

import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataPagination = ({
  page,
  totalPages,
  onPageChange
}: Props) => {
  const safeTotalPages = totalPages || 1;
  
  // Logic to show a few page numbers around the current page
  const pages = Array.from({ length: Math.min(5, safeTotalPages) }, (_, i) => {
    if (safeTotalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= safeTotalPages - 2) return safeTotalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t bg-muted/5 rounded-b-2xl">
      {/* LEFT: STATUS & PROGRESS */}
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border shadow-sm">
          <Layers className="size-3.5 text-primary" />
          <span className="text-xs font-bold tracking-tight text-foreground">
            Page {page} <span className="text-muted-foreground font-normal mx-1">of</span> {safeTotalPages}
          </span>
        </div>
        
        {/* Visual Progress Bar (Thin) */}
        <div className="hidden md:block w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(page / safeTotalPages) * 100}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      {/* RIGHT: NAVIGATION CONTROLS */}
      <div className="flex items-center gap-x-1.5">
        {/* First Page */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex size-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="size-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-xl border-muted-foreground/20 hover:border-primary/50 transition-all"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {/* NUMBERED PAGES (Desktop Only) */}
        <div className="hidden md:flex items-center gap-x-1 mx-2">
          {pages.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(p)}
              className={cn(
                "size-9 rounded-xl font-bold transition-all duration-200",
                p === page 
                  ? "bg-primary shadow-lg shadow-primary/20 scale-110" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              {p}
            </Button>
          ))}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-xl border-muted-foreground/20 hover:border-primary/50 transition-all"
          disabled={page === safeTotalPages || totalPages === 0}
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
        >
          <ChevronRight className="size-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex size-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
          disabled={page === safeTotalPages || totalPages === 0}
          onClick={() => onPageChange(safeTotalPages)}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};