import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CallView } from "@/modules/call/ui/views/call-view";

interface PageProps {
  params: Promise<{ meetingId: string }>;
}

export default async function Page({ params }: PageProps) {
  // ✅ MUST await params in Next.js 15
  const { meetingId } = await params;

  // ✅ headers MUST be awaited
  const headersList = await headers();

  // ✅ Server-side session check
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();

  // ✅ Prefetch meeting
  await queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CallView meetingId={meetingId} />
    </HydrationBoundary>
  );
}
