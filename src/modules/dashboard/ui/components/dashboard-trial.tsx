"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS } from "@/modules/premium/constants";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { RocketIcon, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const DashboardTrial = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.premium.getFreeUsage.queryOptions());

  if (!data) return null;

  const agentUsage = (data.agentCount / MAX_FREE_AGENTS) * 100;
  const meetingUsage = (data.meetingsCount / MAX_FREE_MEETINGS) * 100;

  return (
    <div className="relative overflow-hidden border border-border/50 rounded-xl bg-gradient-to-b from-card to-muted/30 shadow-sm transition-all hover:shadow-md">
      {/* Decorative Background Glow */}
      <div className="absolute -right-8 -top-8 size-24 bg-primary/5 blur-3xl rounded-full" />

      <div className="p-4 flex flex-col gap-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <RocketIcon className="size-3.5 text-primary" />
            </div>
            <p className="text-[13px] font-bold tracking-tight uppercase text-muted-foreground/80">
              Usage Limits
            </p>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
            FREE
          </span>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          {/* Agents Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground font-medium">Agents</span>
              <span className="font-semibold">{data.agentCount} / {MAX_FREE_AGENTS}</span>
            </div>
            <Progress 
              value={agentUsage} 
              className="h-1.5 bg-secondary"
            />
          </div>

          {/* Meetings Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground font-medium">Meetings</span>
              <span className="font-semibold">{data.meetingsCount} / {MAX_FREE_MEETINGS}</span>
            </div>
            <Progress 
              value={meetingUsage} 
              className="h-1.5 bg-secondary"
            />
          </div>
        </div>
      </div>

      {/* Upgrade Action */}
      <div className="px-4 pb-4">
        <Button 
          asChild 
          size="sm"
          className={cn(
            "w-full h-9 rounded-lg font-semibold text-xs transition-all duration-300",
            "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <Link href="/upgrade" className="flex items-center justify-center gap-2">
            <Zap className="size-3.5 fill-current" />
            Upgrade to Pro
          </Link>
        </Button>
      </div>
    </div>
  );
};