// ─── エージェント進捗 ──────────────────────────────
export type AgentStatus = "idle" | "running" | "done" | "error";

export interface AgentStep {
  id:       string;
  label:    string;
  status:   AgentStatus;
  message?: string;
  result?:  unknown;
}

// ─── Research結果 ─────────────────────────────────
export interface ResearchResult {
  competitorInsights:    string[];
  industryBestPractices: string[];
  sources: { title: string; url: string }[];
}

// ─── 各エージェントの分析結果 ──────────────────────
export interface AgentAnalysis {
  agentId:  string;
  findings: string[];
  priority: "high" | "medium" | "low";
}

// ─── 最終レビュー結果 ─────────────────────────────
export interface ActionItem {
  priority: 1 | 2 | 3;
  area:     string;
  problem:  string;
  why:      string;
  how:      string;
  before:   string;
  after:    string;
  evidence?: string;
  source?:   string;
}

export interface ReviewResult {
  headline:      string;
  strengths:     string[];
  actions:       ActionItem[];
  next_action:   string;
  researchBasis: ResearchResult;
  reviewedAt:    string;
  lpUrl?:        string;
}

// ─── 履歴 ─────────────────────────────────────────
export interface ReviewHistory {
  id:        string;
  context:   string;
  lpUrl?:    string;
  result:    ReviewResult;
  createdAt: string;
}

// ─── プロバイダー ──────────────────────────────────
export type ProviderId = "claude" | "openai" | "gemini";

export interface Provider {
  id:       ProviderId;
  name:     string;
  models:   { id: string; label: string }[];
  needsKey: boolean;
  color:    string;
  note:     string;
}
