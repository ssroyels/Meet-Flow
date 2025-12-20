"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { MeetingGetOne } from "../../types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
import { MeetingsInsertSchema } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { GeneratedAvatar } from "@/components/generated-avatar";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ChevronsUpDown, Check, Plus, Loader2, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: MeetingFormProps) => {
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch || undefined,
    })
  );

  const isEdit = !!initialValues?.id;

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({})),
          queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions()),
        ]);
        toast.success("Meeting created successfully!");
        onSuccess?.(data.id);
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "FORBIDDEN") router.push("/upgrade");
      },
    })
  );

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        if (initialValues?.id) {
          await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: initialValues.id }));
        }
        toast.success("Meeting updated!");
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const form = useForm<z.infer<typeof MeetingsInsertSchema>>({
    resolver: zodResolver(MeetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  const isPending = createMeeting.isPending || updateMeeting.isPending;
  const isAgentsLoading = agents.isLoading;

  const onSubmit = (values: z.infer<typeof MeetingsInsertSchema>) => {
    isEdit ? updateMeeting.mutate({ id: initialValues!.id, ...values }) : createMeeting.mutate(values);
  };

  const selectedAgent = agents.data?.items.find((agent) => agent.id === form.watch("agentId"));

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* 1. MEETING NAME SECTION */}
        <div className="space-y-4 rounded-2xl bg-muted/30 p-4 border border-border/50">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="size-4 text-primary" />
                  <FormLabel className="text-sm font-bold uppercase tracking-wider opacity-70">General Information</FormLabel>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g. Strategic Planning Q4" 
                    className="h-12 bg-background border-border/60 focus-visible:ring-primary/20 rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 2. AGENT SELECTION SECTION */}
        <div className="space-y-4">
          <FormField
            name="agentId"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="size-4 text-primary" />
                  <FormLabel className="text-sm font-bold uppercase tracking-wider opacity-70">AI Orchestrator</FormLabel>
                </div>
                <Popover open={agentOpen} onOpenChange={setAgentOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full h-12 justify-between rounded-xl border-border/60 bg-background px-4 hover:bg-muted/50 transition-all",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isAgentsLoading || isPending}
                      >
                        <div className="flex items-center gap-2">
                           {selectedAgent ? (
                             <GeneratedAvatar seed={selectedAgent.name} variant="botttsNeutral" className="size-5 rounded-md" />
                           ) : <div className="size-5 rounded-md bg-muted animate-pulse" />}
                           {isAgentsLoading ? "Synchronizing Agents..." : selectedAgent ? selectedAgent.name : "Choose an Agent"}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl overflow-hidden shadow-2xl" align="start">
                    <Command className="bg-popover">
                      <CommandInput placeholder="Search neural nodes..." onValueChange={setAgentSearch} className="h-11" />
                      <CommandList className="max-h-[280px]">
                        <CommandEmpty>
                          {isAgentsLoading ? <div className="p-4 flex justify-center"><Loader2 className="animate-spin size-4" /></div> : "No agents found."}
                        </CommandEmpty>
                        <CommandGroup heading="Available Agents">
                          {agents.data?.items.map((agent) => (
                            <CommandItem
                              key={agent.id}
                              value={agent.name}
                              onSelect={() => {
                                field.onChange(agent.id);
                                setAgentOpen(false);
                              }}
                              className="flex items-center justify-between py-3 px-4 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className="size-8 rounded-lg" />
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm">{agent.name}</span>
                                  <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px] uppercase tracking-tighter">
                                    {agent.instructions || "Standard Response Protocol"}
                                  </span>
                                </div>
                              </div>
                              <Check className={cn("h-4 w-4 text-primary transition-opacity", field.value === agent.id ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setAgentOpen(false);
                              router.push("/agents/new");
                            }}
                            className="flex items-center gap-3 py-3 px-4 text-primary font-bold cursor-pointer"
                          >
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Plus className="size-4" />
                            </div>
                            <span>Initialize New Agent</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-[11px] px-1">
                  Selected AI will manage real-time interactions and data extraction.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 3. SELECTED AGENT PREVIEW (Animated) */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-4 flex items-center gap-4 group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Sparkles className="size-12 rotate-12" />
              </div>
              <GeneratedAvatar seed={selectedAgent.name} variant="botttsNeutral" className="size-12 rounded-xl shadow-lg ring-2 ring-background" />
              <div className="flex flex-col">
                <Badge variant="secondary" className="w-fit text-[9px] h-4 mb-1 uppercase font-black">Active Agent</Badge>
                <span className="text-base font-black tracking-tight leading-none">{selectedAgent.name}</span>
                <span className="text-xs text-muted-foreground mt-1 font-mono opacity-60">ID: {selectedAgent.id.slice(0,8)}...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. ACTION BAR */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              variant="ghost"
              type="button"
              disabled={isPending}
              onClick={onCancel}
              className="w-full sm:w-auto rounded-xl h-12 font-bold opacity-60 hover:opacity-100"
            >
              Discard
            </Button>
          )}

          <Button 
            disabled={isPending || isAgentsLoading} 
            type="submit"
            className="w-full sm:w-auto h-12 rounded-xl px-8 font-black bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin size-4" />
                <span>Processing...</span>
              </div>
            ) : (
              <span>{isEdit ? "Synchronize Updates" : "Initialize Meeting"}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};