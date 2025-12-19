"use client";

// Ensures provider runs in the client environment
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

// -------------------------------------------------------------
// Creates React hooks + context for tRPC
// Gives: TRPCProvider, useTRPC()
// -------------------------------------------------------------
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

// -------------------------------------------------------------
// QueryClient (React Query) — make 1 instance in browser
// -------------------------------------------------------------
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new instance
    return makeQueryClient();
  }

  // Browser: reuse the same instance (avoids hydration issues)
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

// -------------------------------------------------------------
// Determine TRPC backend URL (handles SSR and client both)
// -------------------------------------------------------------
function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return ""; // relative URL in browser
    return process.env.NEXT_PUBLIC_APP_URL;       // full URL on server
  })();

  return `${base}/api/trpc`;
}

// -------------------------------------------------------------
// TRPC React Provider: wraps your entire app
// Must be used in RootLayout
// -------------------------------------------------------------
export function TRPCReactProvider(
  props: Readonly<{ children: React.ReactNode }>
) {
  const queryClient = getQueryClient();

  // TRPC client (only created once)
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
