import { fetchLP } from "@/lib/mcp/fetch-mcp";
export type { FetchedLP } from "@/lib/mcp/fetch-mcp";

export async function runFetchAgent(url: string) {
  return fetchLP(url);
}
