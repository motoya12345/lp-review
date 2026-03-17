import { braveSearch } from "@/lib/mcp/brave-search";
import type { ResearchResult } from "@/lib/types";

export async function runResearchAgent(input: {
  context:   string;
  fetchedLP?: { title: string; headings: string[] } | null;
}): Promise<ResearchResult> {
  const industry = extractIndustry(input.context);

  const queries = [
    `${industry} LP ランディングページ 事例 CVR改善`,
    `${industry} アプリ 会員登録 LP ファーストビュー`,
    `${industry} ランディングページ ベストプラクティス`,
  ];

  const allResults = await Promise.all(queries.map((q) => braveSearch(q, 3)));
  const flat = allResults.flat();

  if (flat.length === 0) {
    return {
      competitorInsights:    ["調査データなし（Brave Search APIキー未設定）"],
      industryBestPractices: ["一般的なLP改善：ファーストビューでベネフィットを明示する"],
      sources: [],
    };
  }

  return {
    competitorInsights:    flat.slice(0, 3).map((r) => r.snippet).filter(Boolean),
    industryBestPractices: flat.slice(3, 6).map((r) => r.snippet).filter(Boolean),
    sources:               flat.map((r) => ({ title: r.title, url: r.url })),
  };
}

function extractIndustry(context: string): string {
  if (context.includes("古着") || context.includes("ファッション")) return "古着 フリマ ファッション";
  if (context.includes("SaaS") || context.includes("BtoB"))          return "SaaS BtoB";
  if (context.includes("EC")   || context.includes("通販"))           return "EC 通販";
  if (context.includes("アプリ"))                                      return "スマホアプリ";
  if (context.includes("不動産"))                                      return "不動産";
  if (context.includes("美容") || context.includes("コスメ"))          return "美容 コスメ";
  return "Webサービス アプリ";
}
