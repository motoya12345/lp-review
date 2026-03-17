// 1件の指摘（画像上の座標付き）
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
}

// プロバイダー
export type ProviderId = "claude" | "openai" | "gemini";

export interface Provider {
  id:       ProviderId;
  name:     string;
  models:   { id: string; label: string }[];
  needsKey: boolean;
  color:    string;
  note:     string;
}
