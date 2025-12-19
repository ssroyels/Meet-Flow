import "server-only"; // ensure server-only usage

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

/* ================= QUERY CLIENT ================= */

export const getQueryClient = cache(makeQueryClient);

/* ================= TRPC ================= */

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

/* ================= CALLER ================= */

export const caller = appRouter.createCaller(createTRPCContext);

/* ================= TYPES (IMPORTANT) ================= */

export type AppRouter = typeof appRouter;
