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
  Download,
  Share2,
  Users,
  TrendingUp,
} from "lucide-react";
import Highlighter from "react-highlight-words";
import { useQuery } from "@tanstack/react-query";

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

import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

/* =============================================================================
   TYPES
============================================================================= */

type CompletedMeeting =
  inferRouterOutputs<AppRouter>["meetings"]["getCompletedMeeting"];

interface Props {
  meetingId: string;
}

type Tab = "summary" | "transcript" | "recording" | "ai";

/* =============================================================================
   MAIN
============================================================================= */

export default function CompletedMeetingDashboard({ meetingId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const { data: meeting, isLoading } = useCompletedMeeting(meetingId);

  if (isLoading || !meeting) {
    return <LoadingState />;
  }

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
              transition={{ duration: 0.2 }}
            >
              {activeTab === "summary" && <Summary meeting={meeting} />}
              {activeTab === "transcript" && <Transcript />}
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
   HEADER
============================================================================= */

function Header({ meeting }: { meeting: CompletedMeeting }) {
  return (
    <div className="rounded-3xl bg-slate-900 p-8 text-white border">
      <div className="flex justify-between gap-6">
        <div>
          <Badge className="bg-emerald-500 mb-3">
            <CheckCircle2 className="size-3 mr-1" />
            Meeting Resolved
          </Badge>

          <h1 className="text-4xl font-black">{meeting.title}</h1>

          <div className="flex gap-4 mt-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="size-4" />
              {Math.round(meeting.duration / 60)} mins
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" /> Participants
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary">
                  <Download className="size-4 mr-2" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download summary</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button>
            <Share2 className="size-4 mr-2" />
            Share
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
    <Card className="p-8">
      <h3 className="font-bold flex items-center gap-2">
        <FileText className="size-5" />
        Executive Summary
      </h3>

      <Separator className="my-6" />

      <div
        className="prose"
        dangerouslySetInnerHTML={{
          __html: meeting.summary ?? "<p>No summary available.</p>",
        }}
      />
    </Card>
  );
}

/* =============================================================================
   TRANSCRIPT
============================================================================= */

function Transcript() {
  const [search, setSearch] = useState("");
  const transcript = [
    { speaker: "Saurabh", text: "Welcome everyone." },
    { speaker: "Developer", text: "Latency needs improvement." },
  ];

  return (
    <Card className="p-4">
      <Input
        placeholder="Search transcript..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      {transcript.map((t, i) => (
        <div
          key={i}
          className="flex gap-4 p-3 rounded-xl hover:bg-muted"
        >
          <div className="font-bold w-12">{t.speaker[0]}</div>
          <Highlighter
            searchWords={search ? [search] : []}
            textToHighlight={t.text}
          />
        </div>
      ))}
    </Card>
  );
}

/* =============================================================================
   RECORDING
============================================================================= */

function Recording({ meeting }: { meeting: CompletedMeeting }) {
  if (!meeting.recordingUrl) {
    return (
      <div className="h-64 flex items-center justify-center border rounded-3xl">
        <PlayCircle className="size-12 opacity-30" />
      </div>
    );
  }

  return (
    <video
      controls
      src={meeting.recordingUrl}
      className="w-full rounded-3xl"
    />
  );
}

/* =============================================================================
   SIDEBAR
============================================================================= */

function QuickStats() {
  return (
    <Card className="p-6">
      <h4 className="font-bold text-sm uppercase">
        Sentiment Score
      </h4>
      <p className="text-2xl font-black mt-2">8.2</p>
    </Card>
  );
}

function ActionItemsCard() {
  return (
    <Card className="p-6 bg-indigo-600 text-white">
      <h4 className="font-bold flex gap-2">
        <TrendingUp className="size-4" />
        Action Items
      </h4>
      <ul className="mt-4 space-y-2">
        <li className="flex gap-2">
          <CheckCircle2 className="size-4" /> Refactor API
        </li>
        <li className="flex gap-2">
          <CheckCircle2 className="size-4" /> Finalize Q1 UI
        </li>
      </ul>
    </Card>
  );
}

function KeyParticipants() {
  return (
    <Card className="p-6">
      <h4 className="font-bold text-sm uppercase">
        Active Speakers
      </h4>
    </Card>
  );
}

/* =============================================================================
   TABS
============================================================================= */

function Tabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
}) {
  const tabs: {
    id: Tab;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "summary", label: "Insights", icon: FileText },
    { id: "transcript", label: "Transcript", icon: ScrollText },
    { id: "recording", label: "Watch", icon: PlayCircle },
    { id: "ai", label: "Ask AI", icon: Brain },
  ];

  return (
    <div className="flex gap-1 bg-white p-2 rounded-2xl border">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            activeTab === tab.id
              ? "bg-slate-900 text-white"
              : "text-muted-foreground"
          )}
        >
          <tab.icon className="size-4 mr-2" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

/* =============================================================================
   AI
============================================================================= */

function AI({ meetingId }: { meetingId: string }) {
  return (
    <div className="h-[650px] rounded-3xl border overflow-hidden">
      <ChatProvider meetingId={meetingId} />
    </div>
  );
}

/* =============================================================================
   HELPERS
============================================================================= */

function LoadingState() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin size-10" />
    </div>
  );
}

function useCompletedMeeting(meetingId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.meetings.getCompletedMeeting.queryOptions({
      meetingId,
    })
  );
}
