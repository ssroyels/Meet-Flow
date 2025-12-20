"use client";

import { useEffect, useRef, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Send, 
  Sparkles, 
  User2, 
  Bot, 
  Trash2, 
  Maximize2,
  MessageSquarePlus
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

/* =============================================================================
   TYPES
============================================================================= */
interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface Props {
  meetingId: string;
}

/* =============================================================================
   COMPONENT
============================================================================= */
export const ChatProvider = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: session } = authClient.useSession();
  const userName = session?.user?.name ?? "User";
  const userImage = session?.user?.image;

  const { data: meeting } = useQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  const meetingName = meeting?.name ?? "Meeting Session";

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickPrompts = [
    "Summarize this meeting",
    "List action items",
    "Who said what?",
  ];

  const sendMessage = async (explicitText?: string) => {
    const textToSend = explicitText || input;
    if (!textToSend.trim() || loading) return;

    const text = textToSend.trim();
    setInput("");

    const newUserMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, meetingName,text, userName }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: data.text ?? "I couldn't process that. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.log(err)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: "⚠️ System error: AI service is currently down.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[600px] w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border shadow-2xl bg-gradient-to-b from-background to-muted/20">
      
      {/* --- LEFT SIDEBAR: MEETING CONTEXT --- */}
      <div className="hidden md:flex w-[260px] border-r bg-muted/30 p-6 flex-col">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
              <AvatarImage src={userImage || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg leading-tight">{userName}</h3>
              <Badge variant="secondary" className="mt-1 font-normal opacity-70">Participant</Badge>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <div className="p-3 rounded-xl bg-white/50 border border-border/50 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Active Meeting</p>
              <p className="text-sm font-semibold truncate text-primary">{meetingName}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
            <Sparkles className="size-4" />
            <span>Meet.AI Bot</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            I am listening and ready to summarize the key points of this session.
          </p>
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col bg-white/40">
        
        {/* Header (Mobile Visible) */}
        <header className="px-6 py-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-700 md:hidden">
              <MessageSquarePlus className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm md:text-base">Intelligence Hub</h2>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Sync Active
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMessages([])}>
            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </header>

        {/* Messages Scroll Area */}
        <ScrollArea className="flex-1 px-6 pt-6">
          <div className="space-y-6 pb-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <Bot className="size-12 mb-4" />
                <p className="text-sm max-w-[200px]">Ask me to summarize, clarify or find details from this meeting.</p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex w-full gap-3",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="size-8 mt-1 border shadow-sm">
                  <AvatarImage src={m.role === "user" ? (userImage || "") : "/ai-bot-avatar.png"} />
                  <AvatarFallback className={m.role === "user" ? "bg-primary text-white" : "bg-emerald-500 text-white"}>
                    {m.role === "user" ? <User2 size={14} /> : <Bot size={14} />}
                  </AvatarFallback>
                </Avatar>

                <div className={cn(
                  "flex flex-col gap-1 max-w-[85%]",
                  m.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm",
                    m.role === "user" 
                      ? "bg-slate-900 text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground px-1 font-medium">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <Avatar className="size-8 border shadow-sm animate-pulse">
                  <AvatarFallback className="bg-emerald-500 text-white"><Bot size={14} /></AvatarFallback>
                </Avatar>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="size-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="size-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="size-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Footer: Inputs & Suggestions */}
        <footer className="p-4 bg-white/50 border-t space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-[11px] font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI assistant..."
                className="h-12 pl-4 pr-12 rounded-xl bg-white border-slate-200 shadow-inner focus-visible:ring-primary/20"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                <Maximize2 size={16} className="cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            <Button 
              onClick={() => sendMessage()} 
              disabled={loading || !input.trim()}
              className="h-12 w-12 rounded-xl bg-slate-900 hover:bg-primary transition-all shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};