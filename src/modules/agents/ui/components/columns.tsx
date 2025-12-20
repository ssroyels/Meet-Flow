"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AgentGetMany } from "../../types";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { 
  CornerDownRightIcon, 
  VideoIcon, 
  Clock, 
  Circle, 
  MoreHorizontal,
  Fingerprint,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<AgentGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: () => <span className="text-xs font-bold uppercase tracking-wider pl-2">Agent Identity</span>,
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1.5 py-2 pl-2">
        <div className="flex items-center gap-x-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition" />
            <GeneratedAvatar
              variant="botttsNeutral"
              seed={row.original.name}
              className="size-9 relative rounded-lg border bg-background shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground tracking-tight capitalize leading-none mb-1">
              {row.original.name}
            </span>
            <div className="flex items-center gap-x-1.5">
              <Badge className="h-4 text-[9px] px-1.5 bg-primary/5 text-primary border-primary/10 hover:bg-primary/10">
                v1.0.2
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono uppercase opacity-60">
                ID-{row.original.id.slice(0, 5)}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "instructions",
    header: () => <span className="text-xs font-bold uppercase tracking-wider">System Prompt</span>,
    cell: ({ row }) => (
      <div className="flex items-start gap-x-2 group max-w-[300px]">
        <CornerDownRightIcon className="size-3.5 mt-1 text-muted-foreground/50 group-hover:text-primary transition-colors" />
        <div className="bg-muted/30 border border-border/50 rounded-md px-2 py-1 transition-colors group-hover:bg-muted/50">
          <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2 italic">
            {row.original.instructions || "No custom logic defined..."}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "meetingCount",
    header: () => <span className="text-xs font-bold uppercase tracking-wider text-center block">Usage</span>,
    cell: ({ row }) => {
      const count = row.original.meetingCount;
      return (
        <div className="flex flex-col items-center gap-y-1">
          <Badge 
            variant="secondary" 
            className={cn(
              "flex items-center gap-x-1.5 px-2.5 py-1 rounded-full font-bold transition-all",
              count > 0 ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-muted text-muted-foreground"
            )}
          >
            <VideoIcon className={cn("size-3.5", count > 0 ? "text-blue-600" : "text-muted-foreground")} />
            {count} {count === 1 ? "Session" : "Sessions"}
          </Badge>
          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 font-medium">
             <Zap className="size-2.5 fill-current" /> Auto-sync enabled
          </span>
        </div>
      );
    }
  },
  {
    id: "status",
    header: () => <span className="text-xs font-bold uppercase tracking-wider">Status</span>,
    cell: () => (
      <div className="flex items-center gap-x-2">
        <div className="flex items-center gap-x-1.5 bg-green-500/5 border border-green-500/10 px-2 py-1 rounded-md">
          <Circle className="size-2 fill-green-500 text-green-500 animate-pulse" />
          <span className="text-[11px] font-bold text-green-600 tracking-wide uppercase">Deployable</span>
        </div>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-muted">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
            <DropdownMenuItem className="rounded-lg py-2 cursor-pointer gap-2 font-medium">
              <Fingerprint className="size-4 text-muted-foreground" />
              Agent Details
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg py-2 cursor-pointer gap-2 font-medium">
              <Clock className="size-4 text-muted-foreground" />
              View Logs
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg py-2 cursor-pointer gap-2 font-medium text-destructive focus:bg-destructive/5 focus:text-destructive">
              <Zap className="size-4" />
              Instant Launch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }
];