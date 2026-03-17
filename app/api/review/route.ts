import { NextRequest } from "next/server";
import { runAgentLoop } from "@/lib/agents/orchestrator";
import type { AgentStep } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { context, lpUrl, pcImage, spImage, provider, modelId, apiKey } = body;

  const encoder = new TextEncoder();
  const stream  = new TransformStream();
  const writer  = stream.writable.getWriter();

  const send = (event: string, data: unknown) => {
    writer.write(
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    );
  };

  (async () => {
    try {
      const result = await runAgentLoop({
        context,
        lpUrl,
        pcImageB64: pcImage?.replace(/^data:image\/\w+;base64,/, ""),
        spImageB64: spImage?.replace(/^data:image\/\w+;base64,/, ""),
        provider:   provider ?? "claude",
        modelId:    modelId  ?? "claude-sonnet-4-6",
        apiKey,
        onStep: (step: AgentStep) => send("step", step),
      });
      send("result", result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      send("error", { message });
    } finally {
      writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
    },
  });
}
