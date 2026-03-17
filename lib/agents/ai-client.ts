import Anthropic from "@anthropic-ai/sdk";

const AI_TIMEOUT_MS = 120_000; // 2分でタイムアウト

export interface AICallInput {
  provider:   string;
  modelId:    string;
  apiKey?:    string;
  system:     string;
  userText:   string;
  imageB64s?: string[];
  maxTokens?: number;
}

export async function callAI(input: AICallInput): Promise<string> {
  const { provider, modelId, apiKey, system, userText, imageB64s = [], maxTokens = 800 } = input;

  if (provider === "openai") return callOpenAI({ modelId, apiKey: apiKey!, system, userText, imageB64s, maxTokens });
  if (provider === "gemini") return callGemini({ modelId, apiKey: apiKey!, system, userText, imageB64s, maxTokens });
  return callClaude({ modelId, system, userText, imageB64s, maxTokens });
}

async function callClaude(input: { modelId: string; system: string; userText: string; imageB64s: string[]; maxTokens: number }): Promise<string> {
  const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const content: Anthropic.MessageParam["content"] = [{ type: "text", text: input.userText }];
  for (const b64 of input.imageB64s) {
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } });
  }
  const res = await client.messages.create({
    model:      input.modelId,
    max_tokens: input.maxTokens,
    system:     input.system,
    messages:   [{ role: "user", content }],
  });
  return res.content.map((b) => ("text" in b ? b.text : "")).join("");
}

async function callOpenAI(input: { modelId: string; apiKey: string; system: string; userText: string; imageB64s: string[]; maxTokens: number }): Promise<string> {
  const userContent: unknown[] = [{ type: "text", text: input.userText }];
  for (const b64 of input.imageB64s) {
    userContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${b64}` } });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${input.apiKey}` },
      signal:  controller.signal,
      body: JSON.stringify({
        model: input.modelId, max_tokens: input.maxTokens,
        messages: [{ role: "system", content: input.system }, { role: "user", content: userContent }],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(input: { modelId: string; apiKey: string; system: string; userText: string; imageB64s: string[]; maxTokens: number }): Promise<string> {
  const parts: unknown[] = [{ text: input.userText }];
  for (const b64 of input.imageB64s) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: b64 } });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${input.modelId}:generateContent?key=${input.apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      signal:  controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: input.system }] },
        contents:           [{ role: "user", parts }],
        generationConfig:   {
          maxOutputTokens:  input.maxTokens,
          // thinking モデルでは思考予算を制限してレスポンスを安定させる
          thinkingConfig:   { thinkingBudget: 0 },
        },
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Gemini error: ${res.status} ${errBody.slice(0, 200)}`);
    }
    const json = await res.json();

    // Gemini 2.5 の thinking モデルは parts に thought:true のブロックが混在する
    // thought フラグのない最初のテキストパートを取得する
    const responseParts: { text?: string; thought?: boolean }[] =
      json.candidates?.[0]?.content?.parts ?? [];
    const textPart = responseParts.find((p) => !p.thought && p.text);
    const text = textPart?.text;

    if (!text) {
      const reason =
        json.candidates?.[0]?.finishReason ??
        json.promptFeedback?.blockReason ??
        "empty response";
      throw new Error(`Gemini returned no content (${reason})`);
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}
