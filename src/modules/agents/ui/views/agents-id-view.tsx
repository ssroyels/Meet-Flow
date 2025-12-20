"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  VideoIcon, 
  Trash2, 
  Edit3, 
  Calendar, 
  Fingerprint, 
  MessageSquareQuote,
  Activity,
  ArrowLeft
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
// import { AgentIdViewHeader } from "../components/agent-id-view-header";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConfirm } from "../../hooks/use-confirm";
import { UpdateAgentDialog } from "../components/update-agent-dialog";
// import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";


interface Props {
  agentId: string;
}

export const AgentIdView = ({ agentId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [UpdateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({ id: agentId })
  );

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
        await queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions());
        toast.success("Agent deleted successfully");
        router.push("/agents");
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Delete Agent?",
    `Warning: This will permanently delete "${data.name}" and remove access to ${data.meetingCount} associated meetings.`
  );

  const handleRemoveAgent = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    await removeAgent.mutateAsync({ id: agentId });
  };

  return (
    <>
      <RemoveConfirmation />
      <UpdateAgentDialog 
        open={UpdateAgentDialogOpen} 
        onOpenChange={setUpdateAgentDialogOpen} 
        initialValues={data}
      />

      <div className="flex-1 flex flex-col min-h-screen bg-background/50">
        {/* TOP NAVIGATION / HEADER */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 md:px-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/agents")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Agents
            </Button>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setUpdateAgentDialogOpen(true)} className="gap-2">
                    <Edit3 className="size-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleRemoveAgent} className="gap-2 shadow-lg shadow-destructive/20">
                    <Trash2 className="size-4" /> Delete
                </Button>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* LEFT COLUMN: IDENTITY CARD */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Bot className="size-24 rotate-12" />
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-600 rounded-full blur opacity-25" />
                  <GeneratedAvatar
                    // variant="botttsNeutral"
                    seed={data.name}
                    className="size-24 relative border-4 border-background shadow-xl rounded-full"
                  />
                  <div className="absolute bottom-1 right-1 size-5 bg-green-500 border-4 border-background rounded-full" />
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight capitalize">{data.name}</h1>
                  <p className="text-sm text-muted-foreground font-mono">ID: {agentId.slice(0, 8)}...</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Badge variant="secondary" className="px-3 py-1 gap-1.5">
                    <Activity className="size-3 text-green-500" /> Active
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 gap-1.5">
                    <Fingerprint className="size-3 text-blue-500" /> Verified Agent
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <VideoIcon className="size-4" />
                    <span>Total Meetings</span>
                  </div>
                  <span className="font-bold">{data.meetingCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>Created At</span>
                  </div>
                  <span className="font-bold">Dec 2025</span> {/* Replace with actual date if available */}
                </div>
              </div>
            </div>

            {/* QUICK STATS BENTO */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-blue-600/70 tracking-wider">Reliability</p>
                  <p className="text-xl font-bold text-blue-700">99.9%</p>
               </div>
               <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-purple-600/70 tracking-wider">Latency</p>
                  <p className="text-xl font-bold text-purple-700">~120ms</p>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            {/* INSTRUCTIONS BOX */}
            <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
                <MessageSquareQuote className="size-5 text-primary" />
                <h3 className="font-bold">System Instructions</h3>
              </div>
              <div className="p-8">
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                  <p className="text-lg text-foreground/90 leading-relaxed italic whitespace-pre-wrap pl-2">
                    `{data.instructions || "No instructions provided for this agent."}`
                  </p>
                </div>
              </div>
              <div className="bg-primary/5 p-4 flex items-center justify-between border-t border-primary/10">
                <p className="text-xs text-primary/70 font-medium">
                  This agent uses the latest LLM model to process instructions during calls.
                </p>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 text-xs font-bold">
                  Test Prompt
                </Button>
              </div>
            </div>

            {/* RECENT ACTIVITY PLACEHOLDER */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Recent Logs</h3>
                <div className="bg-muted/20 border border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center opacity-60">
                    <Activity className="size-8 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">No recent activity logs available.</p>
                    <p className="text-xs text-muted-foreground">Meetings activity will appear here once the agent joins a call.</p>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

/* LOADING STATE: REFINED SKELETON */
export const AgentIdViewLaoding = () => {
  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
      <div className="h-12 w-full bg-muted rounded-xl" />
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4 h-[400px] bg-muted rounded-3xl" />
        <div className="col-span-8 space-y-6">
          <div className="h-64 bg-muted rounded-3xl" />
          <div className="h-48 bg-muted rounded-3xl" />
        </div>
      </div>
    </div>
  );
};

/* ERROR STATE: STYLISH */
export const AgentIdViewError = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ErrorState 
        title="Agent Not Found" 
        description="The agent you are looking for might have been deleted or moved."
      />
    </div>
  );
};

const Bot = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
)