// "use server";

// import { SearchParams } from "nuqs/server";
// import {filterSearchParams } from "../params";

// /**
//  * Loads URL search parameters on the server (Next.js Server Components)
//  * and converts them into strongly typed filter values.
//  *
//  * This works with both SSR + CSR filters — perfectly matches useMeetingsFilters().
//  */
// export async function loadSearchParams(searchParams: SearchParams) {
//   return {
//     search:filterSearchParams.search.parseServerSide(searchParams.search),
//     page:filterSearchParams.page.parseServerSide(searchParams.page),

//     // Status: nullable + parsed enum
//     status:filterSearchParams.status.parseServerSide(searchParams.status) ?? null,

//     // Agent ID
//     agentId:
//      filterSearchParams.agentId.parseServerSide(searchParams.agentId) || "",

//     // Extra safety for pagination:
//     pageSize:filterSearchParams.pageSize
//       ?filterSearchParams.pageSize.parseServerSide(searchParams.pageSize)
//       : undefined,
//   };
// }
