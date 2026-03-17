import type { AgentStep, ReviewResult } from "@/lib/types";
import { runResearchAgent }              from "./research-agent";
import { runFetchAgent }                 from "./fetch-agent";
import { runUXAgent }                    from "./ux-agent";
import { runCopyAgent }                  from "./copy-agent";
import { runCROAgent }                   from "./cro-agent";
import { runSynthesisAgent }             from "./synthesis-agent";
import { findPreviousReview, saveReview } from "@/lib/mcp/memory-mcp";

export interface OrchestratorInput {
  context:     string;
  lpUrl?:      string;
  pcImageB64?: string;
  spImageB64?: string;
  modelId:     string;
  apiKey?:     string;
  onStep:      (step: AgentStep) => void;
}

export async function runAgentLoop(input: OrchestratorInput): Promise<ReviewResult> {
  const { context, lpUrl, pcImageB64, spImageB64, modelId, apiKey, onStep } = input;

  const step = (
    id: string,
    label: string,
    status: AgentStep["status"],
    message?: string
  ) => onStep({ id, label, status, message });

  // ── 過去レビューを確認 ─────────────────────────
  const previousReview = await findPreviousReview(context);
  if (previousReview) {
    step("memory", "過去のレビューを確認", "done",
      `前回レビュー: ${previousReview.createdAt.slice(0, 10)}`);
  }

  // ── Step 1: URL取得（任意） ────────────────────
  let fetchedLP = null;
  if (lpUrl) {
    step("fetch", "LPを取得中...", "running", lpUrl);
    try {
      fetchedLP = await runFetchAgent(lpUrl);
      step("fetch", "LP取得完了", "done", `${fetchedLP.headings.length}件の見出しを取得`);
    } catch {
      step("fetch", "LP取得をスキップ", "error", "URLにアクセスできませんでした");
    }
  }

  // ── Step 2: Research（Web検索） ────────────────
  step("research", "競合・事例を調査中...", "running");
  const researchResult = await runResearchAgent({ context, fetchedLP });
  step("research", "調査完了", "done",
    `${researchResult.sources.length}件の参考情報を取得`);

  // ── Step 3: 並列分析（UX / Copy / CRO） ────────
  step("ux",   "UX・視線誘導を分析中...", "running");
  step("copy", "コピーライティングを分析中...", "running");
  step("cro",  "CVR・CTAを分析中...", "running");

  const [uxResult, copyResult, croResult] = await Promise.all([
    runUXAgent({   context, fetchedLP, pcImageB64, spImageB64, modelId, apiKey }),
    runCopyAgent({ context, fetchedLP, pcImageB64, spImageB64, modelId, apiKey }),
    runCROAgent({  context, fetchedLP, pcImageB64, spImageB64, modelId, apiKey }),
  ]);

  step("ux",   "UX分析完了",    "done");
  step("copy", "コピー分析完了", "done");
  step("cro",  "CVR分析完了",   "done");

  // ── Step 4: Synthesis ─────────────────────────
  step("synthesis", "レビューを統合中...", "running");
  const finalResult = await runSynthesisAgent({
    context,
    researchResult,
    uxResult,
    copyResult,
    croResult,
    previousReview,
    modelId,
    apiKey,
  });
  step("synthesis", "統合完了", "done");

  // ── Step 5: Memory保存 ────────────────────────
  const reviewWithMeta: ReviewResult = { ...finalResult, lpUrl };
  await saveReview({
    id:        crypto.randomUUID(),
    context,
    lpUrl,
    result:    reviewWithMeta,
    createdAt: new Date().toISOString(),
  });
  step("memory", "レビューを保存しました", "done");

  return reviewWithMeta;
}
