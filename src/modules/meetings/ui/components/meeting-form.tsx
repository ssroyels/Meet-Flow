"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { MeetingGetOne } from "../../types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
import { MeetingsInsertSchema } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";
// import { motion, AnimatePresence } from "framer-motion";

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

import {
  ChevronsUpDown,
  Check,
  Plus,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
// import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

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

  const isEdit = Boolean(initialValues?.id);

  /* -------------------------------- AGENTS -------------------------------- */

  const agents = useQuery(
    trpc.agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch || undefined,
    })
  );

  /* -------------------------------- FORM ---------------------------------- */

  const form = useForm<z.infer<typeof MeetingsInsertSchema>>({
    resolver: zodResolver(MeetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  /* ------------------------------- MUTATIONS ------------------------------ */

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
            trpc.meetings.getOne.queryOptions({ id: initialValues.id })
          );
        }
        toast.success("Meeting updated!");
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const isPending = createMeeting.isPending || updateMeeting.isPending;
  const isAgentsLoading = agents.isLoading;

  /* ------------------------------- SUBMIT --------------------------------- */

  const onSubmit = (values: z.infer<typeof MeetingsInsertSchema>) => {
    if (isEdit) {
      updateMeeting.mutate({
        id: initialValues!.id,
        ...values,
      });
    } else {
      createMeeting.mutate(values);
    }
  };

  const selectedAgent = agents.data?.items.find(
    (agent) => agent.id === form.watch("agentId")
  );

  /* -------------------------------- RENDER -------------------------------- */

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* MEETING NAME */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Target className="size-4 text-primary" />
                Meeting Name
              </FormLabel>
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

        {/* AGENT SELECT */}
        <FormField
          name="agentId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI Agent
              </FormLabel>

              <Popover open={agentOpen} onOpenChange={setAgentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={isAgentsLoading || isPending}
                    className="h-12 w-full justify-between rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      {selectedAgent ? (
                        <GeneratedAvatar
                          seed={selectedAgent.name}
                          className="size-5 rounded-md"
                        />
                      ) : (
                        <div className="size-5 rounded-md bg-muted" />
                      )}
                      {selectedAgent?.name ?? "Select an agent"}
                    </div>
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0 rounded-xl">
                  <Command>
                    <CommandInput
                      placeholder="Search agents..."
                      onValueChange={setAgentSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isAgentsLoading ? (
                          <Loader2 className="mx-auto size-4 animate-spin" />
                        ) : (
                          "No agents found"
                        )}
                      </CommandEmpty>

                      <CommandGroup>
                        {agents.data?.items.map((agent) => (
                          <CommandItem
                            key={agent.id}
                            value={agent.name}
                            onSelect={() => {
                              field.onChange(agent.id);
                              setAgentOpen(false);
                            }}
                          >
                            <GeneratedAvatar
                              seed={agent.name}
                              className="size-6 rounded-md mr-2"
                            />
                            {agent.name}
                            <Check
                              className={cn(
                                "ml-auto size-4",
                                field.value === agent.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>

                      <CommandSeparator />

                      <CommandItem
                        onSelect={() => router.push("/agents/new")}
                        className="text-primary"
                      >
                        <Plus className="size-4 mr-2" />
                        Create new agent
                      </CommandItem>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormDescription>
                AI agent will handle summaries & interactions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button variant="ghost" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}

          <Button disabled={isPending} type="submit">
            {isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            {isEdit ? "Update Meeting" : "Create Meeting"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
