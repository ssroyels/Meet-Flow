"use client";

import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Call,
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";

import { useTRPC } from "@/trpc/client";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import { useMutation } from "@tanstack/react-query";
import { CallUI } from "./call-ui";

interface Props {
  meetingId: string;
  meetingName: string;

  userId: string;
  userName: string;
  userImage: string;

  // 🤖 AI AGENT
  agentName: string;
  agentImage: string;
}

export const CallConnect = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
  agentName,
  agentImage,
}: Props) => {
  const trpc = useTRPC();

  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions()
  );

  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  /* -------------------------------------------------------------------------- */
  /* INIT STREAM VIDEO CLIENT                                                   */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const initClient = async () => {
      const videoClient = new StreamVideoClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_URL!,
        user: {
          id: userId,
          name: userName,
          image: userImage,
        },
        tokenProvider: generateToken,
      
      
      });

      if (mounted) {
        setClient(videoClient);
      }
    };

    initClient();

    return () => {
      mounted = false;
      setClient((prev) => {
        prev?.disconnectUser();
        return null;
      });
    };
  }, [userId, userName, userImage, generateToken]);

  /* -------------------------------------------------------------------------- */
  /* INIT CALL                                                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!client) return;

    const _call = client.call("default", meetingId);

    // 🔇 user joins muted by default
    _call.camera.disable();
    _call.microphone.disable();

    setCall(_call);

    return () => {
      if (_call.state.callingState !== CallingState.LEFT) {
        _call.leave().catch(() => {});
      }
      setCall(null);
    };
  }, [client, meetingId]);

  /* -------------------------------------------------------------------------- */
  /* LOADING                                                                    */
  /* -------------------------------------------------------------------------- */
  if (!client || !call) {
    return (
      <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent-to-sidebar">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI
        meetingId={meetingId}
        
          meetingName={meetingName}

          /* 🤖 AI AGENT */
          agentName={agentName}
          agentImage={agentImage}
        />
      </StreamCall>
    </StreamVideo>
  );
};
