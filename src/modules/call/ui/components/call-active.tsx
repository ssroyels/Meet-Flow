"use client";

import Image from "next/image";
import Link from "next/link";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import { useRef, useState } from "react";
import { AIBotTile } from "./ai-bot-tile";
import { useAIVoice } from "./use-ai-voice";
import { useSpeechInput } from "./use-ap-speech";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface Props {
  meetingName: string;
  meetingId: string;
  onLeave: () => void;
  agentName: string;
  agentImage: string;
}

export const CallActive = ({
  meetingName,
  meetingId,
  agentImage,
  agentName,
  onLeave,
}: Props) => {
  const { speak } = useAIVoice();
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔑 IMPORTANT: unlock only once
  const audioUnlockedRef = useRef(false);

  /* ------------------------------------------------------------ */
  /* 🔓 UNLOCK SPEECH (MANDATORY)                                 */
  /* ------------------------------------------------------------ */
  const unlockSpeech = () => {
    if (audioUnlockedRef.current) return;

    const u = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(u);
    window.speechSynthesis.cancel();

    audioUnlockedRef.current = true;
    console.log("🔓 Speech unlocked");
  };

  /* ------------------------------------------------------------ */
  /* SEND TEXT → GEMINI                                           */
  /* ------------------------------------------------------------ */
  const sendToAI = async (text: string) => {
    setLoading(true);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        meetingName,
        meetingId,
      }),
    });

    const data = await res.json();
    console.log("🤖 AI RESPONSE:", data);
    setLoading(false);

    if (!data?.text) return;

    // 🔥 FORCE reset + speak
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    setAiSpeaking(true);
    speak(data.text, "en-US");

    setTimeout(
      () => setAiSpeaking(false),
      Math.min(6000, data.text.length * 60)
    );
  };

  /* ------------------------------------------------------------ */
  /* USER SPEECH INPUT                                            */
  /* ------------------------------------------------------------ */
  const { startListening } = useSpeechInput(sendToAI);

  return (
    <div className="relative flex flex-col justify-between p-4 h-full text-white">
      {/* HEADER */}
      <div className="bg-[#101213] rounded-full p-4 flex items-center gap-4">
        <Link href="/" className="p-1 bg-white/10 rounded-full">
          <Image src="/logo.avif" width={22} height={22} alt="Logo" />
        </Link>
        <h4 className="truncate">{meetingName}</h4>
      </div>

      {/* VIDEO */}
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <SpeakerLayout />
        <AIBotTile
          speaking={aiSpeaking}
          name={agentName}
          image={agentImage}
        />
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-4 bg-[#101213] rounded-full px-4 py-2 justify-center">
        <Button
          onClick={() => {
            unlockSpeech();   // 🔑 REQUIRED
              window.speechSynthesis.resume();
            startListening(); // 🎤 Speech → text
          }}
          disabled={loading}
          className="rounded-full"
        >
          <Mic className="mr-2 size-4" />
          {loading ? "Listening…" : "Talk to AI"}
        </Button>

        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
