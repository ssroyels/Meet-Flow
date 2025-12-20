"use client";

import Image from "next/image";
import Link from "next/link";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import { useEffect, useRef, useState } from "react";
import { AIBotTile } from "./ai-bot-tile";
import { useAIVoice } from "./use-ai-voice";
import { useSpeechInput } from "./use-ap-speech";

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
  const audioUnlockedRef = useRef(false);

  /* ------------------------------------------------------------ */
  /* 🔓 UNLOCK SPEECH (ONCE)                                      */
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
  /* SEND TEXT → AI → SPEAK                                       */
  /* ------------------------------------------------------------ */
  const sendToAI = async (text: string) => {
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, meetingName, meetingId }),
      });

      const data = await res.json();
      if (!data?.textdata) return;

      // 🔥 force audio channel open
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      setAiSpeaking(true);
      speak(data.textdata, "en-US");

      setTimeout(
        () => setAiSpeaking(false),
        Math.min(8000, data.textdata.length * 70)
      );
    } catch (err) {
      console.error("AI Error:", err);
    }
  };

  /* ------------------------------------------------------------ */
  /* 🎤 USER SPEECH INPUT (AUTO)                                  */
  /* ------------------------------------------------------------ */
  const { startListening } = useSpeechInput(sendToAI);

  /* ------------------------------------------------------------ */
  /* 🚀 AUTO START ON CALL JOIN                                   */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    unlockSpeech();
    startListening(); // 🎤 auto mic listening
  }, []);

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
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};
