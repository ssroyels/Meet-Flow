"use client";

import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CallProvider } from "../components/call-provider";
import { generateAvatarUri } from "@/lib/avatar";

interface Props {
  meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  if (data.status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Meeting has ended"
          description="You can no longer join this meeting"
        />
      </div>
    );
  }

  // 🔥 यही से agent मिलता है
  const agent = data.agent;

  return (
    <CallProvider
      meetingId={meetingId}
      meetingName={data.name}

      /* 🤖 AI AGENT */
      agentName={agent.name}
      agentImage={
        agent.name ??
        generateAvatarUri({
          seed: agent.name,
          variant: "botttsNeutral",
        })
      }
    />
  );
};
