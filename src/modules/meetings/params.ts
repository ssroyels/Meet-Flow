// src/modules/agents/params.ts
import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import type { SearchParams } from "nuqs";
import { DEFAULT_PAGE } from "@/constants";
import { MEETING_STATUSES, type MeetingStatus } from "./types";

const filtersDefinition = {
  search: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),

  page: parseAsInteger
    .withDefault(DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),

  status: parseAsStringEnum<MeetingStatus>(
    [...MEETING_STATUSES] // ✅ readonly → mutable
  ).withOptions({ clearOnDefault: true }),

  agentId: parseAsString
    .withDefault("")
    .withOptions({ clearOnDefault: true }),
};

export type AgentFilters = {
  search: string;
  page: number;
  status: MeetingStatus | null;
  agentId: string;
};

export function filterSearchParams(
  searchParams: SearchParams
): AgentFilters {
  return {
    search: filtersDefinition.search.parseServerSide(
      searchParams.search
    ),
    page: filtersDefinition.page.parseServerSide(
      searchParams.page
    ),
    status: filtersDefinition.status.parseServerSide(
      searchParams.status
    ),
    agentId: filtersDefinition.agentId.parseServerSide(
      searchParams.agentId
    ),
  };
}

export { filtersDefinition as agentFilterParsers };
