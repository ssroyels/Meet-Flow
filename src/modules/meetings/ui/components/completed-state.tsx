"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  PlayCircle,
  ScrollText,
  Clock,
  Search,
  Download,
  Share2,
  Copy,
  Users,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import Highlighter from "react-highlight-words";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { ChatProvider } from "./chat-provider";
import { useQueryClient } from "@tanstack/react-query";

/* =============================================================================
   TYPES
============================================================================= */

interface Props {
  meetingId: string;
}

type Tab = "summary" | "transcript" | "recording" | "ai";

type CompletedMeeting = {
  id: string;
  title: string;
  summary: string | null;
  recordingUrl: string | null;
  transcriptUrl: string | null;
  duration: number;
};

type TranscriptItem = {
  speaker: string;
  text: string;
};

type TabsProps = {
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
};

const INSIGHT_CHIPS = ["Architecture", "Scalability", "Roadmap", "Security"];

/* =============================================================================
   MAIN
============================================================================= */

export default function CompletedMeetingDashboard({ meetingId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const { data: meeting, isLoading } = useCompletedMeeting(meetingId);

  if (isLoading || !meeting) return <LoadingState />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <Header meeting={meeting} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeTab === "summary" && <Summary meeting={meeting} />}
              {activeTab === "transcript" && <Transcript meeting={meeting} />}
              {activeTab === "recording" && <Recording meeting={meeting} />}
              {activeTab === "ai" && <AI meetingId={meetingId} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <QuickStats />
          <ActionItemsCard />
          <KeyParticipants />
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   DATA HOOK (CORRECT tRPC USAGE)
============================================================================= */

function useCompletedMeeting(meetingId: string) {
  const trpc = useTRPC();
  const useClient = useQueryClient()

  return useClient( trpc.meetings.getCompletedMeeting.queryOptions(
    { meetingId },
    {
      enabled: Boolean(meetingId),
      staleTime: 60_000,
    }
  ));
}

/* =============================================================================
   HEADER
============================================================================= */

function Header({ meeting }: { meeting: CompletedMeeting }) {
  return (
    <div className="rounded-3xl bg-slate-900 p-8 text-white border border-slate-800">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Badge className="bg-emerald-500">
              <CheckCircle2 className="size-3 mr-1" /> Completed
            </Badge>
            <Badge variant="outline" className="border-slate-700 text-slate-400">
              ID: {meeting.id.slice(0, 8)}…
            </Badge>
          </div>

          <h1 className="text-4xl font-black">{meeting.title}</h1>

          <div className="flex gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {Math.round(meeting.duration / 60)} mins
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" /> 5 Participants
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary">
                  <Download className="size-4 mr-2" /> Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download summary</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Share2 className="size-4 mr-2" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   SUMMARY
============================================================================= */

function Summary({ meeting }: { meeting: CompletedMeeting }) {
  return (
    <Card>
      <div className="border-b p-6 flex justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <FileText className="size-4" /> Summary
        </h3>

        <div className="flex gap-2">
          {INSIGHT_CHIPS.map((c) => (
            <Badge key={c} variant="secondary" className="text-xs">
              #{c}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-6 prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: meeting.summary ?? "" }} />

        <Separator className="my-6" />

        <div className="grid md:grid-cols-2 gap-4">
          <Insight icon={Target} title="Goal" text="Ensure system stability before Q3 rollout." />
          <Insight icon={Zap} title="Quick Win" text="Reduce transcription latency by 40%." />
        </div>
      </div>
    </Card>
  );
}

function Insight({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-muted">
      <h4 className="font-bold flex items-center gap-2 text-sm">
        <Icon className="size-4" /> {title}
      </h4>
      <p className="text-sm mt-1">{text}</p>
    </div>
  );
}

/* =============================================================================
   TRANSCRIPT
============================================================================= */

function Transcript({ meeting }: { meeting: CompletedMeeting }) {
  console.log(meeting)
  const [search, setSearch] = useState("");
  const transcript: TranscriptItem[] = getDummyTranscript();

  return (
    <Card>
      <div className="p-4 border-b space-y-3">
        <h3 className="font-bold flex gap-2">
          <ScrollText className="size-4" /> Transcript
        </h3>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search transcript…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto divide-y">
        {transcript.map((t, i) => (
          <div key={i} className="p-4 flex gap-4 hover:bg-muted">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {t.speaker[0]}
            </div>

            <div className="flex-1">
              <p className="font-semibold text-sm">{t.speaker}</p>
              <Highlighter
                searchWords={search ? [search] : []}
                textToHighlight={t.text}
                highlightClassName="bg-indigo-100"
              />
            </div>

            <Copy className="size-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* =============================================================================
   SIDEBAR
============================================================================= */

function QuickStats() {
  return (
    <Card className="p-6">
      <h4 className="text-xs uppercase font-bold text-muted-foreground">Sentiment</h4>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-[70%]" />
        </div>
        <span className="font-bold">8.2</span>
      </div>
    </Card>
  );
}

function ActionItemsCard() {
  return (
    <Card className="p-6 bg-indigo-600 text-white">
      <h4 className="font-bold flex gap-2">
        <TrendingUp className="size-4" /> Action Items
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        <li>Refactor API</li>
        <li>Security Review</li>
        <li>Finalize UI</li>
      </ul>
      <Button variant="secondary" className="mt-4 w-full">
        Assign Tasks
      </Button>
    </Card>
  );
}

function KeyParticipants() {
  return (
    <Card className="p-6">
      <h4 className="text-xs uppercase font-bold text-muted-foreground">Speakers</h4>
      <div className="mt-3 space-y-3">
        {["Saurabh", "AI Assistant", "Developer"].map((n) => (
          <div key={n} className="flex justify-between text-sm">
            <span>{n}</span>
            <span className="text-muted-foreground">Active</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* =============================================================================
   TABS / RECORDING / AI
============================================================================= */

function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "transcript", label: "Transcript", icon: ScrollText },
    { id: "recording", label: "Recording", icon: PlayCircle },
    { id: "ai", label: "Ask AI", icon: Brain },
  ];

  return (
    <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
      {tabs.map((t) => (
        <Button
          key={t.id}
          variant="ghost"
          onClick={() => setActiveTab(t.id)}
          className={cn(activeTab === t.id && "bg-slate-900 text-white")}
        >
          <t.icon className="size-4 mr-2" />
          {t.label}
        </Button>
      ))}
    </div>
  );
}

function Recording({ meeting }: { meeting: CompletedMeeting }) {
  if (!meeting.recordingUrl) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        No recording available
      </div>
    );
  }

  return <video controls src={meeting.recordingUrl} className="rounded-xl w-full" />;
}

function AI({ meetingId }: { meetingId: string }) {
  return (
    <div className="h-[600px] border rounded-xl overflow-hidden">
      <ChatProvider meetingId={meetingId} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="size-10 animate-spin text-indigo-600" />
      <p className="text-sm text-muted-foreground">Generating insights…</p>
    </div>
  );
}

/* =============================================================================
   MOCK TRANSCRIPT
============================================================================= */

function getDummyTranscript(): TranscriptItem[] {
  return [
    { speaker: "Saurabh", text: "Let's finalize the AI architecture." },
    { speaker: "Developer", text: "Latency must be reduced to 100ms." },
    { speaker: "AI Assistant", text: "I can optimize the pipeline." },
  ];
}
