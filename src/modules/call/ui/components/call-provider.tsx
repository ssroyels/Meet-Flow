"use client";

import { authClient } from "@/lib/auth-client";
import { LoaderIcon } from "lucide-react";
import { CallConnect } from "./call-connect";
import { generateAvatarUri } from "@/lib/avatar";

interface Props {
  meetingId: string;
  meetingName: string;

  // 🤖 AI AGENT DATA
  agentName: string;
  agentImage?: string;
}

export const CallProvider = ({
  meetingId,
  meetingName,
  agentName,
  agentImage,
}: Props) => {
  const { data, isPending } = authClient.useSession();

  /* -------------------- LOADING -------------------- */
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent-to-sidebar">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  /* -------------------- NO SESSION -------------------- */
  if (!data) {
    return null;
  }

  /* -------------------- READY -------------------- */
  return (
    <CallConnect
      meetingId={meetingId}
      meetingName={meetingName}

      /* 👤 USER */
      userId={data.user.id}
      userName={data.user.name}
      userImage={
        data.user.image ??
        generateAvatarUri({
          seed: data.user.name,
          variant: "initials",
        })
      }

      /* 🤖 AI AGENT */
      agentName={agentName}
      agentImage={
        agentImage ??
        generateAvatarUri({
          seed: agentName,
          variant: "botttsNeutral",
        })
      }
    />
  );
};
