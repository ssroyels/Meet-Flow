import {
  AgentsView,
  AgentsViewLaoding,
} from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";



import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs";
import { filterSearchParams } from "@/modules/agents/params";
import { ErrorBoundary } from "react-error-boundary";

import { ListHeader } from "@/modules/agents/ui/components/list-header";

interface Props {
  searchParams: SearchParams;
}

const Page = async ({ searchParams }: Props) => {
  const filters = filterSearchParams(searchParams); // ✅ function now

  const session = await auth.api.getSession({
    headers:await headers(), // ✅ no await
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
    }),
  );

  return (
    <>
     <ListHeader/>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentsViewLaoding />}>
          <ErrorBoundary fallback={<AgentsViewLaoding />}>
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
