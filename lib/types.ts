// ─── ビジュアルアノテーション ─────────────────────
export interface Issue {
  id:       number;
  box: {
    x: number;   // 左端 %
    y: number;   // 上端 %
    w: number;   // 幅 %
    h: number;   // 高さ %
  };
  area:     string;
  severity: "critical" | "major" | "minor";
  problem:  string;
  why:      string;
  how:      string;
  before:   string;
  after:    string;
}

export interface ReviewResult {
  summary:     string;
  strengths:   string[];
  issues:      Issue[];
  next_action: string;
  lpUrl?:      string;
  reviewedAt?: string;
  sources?:    { title: string; url: string }[];
}

// ─── エージェント進捗 ──────────────────────────────
export type AgentStatus = "idle" | "running" | "done" | "error";

export interface AgentStep {
  id:       string;
  label:    string;
  status:   AgentStatus;
  message?: string;
}

// ─── エージェント中間結果 ─────────────────────────
export interface ResearchResult {
  competitorInsights:    string[];
  industryBestPractices: string[];
  sources: { title: string; url: string }[];
}

export interface AgentAnalysis {
  agentId:  string;
  findings: string[];
  priority: "high" | "medium" | "low";
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
