"use client";

import { useState, useEffect } from "react";
import type { AgentStep, Provider, ReviewResult } from "@/lib/types";
import type { DeviceResults } from "@/app/page";
import { PROVIDERS } from "@/lib/providers";
import ImageDropZone from "./ImageDropZone";
import ProviderPicker from "./ProviderPicker";
import AgentProgress from "./AgentProgress";
import { C, FONT } from "@/lib/tokens";

function upsertStep(prev: AgentStep[], next: AgentStep): AgentStep[] {
  const idx = prev.findIndex((s) => s.id === next.id);
  if (idx === -1) return [...prev, next];
  const updated = [...prev];
  updated[idx] = next;
  return updated;
}

interface Props {
  context:     string;
  setContext:  (v: string) => void;
  pcImage:     string | null;
  setPcImage:  (v: string | null) => void;
  spImage:     string | null;
  setSpImage:  (v: string | null) => void;
  provider:    Provider;
  setProvider: (v: Provider) => void;
  modelId:     string;
  setModelId:  (v: string) => void;
  apiKey:      string;
  setApiKey:   (v: string) => void;
  onResults:   (results: DeviceResults) => void;
}

export function InputPhase({
  context, setContext,
  pcImage, setPcImage,
  spImage, setSpImage,
  provider, setProvider,
  modelId, setModelId,
  apiKey, setApiKey,
  onResults,
}: Props) {
  const [loading,   setLoading]   = useState(false);
  const [steps,     setSteps]     = useState<AgentStep[]>([]);
  const [error,     setError]     = useState<string | null>(null);
  const [elapsed,   setElapsed]   = useState(0);

  // 経過時間カウンター（loading 中のみ）
  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const hasImage  = !!pcImage || !!spImage;
  const needsKey  = provider.needsKey;
  const canSubmit = context.trim() && hasImage && (!needsKey || apiKey.trim());

  async function handleRun() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setSteps([]);

    const collected: DeviceResults = {};
    let   hadError = false;

    try {
      const res = await fetch("/api/review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          pcImage:  pcImage  ?? undefined,
          spImage:  spImage  ?? undefined,
          provider: provider.id,
          modelId,
          apiKey:   needsKey ? apiKey : undefined,
        }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let   buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += dec.decode(value, { stream: true });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const message of messages) {
          let event = "";
          let data  = "";
          for (const line of message.split("\n")) {
            if (line.startsWith("event: ")) event = line.slice(7).trim();
            if (line.startsWith("data: "))  data  = line.slice(6);
          }
          if (!data) continue;
          try {
            const parsed = JSON.parse(data);
            if (event === "step")      setSteps((prev) => upsertStep(prev, parsed as AgentStep));
            if (event === "result_pc") collected.pc = parsed as ReviewResult;
            if (event === "result_sp") collected.sp = parsed as ReviewResult;
            if (event === "error")   { setError(parsed.message ?? "エラーが発生しました"); hadError = true; }
          } catch { /* ignore parse errors */ }
        }
      }

      // 結果が揃ったら画面遷移
      if (collected.pc || collected.sp) {
        onResults(collected);
      } else if (!hadError) {
        setError("レビュー結果を取得できませんでした");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "レビューに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const timeStr = min > 0
      ? `${min}分${String(sec).padStart(2, "0")}秒`
      : `${sec}秒`;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
            AIエージェントが分析中です...
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: C.muted, fontFamily: FONT.mono }}>
              {timeStr}
            </span>
            <button
              onClick={() => { setLoading(false); setSteps([]); setError("分析をキャンセルしました"); }}
              style={{
                fontSize: 12, color: C.muted,
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "4px 12px", cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
        {elapsed > 90 && (
          <div style={{
            fontSize: 12, color: C.muted,
            background: C.surfaceAlt, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "10px 14px",
          }}>
            ⏳ 時間がかかっています。Synthesis（統合）ステップは画像解析のため長くなる場合があります。
          </div>
        )}
        <AgentProgress steps={steps} />
      </div>
    );
  }

  const disabledReason =
    !context.trim()           ? "LPの目的・ターゲットを入力してください" :
    !hasImage                  ? "LPのスクリーンショットをアップロードしてください" :
    needsKey && !apiKey.trim() ? `${provider.name}のAPIキーを入力してください` :
    null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Step 1 */}
      <section>
        <StepLabel number={1} title="LPの目的とターゲット" required />
        <textarea
          rows={3}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="例: SaaS会計ソフトの無料トライアル申込みCV。ターゲットは中小企業の経理担当者（30〜50代）。"
          style={{
            width: "100%", padding: "10px 12px",
            border: `1px solid ${C.border}`, borderRadius: 8,
            fontSize: 14, lineHeight: 1.6, color: C.text,
            background: C.surface, resize: "vertical",
            outline: "none", boxSizing: "border-box", fontFamily: "inherit",
          }}
        />
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
          ※ 目的が不明確なレビューは表面的な指摘しかできません
        </div>
      </section>

      {/* Step 2 */}
      <section>
        <StepLabel number={2} title="LPをアップロード" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <ImageDropZone label="PC版" required value={pcImage} onChange={setPcImage} />
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <ImageDropZone label="SP版（任意）" value={spImage} onChange={setSpImage} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
          ※ PC版・SP版はそれぞれ独立したレビューが実行されます
        </div>
      </section>

      {/* Step 3 */}
      <section>
        <StepLabel number={3} title="AIを選ぶ" />
        <ProviderPicker
          selectedProvider={provider.id}
          selectedModel={modelId}
          apiKey={apiKey}
          onProviderChange={(id) => {
            const p = PROVIDERS.find((p) => p.id === id)!;
            setProvider(p); setModelId(p.models[0].id); setApiKey("");
          }}
          onModelChange={setModelId}
          onApiKeyChange={setApiKey}
        />
      </section>

      {/* Submit */}
      <div>
        {disabledReason && (
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
            👆 {disabledReason}
          </div>
        )}
        {error && (
          <div style={{
            padding: "10px 14px", background: C.redBg,
            border: `1px solid ${C.redBorder}`, borderRadius: 8,
            color: C.red, fontSize: 14, marginBottom: 12,
          }}>
            {error}
          </div>
        )}
        <button
          onClick={handleRun}
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "14px 24px",
            background: canSubmit ? C.red : "#d4cfc9",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 15, fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            boxShadow: canSubmit ? "0 2px 8px rgba(200,41,30,0.25)" : "none",
            transition: "all 0.15s",
          }}
        >
          エージェントでレビューを実行する
        </button>
      </div>
    </div>
  );
}

function StepLabel({ number, title, required }: { number: number; title: string; required?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 22, height: 22, borderRadius: "50%",
        background: C.red, color: "#fff",
        fontFamily: FONT.mono, fontSize: 12, fontWeight: 700,
      }}>
        {number}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</span>
      {required && <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>必須</span>}
    </div>
  );
}
