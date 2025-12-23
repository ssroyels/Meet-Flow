"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import type { MeetingGetOne } from "../../types";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import {
  ChevronsUpDown,
  Check,
  Plus,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

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

  const isEdit = !!initialValues?.id;

  /* --------------------------------- AGENTS -------------------------------- */

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch || undefined,
    })
  );

  /* -------------------------------- MUTATIONS ------------------------------- */

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.meetings.getMany.queryOptions({})
          ),
          queryClient.invalidateQueries(
            trpc.premium.getFreeUsage.queryOptions()
          ),
        ]);

        toast.success("Meeting created successfully!");
        onSuccess?.(data.id);
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "FORBIDDEN") {
          router.push("/upgrade");
        }
      },
    })
  );

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({})
        );

        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.meetings.getOne.queryOptions({
              id: initialValues.id,
            })
          );
        }

        toast.success("Meeting updated!");
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  /* ---------------------------------- FORM ---------------------------------- */

  const form = useForm<z.infer<typeof MeetingsInsertSchema>>({
    resolver: zodResolver(MeetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  const isPending =
    createMeeting.isPending || updateMeeting.isPending;

  const isAgentsLoading = agents.isLoading;

  const selectedAgent = agents.data?.items.find(
    (agent) => agent.id === form.watch("agentId")
  );

  /* ----------------------------- SUBMIT HANDLER ----------------------------- */

  const onSubmit = (
    values: z.infer<typeof MeetingsInsertSchema>
  ) => {
    if (isEdit) {
      updateMeeting.mutate({
        id: initialValues!.id,
        ...values,
      });
    } else {
      createMeeting.mutate(values);
    }
  };

  /* ---------------------------------- UI ----------------------------------- */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* MEETING NAME */}
        <div className="rounded-2xl bg-muted/30 p-4 border">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="size-4 text-primary" />
                  <FormLabel className="text-sm font-bold uppercase">
                    General Information
                  </FormLabel>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Strategic Planning Q4"
                    className="h-12 rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* AGENT SELECT */}
        <FormField
          name="agentId"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="size-4 text-primary" />
                <FormLabel className="text-sm font-bold uppercase">
                  AI Orchestrator
                </FormLabel>
              </div>

              <Popover
                open={agentOpen}
                onOpenChange={setAgentOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={isAgentsLoading || isPending}
                      className="h-12 justify-between rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        {selectedAgent ? (
                          <GeneratedAvatar
                            seed={selectedAgent.name}
                            className="size-5"
                          />
                        ) : (
                          <div className="size-5 bg-muted rounded-md" />
                        )}
                        {isAgentsLoading
                          ? "Loading agents..."
                          : selectedAgent?.name ??
                            "Choose an Agent"}
                      </div>
                      <ChevronsUpDown className="size-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent className="p-0 w-full">
                  <Command>
                    <CommandInput
                      placeholder="Search agents..."
                      onValueChange={setAgentSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        No agents found.
                      </CommandEmpty>

                      <CommandGroup>
                        {agents.data?.items.map((agent) => (
                          <CommandItem
                            key={agent.id}
                            onSelect={() => {
                              field.onChange(agent.id);
                              setAgentOpen(false);
                            }}
                            className="flex justify-between"
                          >
                            <div className="flex gap-2">
                              <GeneratedAvatar
                                seed={agent.name}
                                className="size-6"
                              />
                              {agent.name}
                            </div>
                            <Check
                              className={cn(
                                "size-4",
                                field.value === agent.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>

                      <CommandSeparator />

                      <CommandGroup>
                        <CommandItem
                          onSelect={() =>
                            router.push("/agents/new")
                          }
                        >
                          <Plus className="mr-2 size-4" />
                          New Agent
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormDescription className="text-xs">
                Selected AI will manage the meeting.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AGENT PREVIEW */}
        <AnimatePresence>
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border p-4 flex gap-4"
            >
              <GeneratedAvatar
                seed={selectedAgent.name}
                className="size-12"
              />
              <div>
                <Badge className="mb-1 text-[10px]">
                  Active Agent
                </Badge>
                <div className="font-bold">
                  {selectedAgent.name}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            disabled={isPending || isAgentsLoading}
            className="px-8"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing
              </>
            ) : isEdit ? (
              "Update Meeting"
            ) : (
              "Create Meeting"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
