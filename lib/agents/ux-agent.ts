import { callAI } from "./ai-client";
import type { AgentAnalysis } from "@/lib/types";
import type { FetchedLP } from "@/lib/mcp/fetch-mcp";

const SYSTEM = `あなたはLPのUX・視線誘導の専門家です。
提供された情報をもとに、UX観点での問題点を3〜5点、箇条書きで指摘してください。
各指摘は「【発見】具体的な問題点」の形式で、60字以内で書いてください。
前置き・後書きは不要です。`;

export async function runUXAgent(input: {
  context:     string;
  fetchedLP?:  FetchedLP | null;
  pcImageB64?: string;
  spImageB64?: string;
  provider:    string;
  modelId:     string;
  apiKey?:     string;
}): Promise<AgentAnalysis> {
  const { context, fetchedLP, pcImageB64, spImageB64, provider, modelId, apiKey } = input;

  const textParts: string[] = [`LP目的・ターゲット: ${context}`];
  if (fetchedLP) {
    textParts.push(`タイトル: ${fetchedLP.title}`);
    textParts.push(`見出し: ${fetchedLP.headings.slice(0, 5).join(" / ")}`);
    textParts.push(`本文抜粋: ${fetchedLP.bodyText.slice(0, 500)}`);
  }

  const imageB64s: string[] = [];
  if (pcImageB64) imageB64s.push(pcImageB64);
  if (spImageB64) imageB64s.push(spImageB64);

  const text = await callAI({
    provider,
    modelId,
    apiKey,
    system:    SYSTEM,
    userText:  textParts.join("\n"),
    imageB64s,
    maxTokens: 600,
  });

  const findings = text
    .split("\n")
    .filter((l) => l.trim().startsWith("【"))
    .map((l) => l.trim());

  return {
    agentId:  "ux",
    findings: findings.length > 0 ? findings : [text.trim()],
    priority: "high",
  };
}
