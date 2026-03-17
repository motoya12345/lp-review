import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ReviewResult } from "@/lib/types";
import { SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { context, pcImage, spImage, modelId, provider, apiKey } =
    await req.json();

  // ─── メッセージ構築 ─────────────────────────────
  const content: Anthropic.MessageParam["content"] = [];

  if (pcImage) {
    const base64    = (pcImage as string).replace(/^data:image\/\w+;base64,/, "");
    const mediaType = ((pcImage as string).match(/^data:(image\/\w+);/) ?? [])[1] as
      "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } });
    content.push({ type: "text", text: "↑ PC版のランディングページです。" });
  }

  if (spImage) {
    const base64    = (spImage as string).replace(/^data:image\/\w+;base64,/, "");
    const mediaType = ((spImage as string).match(/^data:(image\/\w+);/) ?? [])[1] as
      "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    content.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } });
    content.push({ type: "text", text: "↑ スマートフォン版のランディングページです。" });
  }

  content.push({
    type: "text",
    text: [
      `【LPの目的・ターゲット】`,
      context,
      ``,
      `上記の情報をもとに、このLPのすべての問題点を見つけて`,
      `画像上の座標付きで詳細なレビューをJSON形式で返してください。`,
      `指摘の数は制限しません。見つかった問題をすべて報告してください。`,
    ].join("\n"),
  });

  // ─── API呼び出し ───────────────────────────────
  let raw = "";

  if (provider === "claude") {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model:      modelId,
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: "user", content }],
    });
    raw = res.content.map((b) => ("text" in b ? b.text : "")).join("");

  } else if (provider === "openai") {
    const openaiContent = content.map((c) => {
      if (c.type === "image") {
        const src = c.source as { media_type: string; data: string };
        return { type: "image_url", image_url: { url: `data:${src.media_type};base64,${src.data}` } };
      }
      return { type: "text", text: (c as { text: string }).text };
    });
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: modelId, max_tokens: 4096,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: openaiContent },
        ],
      }),
    });
    const data = await res.json();
    raw = data.choices?.[0]?.message?.content ?? "";

  } else if (provider === "gemini") {
    const parts = content.map((c) => {
      if (c.type === "image") {
        const src = c.source as { media_type: string; data: string };
        return { inline_data: { mime_type: src.media_type, data: src.data } };
      }
      return { text: (c as { text: string }).text };
    });
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents:           [{ role: "user", parts }],
          generationConfig:   { maxOutputTokens: 4096 },
        }),
      }
    );
    const data = await res.json();
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  // ─── JSONパース ────────────────────────────────
  try {
    const clean  = raw.replace(/```json|```/g, "").trim();
    const result: ReviewResult = JSON.parse(clean);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "JSONパースに失敗しました", raw }, { status: 500 });
  }
}
