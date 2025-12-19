"use client";

import { useState, useEffect } from "react";
import { SearchIcon, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { cn } from "@/lib/utils";

export const SearchFilter = () => {
  const [filters, setFilters] = useAgentsFilters();
  
  // Local state to manage immediate typing (for smooth UI)
  const [inputValue, setInputValue] = useState(filters.search || "");
  const [isTyping, setIsTyping] = useState(false);

  // Debounce effect: Filters tabhi update honge jab user typing rok dega (300ms)
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setFilters({ search: inputValue });
      setIsTyping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, setFilters]);

  const clearSearch = () => {
    setInputValue("");
    setFilters({ search: "" });
  };

  return (
    <div className="group relative">
      {/* Background Glow Highlighter Effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/40 to-blue-500/40 opacity-0 blur transition duration-300 group-focus-within:opacity-100",
        inputValue.length > 0 && "opacity-50"
      )} />

      <div className="relative flex items-center">
        {/* Left Search Icon */}
        <div className="absolute left-3 flex items-center justify-center pointer-events-none">
          {isTyping ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <SearchIcon className={cn(
              "size-4 transition-colors duration-200",
              inputValue.length > 0 ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>

        {/* Input Field */}
        <Input
          placeholder="Filter agents by name..."
          className={cn(
            "h-10 w-full md:w-[280px] pl-10 pr-10",
            "bg-background/80 backdrop-blur-sm border-muted-foreground/20",
            "rounded-xl transition-all duration-300",
            "focus-visible:ring-0 focus-visible:border-primary/50",
            "placeholder:text-muted-foreground/60 font-medium",
            inputValue.length > 0 && "border-primary/40 bg-background"
          )}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* Right Clear Button */}
        {inputValue.length > 0 && (
          <button
            onClick={clearSearch}
            className="absolute right-3 p-0.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="size-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Typing Indicator Label (Optional/Extra Uniqueness) */}
      <div className={cn(
        "absolute -bottom-5 left-2 text-[9px] font-bold uppercase tracking-widest text-primary transition-all duration-300 overflow-hidden h-0",
        isTyping && "h-3 opacity-100 translate-y-1"
      )}>
        Refining Results...
      </div>
    </div>
  );
};