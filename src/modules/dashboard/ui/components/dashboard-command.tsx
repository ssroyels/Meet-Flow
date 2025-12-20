"use client";

import { GeneratedAvatar } from "@/components/generated-avatar";
import {
 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { 
  Video, 
  Bot, 
  Search, 
  Calendar, 
  ArrowRight,
  Loader2 
} from "lucide-react";


interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, setOpen }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const [search, setSearch] = useState("");

  const meetings = useQuery(
    trpc.meetings.getMany.queryOptions(
      { search, pageSize: 8 }, // Smaller page size for faster search feel
      { enabled: open }
    )
  );

  const agents = useQuery(
    trpc.agents.getMany.queryOptions(
      { search, pageSize: 8 },
      { enabled: open }
    )
  );

  const isLoading = meetings.isPending || agents.isPending;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Search meetings, agents, or commands..."
          value={search}
          onValueChange={setSearch}
          className="border-none focus:ring-0 h-12"
        />
        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <CommandList className="max-h-[450px] p-2">
        <CommandEmpty className="py-12 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-full bg-muted">
               <Search className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No results found for search</p>
          </div>
        </CommandEmpty>

        {/* MEETINGS SECTION */}
        {meetings.data?.items && meetings.data.items.length > 0 && (
          <CommandGroup 
            heading={<span className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-primary/80">
              <Video className="size-3" /> Meetings
            </span>}
            className="mt-2"
          >
            {meetings.data.items.map((meeting) => (
              <CommandItem
                key={meeting.id}
                onSelect={() => {
                  router.push(`/meetings/${meeting.id}`);
                  setOpen(false);
                }}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Video className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{meeting.name}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" /> Meeting Record
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* AGENTS SECTION */}
        {agents.data?.items && agents.data.items.length > 0 && (
          <CommandGroup 
            heading={<span className="flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-purple-500">
              <Bot className="size-3" /> AI Agents
            </span>}
            className="mt-4"
          >
            {agents.data.items.map((agent) => (
              <CommandItem
                key={agent.id}
                onSelect={() => {
                  router.push(`/agents/${agent.id}`);
                  setOpen(false);
                }}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-9 rounded-lg overflow-hidden border border-border group-hover:border-purple-500/50 transition-colors">
                    <GeneratedAvatar
                      seed={agent.name}
                      // variant="botttsNeutral"
                      className="size-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{agent.name}</span>
                    <span className="text-[11px] text-purple-500 font-medium">Active Agent</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                    <ArrowRight className="size-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-purple-500" />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
        <div className="flex gap-3">
            <span><kbd className="font-sans">↑↓</kbd> to navigate</span>
            <span><kbd className="font-sans">↵</kbd> to select</span>
        </div>
        <span className="font-medium text-primary/70 italic">Meet.AI Spotlight</span>
      </div>
    </CommandDialog>
  );
};