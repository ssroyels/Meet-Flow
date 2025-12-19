"use client";

import { useEffect, useRef, useState } from "react";
import { SearchIcon, Command, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export const MeetingsSearchFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcut: CMD/CTRL + K to focus
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleClear = () => {
    setFilters({ search: "" });
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex items-center w-full max-w-sm">
      {/* Background Glow Effect on Focus */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-emerald-500/10 to-primary/20 rounded-2xl blur-md -z-10"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "relative flex items-center w-full transition-all duration-300 ease-in-out group",
        isFocused ? "scale-[1.02]" : "scale-100"
      )}>
        {/* Search Icon with Pulse */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          <SearchIcon className={cn(
            "size-4 transition-colors duration-300",
            isFocused ? "text-primary stroke-[2.5px]" : "text-muted-foreground"
          )} />
        </div>

        <Input
          ref={inputRef}
          placeholder="Query neural database... (⌘K)"
          className={cn(
            "h-11 w-full bg-background/50 backdrop-blur-sm border-border/60 pl-10 pr-12 rounded-xl transition-all",
            "placeholder:text-muted-foreground/50 placeholder:italic",
            "focus-visible:ring-0 focus-visible:border-primary/50 focus-visible:bg-background shadow-sm",
            isFocused && "shadow-xl shadow-primary/5"
          )}
          value={filters.search}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setFilters({ search: e.target.value })}
        />

        {/* Right Side Icons: Clear or Keyboard Hint */}
        <div className="absolute right-3 flex items-center gap-1.5">
          <AnimatePresence mode="wait">
            {filters.search ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                onClick={handleClear}
                className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </motion.button>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border bg-muted/50 text-[10px] font-black text-muted-foreground/70 uppercase tracking-tighter"
              >
                <Command className="size-2.5" />
                <span>K</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-primary/40"
            >
              <Sparkles className="size-3 animate-pulse" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};