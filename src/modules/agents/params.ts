// src/modules/agents/params.ts
import { parseAsInteger, parseAsString } from "nuqs/server";
import type { SearchParams } from "nuqs";
import { DEFAULT_PAGE } from "@/constants";

const filtersDefinition = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
};

// Useful type if you want it
export type AgentFilters = {
  search: string;
  page: number;
};

export function filterSearchParams(searchParams: SearchParams): AgentFilters {
  return {
    // nuqs/server gives you parseServerSide
    search: filtersDefinition.search.parseServerSide(searchParams.search),
    page: filtersDefinition.page.parseServerSide(searchParams.page),
  };
}

// (optional) export the definition too if you need it on the client
export { filtersDefinition as agentFilterParsers };
