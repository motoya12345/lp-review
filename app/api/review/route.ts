import { NextRequest } from "next/server";
import { runAgentLoop } from "@/lib/agents/orchestrator";
import type { AgentStep } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { context, lpUrl, pcImage, spImage, provider, modelId, apiKey } = await req.json();

  const encoder = new TextEncoder();
  const stream  = new TransformStream();
  const writer  = stream.writable.getWriter();

  const send = (event: string, data: unknown) =>
    writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

  const prov  = provider ?? "claude";
  const model = modelId  ?? "claude-sonnet-4-6";

  const pcB64 = pcImage?.replace(/^data:image\/\w+;base64,/, "") as string | undefined;
  const spB64 = spImage?.replace(/^data:image\/\w+;base64,/, "") as string | undefined;

  (async () => {
    try {
      // ── PC レビュー ──────────────────────────────────
      if (pcB64) {
        const pcResult = await runAgentLoop({
          context, lpUrl,
          pcImageB64: pcB64,
          provider: prov, modelId: model, apiKey,
          onStep: (step: AgentStep) =>
            send("step", { ...step, id: `pc:${step.id}`, label: `[PC] ${step.label}` }),
        });
        send("result_pc", pcResult);
      }

      // ── SP レビュー ──────────────────────────────────
      if (spB64) {
        const spResult = await runAgentLoop({
          context, lpUrl,
          spImageB64: spB64,
          provider: prov, modelId: model, apiKey,
          onStep: (step: AgentStep) =>
            send("step", { ...step, id: `sp:${step.id}`, label: `[SP] ${step.label}` }),
        });
        send("result_sp", spResult);
      }
    } catch (err: unknown) {
      send("error", { message: err instanceof Error ? err.message : String(err) });
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
