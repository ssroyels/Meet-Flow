"use client";

import { CallingState, StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingName: string;
  meetingId:string

  // 🤖 AI AGENT
  agentName: string;
  agentImage: string;
}

export const CallUI = ({ meetingName,meetingId, agentName, agentImage }: Props) => {
  const call = useCall();

  const [view, setView] = useState<"lobby" | "call" | "ended">("lobby");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [participants, setParticipants] = useState(1);

  /* -------------------------------------------------------------------------- */
  /* PARTICIPANTS COUNT                                                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!call) return;

    const sub = call.state.participants$.subscribe((map) => {
      setParticipants(Object.keys(map).length);
    });

    return () => sub.unsubscribe();
  }, [call]);

  /* -------------------------------------------------------------------------- */
  /* JOIN CALL                                                                  */
  /* -------------------------------------------------------------------------- */

  const unlockAudio = () => {
    const u = new SpeechSynthesisUtterance(" ");
    speechSynthesis.speak(u);
  };

  const handleJoin = async () => {
    unlockAudio();
    if (!call) return;

    if (
      call.state.callingState === CallingState.JOINED ||
      call.state.callingState === CallingState.JOINING
    ) {
      return;
    }

    await call.join();
    setStartTime(new Date());
    setView("call");
  };

  /* -------------------------------------------------------------------------- */
  /* LEAVE CALL                                                                 */
  /* -------------------------------------------------------------------------- */
  const handleLeave = async () => {
    if (!call) return;

    try {
      await call.leave(); // user leaves only
      setEndTime(new Date());
      setView("ended");
    } catch (err) {
      console.error("Leave failed", err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* SUMMARY                                                                    */
  /* -------------------------------------------------------------------------- */
  const duration =
    startTime && endTime
      ? formatDuration(endTime.getTime() - startTime.getTime())
      : "0m 0s";

  const endedAt = endTime
    ? endTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <StreamTheme className="h-full">
      {view === "lobby" && <CallLobby onJoin={handleJoin} />}

      {view === "call" && (
        <CallActive
        meetingId={meetingId}
          meetingName={meetingName}
          onLeave={handleLeave}
          agentName={agentName}
          agentImage={agentImage}
        />
      )}

      {view === "ended" && (
        <CallEnded
          meetingName={meetingName}
          duration={duration}
          participants={participants}
          endedAt={endedAt}
          hostName="Host"
        />
      )}
    </StreamTheme>
  );
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */
function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs}s`;
}
