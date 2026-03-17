import Anthropic from "@anthropic-ai/sdk";
import type { ReviewResult, ResearchResult, AgentAnalysis, ReviewHistory } from "@/lib/types";

const SYNTHESIS_PROMPT = `あなたはLPレビューの統合エージェントです。
UX分析・コピー分析・CVR分析・競合調査の4つの結果を受け取り、
最終的な行動可能なレビューをJSON形式で返してください。

重要な制約:
- スコアや数値評価は一切含めない
- 各アクションには必ず「根拠（evidence）」と「根拠URL（source）」を付与する
- before / after は具体的なコピーやUI要素の例を書く
- 前回レビューがある場合は改善・未改善を言及する
- 改善アクションは必ず3つ、優先順位順

返答フォーマット（JSONのみ、前置き・後書き不要）:
{
  "headline": "最大の課題を一言で（30字以内）",
  "strengths": ["強み①（40字以内）", "強み②（40字以内）"],
  "actions": [
    {
      "priority": 1,
      "area":     "改善エリア名",
      "problem":  "具体的な問題（60字以内）",
      "why":      "ビジネス・CVへの影響（50字以内）",
      "how":      "具体的な改善方法（60字以内）",
      "before":   "現状の例（40字以内）",
      "after":    "改善後のイメージ（40字以内）",
      "evidence": "根拠となる調査・比較事例（60字以内）",
      "source":   "根拠URL（あれば）"
    }
  ],
  "next_action": "今すぐひとつだけやるなら（50字以内）",
  "researchBasis": {
    "competitorInsights":    ["競合知見①", "競合知見②"],
    "industryBestPractices": ["業界BP①", "業界BP②"],
    "sources": [{ "title": "タイトル", "url": "URL" }]
  }
}`;

export async function runSynthesisAgent(input: {
  context:        string;
  researchResult: ResearchResult;
  uxResult:       AgentAnalysis;
  copyResult:     AgentAnalysis;
  croResult:      AgentAnalysis;
  previousReview: ReviewHistory | null;
  modelId:        string;
  apiKey?:        string;
}): Promise<ReviewResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = `
【LP情報】
目的・ターゲット: ${input.context}

【UX分析結果】
${input.uxResult.findings.join("\n")}

【コピー分析結果】
${input.copyResult.findings.join("\n")}

【CVR分析結果】
${input.croResult.findings.join("\n")}

【競合・業界調査結果】
${input.researchResult.competitorInsights.join("\n")}
参考URL: ${input.researchResult.sources.map((s) => s.url).join(", ")}

${input.previousReview ? `【前回レビュー（${input.previousReview.createdAt.slice(0, 10)}）】
前回の最優先課題: ${input.previousReview.result.actions[0]?.problem ?? "なし"}` : ""}

上記をもとに最終レビューをJSONで返してください。
`.trim();

  const res = await client.messages.create({
    model:      input.modelId.startsWith("claude") ? input.modelId : "claude-sonnet-4-6",
    max_tokens: 1500,
    system:     SYNTHESIS_PROMPT,
    messages:   [{ role: "user", content: userMessage }],
  });

  const raw   = res.content.map((b) => ("text" in b ? b.text : "")).join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    ...parsed,
    reviewedAt: new Date().toISOString(),
  };
}
