import fs   from "fs/promises";
import path from "path";
import type { ReviewHistory } from "@/lib/types";

const HISTORY_PATH = path.join(process.cwd(), ".review-history.json");

export async function saveReview(entry: ReviewHistory): Promise<void> {
  const history = await loadHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 50);
  await fs.writeFile(HISTORY_PATH, JSON.stringify(trimmed, null, 2));
}

export async function loadHistory(): Promise<ReviewHistory[]> {
  try {
    const raw = await fs.readFile(HISTORY_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function findPreviousReview(context: string): Promise<ReviewHistory | null> {
  const history = await loadHistory();
  return history.find((h) => h.context === context) ?? null;
}
