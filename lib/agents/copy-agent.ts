import Anthropic from "@anthropic-ai/sdk";
import type { AgentAnalysis } from "@/lib/types";
import type { FetchedLP } from "@/lib/mcp/fetch-mcp";

const SYSTEM = `あなたはコピーライティングの専門家です。
提供された情報をもとに、LPのコピー・文章の問題点を3〜5点、箇条書きで指摘してください。
各指摘は「【発見】具体的な問題点」の形式で、60字以内で書いてください。
前置き・後書きは不要です。`;

export async function runCopyAgent(input: {
  context:      string;
  fetchedLP?:   FetchedLP | null;
  pcImageB64?:  string;
  spImageB64?:  string;
  modelId:      string;
  apiKey?:      string;
}): Promise<AgentAnalysis> {
  const { context, fetchedLP, pcImageB64, spImageB64, modelId } = input;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const textParts: string[] = [`LP目的・ターゲット: ${context}`];
  if (fetchedLP) {
    textParts.push(`タイトル: ${fetchedLP.title}`);
    textParts.push(`メタディスクリプション: ${fetchedLP.metaDesc ?? "なし"}`);
    textParts.push(`見出し: ${fetchedLP.headings.slice(0, 5).join(" / ")}`);
    textParts.push(`CTAテキスト: ${fetchedLP.ctaTexts.slice(0, 5).join(" / ")}`);
    textParts.push(`本文抜粋: ${fetchedLP.bodyText.slice(0, 500)}`);
  }

  const content: Anthropic.MessageParam["content"] = [
    { type: "text", text: textParts.join("\n") },
  ];

  if (pcImageB64) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: pcImageB64 },
    });
  }
  if (spImageB64) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: spImageB64 },
    });
  }

  const res = await client.messages.create({
    model:      modelId.startsWith("claude") ? modelId : "claude-sonnet-4-6",
    max_tokens: 600,
    system:     SYSTEM,
    messages:   [{ role: "user", content }],
  });

  const text = res.content.map((b) => ("text" in b ? b.text : "")).join("");
  const findings = text
    .split("\n")
    .filter((l) => l.trim().startsWith("【"))
    .map((l) => l.trim());

  return {
    agentId:  "copy",
    findings: findings.length > 0 ? findings : [text.trim()],
    priority: "high",
  };
}
