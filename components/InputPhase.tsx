"use client";
import { useState } from "react";
import { ProviderId } from "@/lib/types";
import { PROVIDERS } from "@/lib/api-callers";
import ImageDropZone from "./ImageDropZone";
import ProviderPicker from "./ProviderPicker";
import { C, FONT } from "@/lib/tokens";

interface Props {
  onResult: (result: unknown, pcImage: string | null, spImage: string | null, providerName: string, modelId: string) => void;
}

export default function InputPhase({ onResult }: Props) {
  const [context, setContext] = useState("");
  const [pcImage, setPcImage] = useState<string | null>(null);
  const [spImage, setSpImage] = useState<string | null>(null);
  const [provider, setProvider] = useState<ProviderId>("claude");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;
  const hasImage = !!pcImage || !!spImage;
  const needsKey = currentProvider.needsKey;
  const canSubmit = context.trim() && hasImage && (!needsKey || apiKey.trim());

  function getDisabledReason(): string | null {
    if (!context.trim()) return "LPの目的・ターゲットを入力してください";
    if (!hasImage) return "LPのスクリーンショットをアップロードしてください";
    if (needsKey && !apiKey.trim()) return `${currentProvider.name}のAPIキーを入力してください`;
    return null;
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          modelId: model,
          apiKey: needsKey ? apiKey : undefined,
          pcImage,
          spImage,
          context: context.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Unknown error");
      onResult(data.result, pcImage, spImage, currentProvider.name, model);
    } catch (e: unknown) {
      setError("レビューに失敗しました。APIキーや画像を確認してください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const disabledReason = getDisabledReason();

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
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.6,
            color: C.text,
            background: C.surface,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
          ※ 目的が不明確なレビューは表面的な指摘しかできません
        </div>
      </section>

      {/* Step 2 */}
      <section>
        <StepLabel number={2} title="LPをアップロード" />
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <ImageDropZone
              label="PC版"
              required
              value={pcImage}
              onChange={setPcImage}
            />
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <ImageDropZone
              label="SP版（任意）"
              value={spImage}
              onChange={setSpImage}
            />
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section>
        <StepLabel number={3} title="AIを選ぶ" />
        <ProviderPicker
          selectedProvider={provider}
          selectedModel={model}
          apiKey={apiKey}
          onProviderChange={(id) => {
            setProvider(id);
            setApiKey("");
          }}
          onModelChange={setModel}
          onApiKeyChange={setApiKey}
        />
      </section>

      {/* Submit */}
      <div>
        {disabledReason && !loading && (
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
            👆 {disabledReason}
          </div>
        )}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: C.redBg,
              border: `1px solid ${C.redBorder}`,
              borderRadius: 8,
              color: C.red,
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: canSubmit && !loading ? C.red : "#d4cfc9",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            cursor: canSubmit && !loading ? "pointer" : "not-allowed",
            boxShadow: canSubmit && !loading ? "0 2px 8px rgba(200,41,30,0.25)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.15s",
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              <span style={{ animation: "pulse 1.6s ease infinite" }}>
                {currentProvider.name} でレビュー中...
              </span>
            </>
          ) : (
            "レビューを実行する"
          )}
        </button>
      </div>
    </div>
  );
}

function StepLabel({ number, title, required }: { number: number; title: string; required?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: C.red,
          color: "#fff",
          fontFamily: FONT.mono,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {number}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
        {title}
      </span>
      {required && (
        <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>必須</span>
      )}
    </div>
  );
}
