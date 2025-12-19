"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  PlayCircle,
  ScrollText,
  Clock,
  Sparkles,
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
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { ChatProvider } from "./chat-provider";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* =============================================================================
   TYPES & MOCK DATA
============================================================================= */
interface Props { meetingId: string; }
type Tab = "summary" | "transcript" | "recording" | "ai";

const INSIGHT_CHIPS = ["Architecture", "Scalability", "Q1 Roadmap", "Security"];

/* =============================================================================
   MAIN COMPONENT
============================================================================ */
export default function CompletedMeetingDashboard({ meetingId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const { data: meeting, isLoading } = useCompletedMeeting(meetingId);

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* 1. TOP HEADER & METRICS */}
      <Header meeting={meeting} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (8 Units) */}
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
              {activeTab === "transcript" && <Transcript meeting={meeting} />}
              {activeTab === "recording" && <Recording meeting={meeting} />}
              {activeTab === "ai" && <AI meetingId={meetingId} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN (4 Units) — SMART SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <QuickStats meeting={meeting} />
          <ActionItemsCard />
          <KeyParticipants />
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   HEADER COMPONENT
============================================================================= */
function Header({ meeting }: any) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl border border-slate-800">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="size-32 rotate-12" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 px-3">
              <CheckCircle2 className="size-3 mr-1.5" /> Meeting Resolved
            </Badge>
            <Badge variant="outline" className="text-slate-400 border-slate-700">
              ID: {meeting?.id.slice(0,8)}...
            </Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tight">{meeting?.title || "Project Sync"}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
              <Clock className="size-3.5" /> {Math.round(meeting?.duration / 60) || 45} mins
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
              <Users className="size-3.5" /> 5 Participants
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              <Brain className="size-3.5" /> AI Analyzed
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                  <Download className="size-4 mr-2" /> Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF/JSON</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
            <Share2 className="size-4 mr-2" /> Share Insight
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =============================================================================
   SUMMARY SECTION (RICHER DESIGN)
============================================================================= */
function Summary({ meeting }: any) {
  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <div className="bg-slate-50 border-b p-6 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-slate-800">
          <FileText className="size-5 text-indigo-500" /> Executive Summary
        </h3>
        <div className="flex gap-2">
          {INSIGHT_CHIPS.map(chip => (
            <Badge key={chip} variant="secondary" className="bg-white border text-[10px] uppercase tracking-tighter">
              #{chip}
            </Badge>
          ))}
        </div>
      </div>
      <div className="p-8">
        <div className="prose prose-slate max-w-none prose-headings:text-indigo-900 prose-strong:text-indigo-700">
          <div dangerouslySetInnerHTML={{ __html: getDummySummary(meeting?.title) }} />
        </div>
        
        <Separator className="my-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-2">
              <Target className="size-4" /> Strategic Goal
            </h4>
            <p className="text-sm text-amber-700/80 italic">"Ensure 99.9% uptime before launching the AI-agent pilot program in Q3."</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
            <h4 className="text-indigo-800 font-bold text-sm flex items-center gap-2 mb-2">
              <Zap className="size-4" /> Quick Win
            </h4>
            <p className="text-sm text-indigo-700/80">Optimize the transcription buffer to reduce latency by 40% immediately.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =============================================================================
   TRANSCRIPT (SLACK-LIKE FEEL)
============================================================================= */
function Transcript({ meeting }: any) {
  const [search, setSearch] = useState("");
  const transcript = getDummyTranscript(meeting?.title);

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <ScrollText className="size-5 text-indigo-500" /> Dynamic Transcript
          </h3>
          <span className="text-xs font-medium text-slate-400">Total: {transcript.length} lines</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search keywords, speakers, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="p-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <div className="space-y-1">
          {transcript.map((t: any, i: number) => (
            <div 
              key={i} 
              className="group flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                {t.speaker[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{t.speaker}</span>
                  <span className="text-[10px] text-slate-400 font-mono">10:0{i} AM</span>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed">
                  <Highlighter
                    searchWords={search ? [search] : []}
                    textToHighlight={t.text}
                    highlightClassName="bg-indigo-100 text-indigo-900 rounded px-1"
                  />
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                <Copy className="size-3 text-slate-400 hover:text-indigo-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* =============================================================================
   SIDEBAR COMPONENTS (NEW FEATURES)
============================================================================= */

function QuickStats({ meeting }: any) {
  return (
    <Card className="p-6 border-none shadow-lg space-y-4">
      <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Sentiment Score</h4>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 w-[70%]" title="Positive" />
          <div className="h-full bg-amber-400 w-[20%]" title="Neutral" />
          <div className="h-full bg-rose-500 w-[10%]" title="Critical" />
        </div>
        <span className="text-xl font-black text-slate-800">8.2</span>
      </div>
      <p className="text-[11px] text-slate-400">Meeting was highly productive with 70% positive sentiment regarding the roadmap.</p>
    </Card>
  );
}

function ActionItemsCard() {
  const items = [
    "Refactor API Lifecycle",
    "Onboard Security Lead",
    "Finalize Q1 UI Design"
  ];
  return (
    <Card className="p-6 border-none shadow-lg space-y-4 bg-indigo-600 text-white">
      <h4 className="font-bold text-sm text-indigo-200 uppercase tracking-widest flex items-center gap-2">
        <TrendingUp className="size-4" /> Action Items
      </h4>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm font-medium">
            <div className="size-5 rounded bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="size-3" />
            </div>
            {item}
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-none text-white">
        Assign Tasks
      </Button>
    </Card>
  );
}

function KeyParticipants() {
  return (
    <Card className="p-6 border-none shadow-lg space-y-4">
      <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Active Speakers</h4>
      <div className="space-y-4">
        {[
          { name: "Saurabh", score: 85, color: "bg-indigo-500" },
          { name: "AI Assistant", score: 45, color: "bg-emerald-500" },
          { name: "Developer", score: 65, color: "bg-blue-500" },
        ].map((p) => (
          <div key={p.name} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span>{p.name}</span>
              <span>{p.score}% contribution</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full">
              <div className={cn("h-full rounded-full", p.color)} style={{ width: `${p.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* =============================================================================
   SUPPORTING COMPONENTS
============================================================================= */

function LoadingState() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="size-12 animate-spin text-indigo-600" />
        <Sparkles className="size-6 absolute -top-2 -right-2 text-amber-500 animate-pulse" />
      </div>
      <p className="font-bold text-slate-500 animate-pulse italic">AI is generating insights...</p>
    </div>
  );
}

function useCompletedMeeting(meetingId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.meetings.getCompletedMeeting.queryOptions({ meetingId }));
}

function Tabs({ activeTab, setActiveTab }: any) {
  const tabs = [
    { id: "summary", label: "Insights", icon: FileText },
    { id: "transcript", label: "Transcript", icon: ScrollText },
    { id: "recording", label: "Watch", icon: PlayCircle },
    { id: "ai", label: "Ask AI", icon: Brain },
  ];

  return (
    <div className="flex gap-1 bg-white p-1.5 rounded-2xl shadow-sm border w-fit">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => setActiveTab(tab.id as Tab)}
          className={cn(
            "h-10 px-6 text-sm font-bold gap-2 rounded-xl transition-all",
            activeTab === tab.id 
              ? "bg-slate-900 text-white shadow-xl scale-105" 
              : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <tab.icon className={cn("size-4", activeTab === tab.id ? "text-indigo-400" : "text-slate-400")} />
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

function Recording({ meeting }: any) {
  if (!meeting?.recordingUrl) return (
    <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
      <PlayCircle className="size-12 text-slate-300 mb-2" />
      <p className="text-slate-400 font-medium italic">No video recording synced for this session.</p>
    </div>
  );
  return <video controls src={meeting.recordingUrl} className="w-full rounded-3xl shadow-2xl border" />;
}

function AI({ meetingId }: { meetingId: string }) {
  return (
    <div className="h-[650px] bg-white rounded-3xl shadow-xl border overflow-hidden">
      <ChatProvider meetingId={meetingId} />
    </div>
  );
}

/* =============================================================================
   MOCK GENERATORS
============================================================================= */
function getDummySummary(name = "Meeting") {
  return `
    <h3 class="mt-0">Executive Context</h3>
    <p>Strategic alignment session for <strong>${name}</strong> focus on architectural stability.</p>
    <h4>Critical Decisions</h4>
    <ul>
      <li>Approved <strong>Phase 1</strong> migration to distributed AI processing.</li>
      <li>New security protocols for <strong>WebSocket</strong> handling finalized.</li>
    </ul>
    <h4>Summary</h4>
    <p>The team achieved consensus on all blocking issues. Velocity is expected to increase by 15% next sprint.</p>
  `;
}

function getDummyTranscript(name = "Meeting") {
  return [
    { speaker: "Saurabh", text: "Welcome everyone. Today's goal is to finalize the AI architecture." },
    { speaker: "Developer", text: "The current latency is 400ms, we need to bring it down to 100ms." },
    { speaker: "AI Assistant", text: "I can help optimize the summary generation pipeline." },
    { speaker: "Product Manager", text: "Let's ensure the Q1 roadmap reflects these stability changes." },
  ];
}