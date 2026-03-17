import { callAI } from "./ai-client";
import type { AgentAnalysis } from "@/lib/types";
import type { FetchedLP } from "@/lib/mcp/fetch-mcp";

const SYSTEM = `あなたはコピーライティングの専門家です。
提供された情報をもとに、LPのコピー・文章の問題点を3〜7点、箇条書きで指摘してください。
各指摘は「【エリア名】具体的な問題点（before→afterの例付き）」の形式で書いてください。
前置き・後書きは不要です。`;

export async function runCopyAgent(input: {
  context:     string;
  fetchedLP?:  FetchedLP | null;
  pcImageB64?: string;
  spImageB64?: string;
  provider:    string;
  modelId:     string;
  apiKey?:     string;
}): Promise<AgentAnalysis> {
  const { context, fetchedLP, pcImageB64, spImageB64, provider, modelId, apiKey } = input;

  const parts: string[] = [`LP目的・ターゲット: ${context}`];
  if (fetchedLP) {
    parts.push(`タイトル: ${fetchedLP.title}`);
    parts.push(`メタ: ${fetchedLP.metaDesc ?? "なし"}`);
    parts.push(`見出し: ${fetchedLP.headings.slice(0, 5).join(" / ")}`);
    parts.push(`CTA: ${fetchedLP.ctaTexts.slice(0, 5).join(" / ")}`);
    parts.push(`本文抜粋: ${fetchedLP.bodyText.slice(0, 500)}`);
  }

  const imageB64s: string[] = [];
  if (pcImageB64) imageB64s.push(pcImageB64);
  if (spImageB64) imageB64s.push(spImageB64);

  const text = await callAI({ provider, modelId, apiKey, system: SYSTEM, userText: parts.join("\n"), imageB64s, maxTokens: 700 });

  const findings = text.split("\n").filter((l) => l.trim().startsWith("【")).map((l) => l.trim());

  return { agentId: "copy", findings: findings.length > 0 ? findings : [text.trim()], priority: "high" };
}
