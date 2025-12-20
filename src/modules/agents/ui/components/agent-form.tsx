"use client";

import { useTRPC } from "@/trpc/client";
import type { AgentGetOne } from "../../types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Terminal,
  UserCircle2,
  BrainCircuit,
  Info,
  Loader2,
  Wand2,
} from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";

/* -------------------------------------------------------------------------- */
/* TEMPLATES                                                                  */
/* -------------------------------------------------------------------------- */
const TEMPLATES: { label: string; text: string }[] = [
  {
    label: "Meeting Scripter",
    text:
      "You are a professional secretary. Your job is to take detailed notes, summarize key points, and list action items from the meeting.",
  },
  {
    label: "Code Critic",
    text:
      "You are a senior software engineer. Analyze technical discussions and provide constructive feedback on architecture and logic.",
  },
  {
    label: "Creative Muse",
    text:
      "You are a brainstorming assistant. Encourage wild ideas, maintain high energy, and help connect dots between different topics.",
  },
];

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

export const AgentForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: AgentFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const isEdit = Boolean(initialValues?.id);

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  /* ========================= MUTATIONS (CORRECT WAY) ========================= */

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );
        toast.success("Agent created successfully");
        onSuccess?.();
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast.error(error.message);
      },
    })
  );

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );

        if (initialValues?.id) {
          await queryClient.invalidateQueries(
            trpc.agents.getOne.queryOptions({ id: initialValues.id })
          );
        }

        toast.success("Agent updated successfully");
        onSuccess?.();
      },
      onError: (error: TRPCClientErrorLike<AppRouter>) => {
        toast.error(error.message);
        if (error.data?.code === "FORBIDDEN") {
          router.push("/upgrade");
        }
      },
    })
  );

  const isPending = createAgent.isPending || updateAgent.isPending;

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit && initialValues?.id) {
      updateAgent.mutate({ id: initialValues.id, ...values });
    } else {
      createAgent.mutate(values);
    }
  };

  const applyTemplate = (text: string) => {
    form.setValue("instructions", text, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.info("Template applied");
  };

  const nameValue = form.watch("name");
  const instructionValue = form.watch("instructions");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* PREVIEW */}
        <div className="relative overflow-hidden rounded-3xl border bg-primary/5 p-6">
          <div className="flex items-center gap-6">
            <GeneratedAvatar
              seed={nameValue || "agent"}
              className="size-20 rounded-2xl border-4 border-background shadow-lg"
            />
            <div>
              <h3 className="text-xl font-bold">
                {nameValue || "Agent Name"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase font-bold">
                <BrainCircuit className="size-3" /> Identity Preview
              </p>
            </div>
          </div>
        </div>

        {/* NAME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <UserCircle2 className="size-4" /> Agent Name
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Alpha Agent" />
              </FormControl>
              <FormDescription className="text-xs">
                This name defines your agent’s identity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* INSTRUCTIONS */}
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <Terminal className="size-4" /> Instructions
                </FormLabel>
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    instructionValue.length > 200
                      ? "text-amber-600"
                      : "text-muted-foreground"
                  )}
                >
                  {instructionValue.length} chars
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTemplate(t.text)}
                    className="text-[10px] px-3 py-1.5 rounded-full border hover:bg-primary hover:text-white transition"
                  >
                    <Wand2 className="size-3 inline mr-1" />
                    {t.label}
                  </button>
                ))}
              </div>

              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  placeholder="Define how your agent should behave..."
                />
              </FormControl>

              <div className="flex gap-2 text-[11px] bg-blue-500/5 p-3 rounded-lg border">
                <Info className="size-4 text-blue-600" />
                <p>
                  Instructions control how your agent thinks and responds.
                </p>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="size-4 mr-2" />
            )}
            {isEdit ? "Save Changes" : "Create Agent"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
