export interface ActionItem {
  priority: 1 | 2 | 3;
  area:     string;
  problem:  string;
  why:      string;
  how:      string;
  before:   string;
  after:    string;
}

export interface ReviewResult {
  headline:    string;
  strengths:   string[];
  actions:     ActionItem[];
  next_action: string;
}

export type ProviderId = "claude" | "openai" | "gemini";

export interface Provider {
  id:       ProviderId;
  name:     string;
  models:   { id: string; label: string }[];
  needsKey: boolean;
  color:    string;
  note:     string;
}
