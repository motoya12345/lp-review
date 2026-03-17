import { fetchLP } from "@/lib/mcp/fetch-mcp";
import type { FetchedLP } from "@/lib/mcp/fetch-mcp";

export type { FetchedLP };

export async function runFetchAgent(url: string): Promise<FetchedLP> {
  return fetchLP(url);
}
