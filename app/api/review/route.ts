import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { ReviewResult } from "@/lib/types";

function extractBase64(dataUrl: string): { mediaType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  return { mediaType: match[1], data: match[2] };
}

async function callClaude(
  modelId: string,
  contentBlocks: Anthropic.MessageParam["content"],
): Promise<ReviewResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: modelId,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: contentBlocks }],
  });
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("No text response");
  return JSON.parse(text.text) as ReviewResult;
}

async function callOpenAI(
  modelId: string,
  apiKey: string,
  contextText: string,
  images: { mediaType: string; data: string }[],
): Promise<ReviewResult> {
  const content: unknown[] = [{ type: "text", text: contextText }];
  for (const img of images) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${img.mediaType};base64,${img.data}` },
    });
  }
  const body = {
    model: modelId,
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ],
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("No text from OpenAI");
  return JSON.parse(text) as ReviewResult;
}

async function callGemini(
  modelId: string,
  apiKey: string,
  contextText: string,
  images: { mediaType: string; data: string }[],
): Promise<ReviewResult> {
  const parts: unknown[] = [{ text: contextText }];
  for (const img of images) {
    parts.push({ inline_data: { mime_type: img.mediaType, data: img.data } });
  }
  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts }],
    generationConfig: { maxOutputTokens: 2048 },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No text from Gemini");
  return JSON.parse(text) as ReviewResult;
}

export async function POST(req: NextRequest) {
  try {
    const { provider, modelId, apiKey, pcImage, spImage, context } =
      await req.json();

    const images: { mediaType: string; data: string }[] = [];
    if (pcImage) images.push(extractBase64(pcImage));
    if (spImage) images.push(extractBase64(spImage));

    const contextText = `LPの目的・ターゲット: ${context}`;

    let result: ReviewResult;

    if (provider === "claude") {
      const contentBlocks: Anthropic.MessageParam["content"] = [
        { type: "text", text: contextText },
      ];
      for (const img of images) {
        contentBlocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: img.data,
          },
        });
      }
      result = await callClaude(modelId, contentBlocks);
    } else if (provider === "openai") {
      if (!apiKey) throw new Error("OpenAI API key required");
      result = await callOpenAI(modelId, apiKey, contextText, images);
    } else if (provider === "gemini") {
      if (!apiKey) throw new Error("Gemini API key required");
      result = await callGemini(modelId, apiKey, contextText, images);
    } else {
      throw new Error("Unknown provider");
    }

    return NextResponse.json({ result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
