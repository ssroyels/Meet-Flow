"use client";

import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BrainCircuit,

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
  
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


/* -------------------------------------------------------------------------- */
/* TEMPLATES */
/* -------------------------------------------------------------------------- */

const TEMPLATES = [
  {
    label: "Meeting Scripter",
    text: "You are a professional secretary. Take detailed notes, summarize key points, and list action items.",
  },
  {
    label: "Code Critic",
    text: "You are a senior software engineer. Review architecture and give constructive feedback.",
  },
  {
    label: "Creative Muse",
    text: "You are a brainstorming assistant. Encourage wild ideas and creative connections.",
  },
];

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT */
/* -------------------------------------------------------------------------- */

export const AgentForm = ({
  onSuccess,
  onCancel,
  initialValues,
}: AgentFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const isEdit = !!initialValues?.id;

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  /* -------------------------------------------------------------------------- */
  /* MUTATIONS (✅ CORRECT WAY) */
  /* -------------------------------------------------------------------------- */

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({})
        );
        toast.success("Agent created successfully 🚀");
        onSuccess?.();
      },
      onError: (error) => {
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

        toast.success("Agent updated successfully ✨");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "FORBIDDEN") {
          router.push("/upgrade");
        }
      },
    })
  );

  const isPending = createAgent.isPending || updateAgent.isPending;

  /* -------------------------------------------------------------------------- */
  /* HANDLERS */
  /* -------------------------------------------------------------------------- */

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      updateAgent.mutate({
        id: initialValues!.id,
        ...values,
      });
    } else {
      createAgent.mutate(values);
    }
  };

  const applyTemplate = (text: string) => {
    form.setValue("instructions", text, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.info("Template applied ✨");
  };

  const nameValue = form.watch("name");
  const instructionValue = form.watch("instructions");

  /* -------------------------------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------------------------------- */

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* PREVIEW */}
        <div className="rounded-3xl border p-6 bg-muted/20">
          <div className="flex items-center gap-4">
            <GeneratedAvatar
              seed={nameValue || "agent"}
              className="size-20 rounded-xl"
            />
            <div>
              <h3 className="text-xl font-bold">
                {nameValue || "Agent Name"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BrainCircuit className="size-3" /> Identity Preview
              </p>
            </div>
          </div>
        </div>

        {/* NAME */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Professor Alpha" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* INSTRUCTIONS */}
        <FormField
          name="instructions"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>

              <div className="flex gap-2 flex-wrap mb-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => applyTemplate(t.text)}
                    className="text-xs border rounded-full px-3 py-1 hover:bg-primary hover:text-white"
                  >
                    <Wand2 className="inline size-3 mr-1" />
                    {t.label}
                  </button>
                ))}
              </div>

              <FormControl>
                <Textarea {...field} rows={6} />
              </FormControl>

              <p className="text-xs text-muted-foreground mt-1">
                {instructionValue.length} characters
              </p>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && (
              <Loader2 className="size-4 animate-spin mr-2" />
            )}
            {isEdit ? "Save Changes" : "Create Agent"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
