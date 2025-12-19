"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
  PanelLeftCloseIcon,
  PanelLeftIcon,
  Search,
  Bell,
  User2,
  
} from "lucide-react";
import { DashboardCommand } from "./dashboard-command";
import { ThemeToggle } from "@/components/ui/themetoggle";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />

      <nav
        className={cn(
          "sticky top-0 z-40 flex w-full items-center justify-between px-4 py-2.5 transition-all duration-300 ease-in-out",
          scrolled 
            ? "border-b bg-background/80 backdrop-blur-xl shadow-sm" 
            : "bg-transparent border-b border-transparent"
        )}
      >
        {/* LEFT SECTION: Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-xl hover:bg-accent transition-colors"
            onClick={toggleSidebar}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={state === "collapsed" ? "collapsed" : "expanded"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                {state === "collapsed" || isMobile ? (
                  <PanelLeftIcon className="size-[18px] text-foreground/80" />
                ) : (
                  <PanelLeftCloseIcon className="size-[18px] text-foreground/80" />
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
          
          {/* Breadcrumb or Title (Optional improvement) */}
          <span className="hidden lg:block text-sm font-medium text-muted-foreground/60">
            Dashboard / <span className="text-foreground font-semibold">Home</span>
          </span>
        </div>

        {/* CENTER SECTION: Command Search */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={() => setCommandOpen(true)}
            className={cn(
              "group hidden md:flex w-full items-center justify-between gap-2",
              "rounded-xl border border-input bg-muted/30 px-3.5 py-1.5",
              "text-sm text-muted-foreground transition-all duration-200",
              "hover:bg-muted/60 hover:ring-2 hover:ring-primary/10 hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-2">
              <Search className="size-4 group-hover:text-primary transition-colors" />
              <span className="font-medium">Search anything...</span>
            </div>
            <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* RIGHT SECTION: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="size-5 text-foreground/80" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
              <Bell className="size-5 text-foreground/80" />
            </Button>
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
          </div>

          <ThemeToggle />

          <div className="h-6 w-[1px] bg-border/60 mx-1" />

          {/* Profile Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-border/50 bg-muted/50 p-0 hover:border-primary/50 transition-all overflow-hidden"
          >
            <User2 className="size-5 text-foreground/80" />
          </Button>
        </div>
      </nav>
    </>
  );
};

export default DashboardNavbar;