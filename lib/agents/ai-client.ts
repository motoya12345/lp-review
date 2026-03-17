import Anthropic from "@anthropic-ai/sdk";

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
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${input.apiKey}` },
    body: JSON.stringify({
      model: input.modelId, max_tokens: input.maxTokens,
      messages: [{ role: "system", content: input.system }, { role: "user", content: userContent }],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

async function callGemini(input: { modelId: string; apiKey: string; system: string; userText: string; imageB64s: string[]; maxTokens: number }): Promise<string> {
  const parts: unknown[] = [{ text: input.userText }];
  for (const b64 of input.imageB64s) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: b64 } });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${input.modelId}:generateContent?key=${input.apiKey}`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: input.system }] },
      contents:           [{ role: "user", parts }],
      generationConfig:   { maxOutputTokens: input.maxTokens },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
