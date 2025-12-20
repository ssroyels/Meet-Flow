"use client";

import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Sparkles, 
  Terminal, 
  UserCircle2, 
  BrainCircuit, 
  Info,
  Loader2,
  Wand2
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

// Templates for quick filling
const TEMPLATES = [
  { label: "Meeting Scripter", text: "You are a professional secretary. Your job is to take detailed notes, summarize key points, and list action items from the meeting." },
  { label: "Code Critic", text: "You are a senior software engineer. Analyze technical discussions and provide constructive feedback on architecture and logic." },
  { label: "Creative Muse", text: "You are a brainstorming assistant. Encourage wild ideas, maintain high energy, and help connect dots between different topics." },
];

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

export const AgentForm = ({ onSuccess, onCancel, initialValues }: AgentFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEdit = !!initialValues?.id;
  const router = useRouter();

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  const isPending = trpc.agents.create.useMutation().isPending || trpc.agents.update.useMutation().isPending;

  // MUTATIONS (Simplified for display)
  const createAgent = useMutation(trpc.agents.create.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
      toast.success("Agent born! Ready for action.");
      onSuccess?.();
    },
    onError: (error) => toast.error(error.message),
  }));

  const updateAgent = useMutation(trpc.agents.update.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
      if (initialValues?.id) {
        await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: initialValues.id }));
      }
      toast.success("Agent profile updated.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
      if (error.data?.code === "FORBIDDEN") router.push("/upgrade");
    },
  }));

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      updateAgent.mutate({ id: initialValues!.id, ...values });
    } else {
      createAgent.mutate(values);
    }
  };

  const applyTemplate = (text: string) => {
    form.setValue("instructions", text, { shouldDirty: true, shouldValidate: true });
    toast.info("Template applied!");
  };

  const nameValue = form.watch("name");
  const instructionValue = form.watch("instructions");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* PREVIEW CARD */}
        <div className="relative group overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition duration-500" />
              <GeneratedAvatar
                seed={nameValue || "default"}
                variant="botttsNeutral"
                className="size-20 relative border-4 border-background shadow-2xl rounded-2xl"
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-xl font-bold tracking-tight">
                {nameValue || "Agent Name"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 uppercase font-bold tracking-widest">
                <BrainCircuit className="size-3" /> Identity Preview
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* NAME FIELD */}
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="size-4 text-primary" />
                  <FormLabel className="text-sm font-bold uppercase tracking-tight">Agent Designation</FormLabel>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g. Professor Alpha" 
                    className="h-12 bg-muted/30 focus-visible:ring-primary/30 rounded-xl"
                  />
                </FormControl>
                <FormDescription className="text-[11px]">This name determines the unique visual avatar for your agent.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* INSTRUCTIONS FIELD */}
          <FormField
            name="instructions"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-primary" />
                    <FormLabel className="text-sm font-bold uppercase tracking-tight">Personality & Rules</FormLabel>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-md border",
                    instructionValue.length > 200 ? "text-amber-600 border-amber-200" : "text-muted-foreground"
                  )}>
                    {instructionValue.length} chars
                  </span>
                </div>
                
                {/* TEMPLATE CHIPS */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => applyTemplate(t.text)}
                      className="text-[10px] flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background hover:bg-primary hover:text-white transition-all duration-200 font-medium"
                    >
                      <Wand2 className="size-2.5" /> {t.label}
                    </button>
                  ))}
                </div>

                <FormControl>
                  <Textarea
                    {...field}
                    rows={6}
                    placeholder="Define how your agent should behave..."
                    className="bg-muted/30 focus-visible:ring-primary/30 rounded-2xl resize-none p-4 leading-relaxed"
                  />
                </FormControl>
                <div className="flex items-start gap-2 rounded-lg bg-blue-500/5 p-3 border border-blue-500/10">
                  <Info className="size-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700/80 leading-normal">
                    Instructions are the "brain" of your agent. Be specific about the tone, goals, and limitations.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-500 animate-pulse" /> 
            AI-Powered Agent Generation
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <Button
                variant="outline"
                type="button"
                className="flex-1 sm:flex-none rounded-xl h-11"
                disabled={isPending}
                onClick={onCancel}
              >
                Discard
              </Button>
            )}
            <Button 
              disabled={isPending} 
              type="submit" 
              className="flex-1 sm:flex-none h-11 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="size-4 mr-2" />
              )}
              {isEdit ? "Save Changes" : "Deploy Agent"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};