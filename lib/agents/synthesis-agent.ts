import Anthropic from "@anthropic-ai/sdk";
import type { ReviewResult, ResearchResult, AgentAnalysis, ReviewHistory } from "@/lib/types";

const SYNTHESIS_PROMPT = `あなたはLPレビューの統合エージェントです。
UX分析・コピー分析・CVR分析・競合調査の結果と、LP画像を受け取ります。
すべての知見を統合し、根拠のある詳細なレビューをJSON形式で返してください。

# 重要なルール

## 指摘件数
見つかった問題はすべて報告してください。件数の制限はありません。
些細なものは minor、重大なものは critical として含めてください。

## 具体性
- before/after は必ず実際のコピーやUI要素の具体例を書く
- 「弱い」「不足している」などの抽象表現は禁止

## 座標（box）
LP画像上で各問題がどの位置にあるか、% で推定してください。
box: { x: 左端%, y: 上端%, w: 幅%, h: 高さ% }
精度は完璧でなくて構いません。おおよその位置を示してください。

## severity
critical: CVに直結（ファーストビュー・CTA・信頼性の欠如）
major:    CVに影響（構成・コピー品質・導線）
minor:    改善するとよい（細かいUX・デザイン不統一）

# 返答フォーマット（JSONのみ・前置き後書き不要）

{
  "summary": "LP全体の評価（100字程度）",
  "strengths": ["具体的な良い点①", "良い点②"],
  "issues": [
    {
      "id": 1,
      "box": { "x": 10, "y": 5, "w": 80, "h": 15 },
      "area": "ファーストビュー",
      "severity": "critical",
      "problem": "何が問題か（具体的に）",
      "why": "CVや離脱率への具体的な影響",
      "how": "具体的な改善方法（実装レベルで）",
      "before": "現状のコピーやUI要素の例（具体的に）",
      "after": "改善後のコピーやUI要素の例（具体的に）"
    }
  ],
  "next_action": "今すぐひとつだけやるなら（50字）"
}`;

export async function runSynthesisAgent(input: {
  context:        string;
  researchResult: ResearchResult;
  uxResult:       AgentAnalysis;
  copyResult:     AgentAnalysis;
  croResult:      AgentAnalysis;
  previousReview: ReviewHistory | null;
  pcImageB64?:    string;
  spImageB64?:    string;
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
${input.researchResult.industryBestPractices.join("\n")}
参考URL: ${input.researchResult.sources.slice(0, 5).map((s) => s.url).join(", ")}

${input.previousReview ? `【前回レビュー（${input.previousReview.createdAt.slice(0, 10)}）】
前回の最優先課題: ${input.previousReview.result.issues?.[0]?.problem ?? "なし"}` : ""}

上記の分析結果とLP画像をもとに、すべての問題点を画像座標付きでJSONで返してください。
`.trim();

  // 画像を含めたコンテンツ構築
  const content: Anthropic.MessageParam["content"] = [];
  if (input.pcImageB64) {
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: input.pcImageB64 } });
    content.push({ type: "text", text: "↑ PC版LP" });
  }
  if (input.spImageB64) {
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: input.spImageB64 } });
    content.push({ type: "text", text: "↑ SP版LP" });
  }
  content.push({ type: "text", text: userMessage });

  const modelId = input.modelId.startsWith("claude") ? input.modelId : "claude-sonnet-4-6";

  const res = await client.messages.create({
    model:      modelId,
    max_tokens: 4096,
    system:     SYNTHESIS_PROMPT,
    messages:   [{ role: "user", content }],
  });

  const raw    = res.content.map((b) => ("text" in b ? b.text : "")).join("");
  const clean  = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    summary:     parsed.summary     ?? "",
    strengths:   parsed.strengths   ?? [],
    issues:      parsed.issues      ?? [],
    next_action: parsed.next_action ?? "",
    reviewedAt:  new Date().toISOString(),
  };
}
