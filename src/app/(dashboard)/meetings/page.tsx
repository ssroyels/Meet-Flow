import { MeetingListHeader } from "@/modules/meetings/ui/components/meeting-list-header";
import {
  MeetingsView,
  MeetingsViewError,

} from "@/modules/meetings/ui/views/meetings_view";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SearchParams } from "nuqs/server";

import { filterSearchParams } from "@/modules/meetings/params";
import { MeetingIdViewLoading } from "@/modules/meetings/ui/views/meeting-id-view";

interface Props {
  searchParams: Promise<SearchParams>; // ✅ FIX 1
}

const Page = async ({ searchParams }: Props) => {
  // ✅ FIX 2: await searchParams
  const resolvedSearchParams = await searchParams;

  // Load filters safely from URL
  const filters = filterSearchParams(resolvedSearchParams);

  // Prepare query client
  const queryClient = getQueryClient();

  // Prefetch meetings list on server
  await queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <>
      {/* Header (client component) */}
      <MeetingListHeader />

      {/* React Query Hydration */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<MeetingIdViewLoading />}>
          <ErrorBoundary fallback={<MeetingsViewError />}>
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;

