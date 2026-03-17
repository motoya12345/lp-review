"use client";
import { useState } from "react";
import { Provider, ProviderId } from "@/lib/types";
import { PROVIDERS } from "@/lib/providers";
import { C, FONT } from "@/lib/tokens";

interface Props {
  selectedProvider: ProviderId;
  selectedModel: string;
  apiKey: string;
  onProviderChange: (id: ProviderId) => void;
  onModelChange: (id: string) => void;
  onApiKeyChange: (key: string) => void;
}

export default function ProviderPicker({
  selectedProvider,
  selectedModel,
  apiKey,
  onProviderChange,
  onModelChange,
  onApiKeyChange,
}: Props) {
  const [showKey, setShowKey] = useState(false);
  const provider = PROVIDERS.find((p) => p.id === selectedProvider)!;

  return (
    <div>
      {/* Provider tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {PROVIDERS.map((p) => {
          const active = p.id === selectedProvider;
          return (
            <button
              key={p.id}
              onClick={() => {
                onProviderChange(p.id);
                onModelChange(p.models[0].id);
              }}
              style={{
                padding: "6px 14px",
                border: `2px solid ${active ? p.color : C.border}`,
                borderRadius: 6,
                background: active ? `${p.color}12` : C.surface,
                color: active ? p.color : C.sub,
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Note */}
      <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
        {provider.note}
      </div>

      {/* Model list */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {provider.models.map((m) => {
          const active = m.id === selectedModel;
          return (
            <div
              key={m.id}
              onClick={() => onModelChange(m.id)}
              style={{
                padding: "8px 12px",
                border: `1px solid ${active ? provider.color : C.border}`,
                borderLeft: `3px solid ${active ? provider.color : "transparent"}`,
                borderRadius: 4,
                cursor: "pointer",
                background: active ? `${provider.color}08` : C.surface,
                color: active ? provider.color : C.text,
                fontSize: 13,
                fontFamily: FONT.mono,
                fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {m.label}
              <span style={{ fontSize: 11, color: C.muted, marginLeft: 8, fontFamily: FONT.sans }}>
                {m.id}
              </span>
            </div>
          );
        })}
      </div>

      {/* API key input */}
      {provider.needsKey && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 6, fontWeight: 600 }}>
            APIキー
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-..."
              style={{
                flex: 1,
                padding: "8px 12px",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 13,
                fontFamily: FONT.mono,
                background: C.surface,
                color: C.text,
                outline: "none",
              }}
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              style={{
                padding: "8px 12px",
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                background: C.surface,
                cursor: "pointer",
                fontSize: 12,
                color: C.muted,
              }}
            >
              {showKey ? "隠す" : "表示"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            APIキーはサーバーサイドAPIルート経由でのみ使用されます
          </div>
        </div>
      )}
    </div>
  );
}
