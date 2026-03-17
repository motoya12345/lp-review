"use client";
import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { C } from "@/lib/tokens";

interface Props {
  label: string;
  required?: boolean;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export default function ImageDropZone({ label, required, value, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: C.sub,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
        {required && (
          <span style={{ color: C.red, marginLeft: 4 }}>必須</span>
        )}
      </div>
      {value ? (
        <div style={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            style={{
              width: "100%",
              height: 160,
              objectFit: "contain",
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              display: "block",
            }}
          />
          <button
            onClick={() => onChange(null)}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: C.red,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            height: 160,
            border: `2px dashed ${dragging ? C.red : C.borderMid}`,
            borderRadius: 8,
            background: dragging ? C.redBg : C.surfaceAlt,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28, opacity: 0.4 }}>🖼️</span>
          <span style={{ fontSize: 13, color: C.muted }}>
            ドラッグ or クリックしてアップロード
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onInputChange}
      />
    </div>
  );
}
