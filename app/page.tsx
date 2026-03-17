"use client";

import { useState } from "react";
import NavBar           from "@/components/NavBar";
import { InputPhase }   from "@/components/InputPhase";
import { ResultPhase }  from "@/components/ResultPhase";
import { PROVIDERS }    from "@/lib/providers";
import type { ReviewResult, Provider } from "@/lib/types";
import { C } from "@/lib/tokens";

export default function Page() {
  const [context,  setContext]  = useState("");
  const [pcImage,  setPcImage]  = useState<string | null>(null);
  const [spImage,  setSpImage]  = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>(PROVIDERS[0]);
  const [modelId,  setModelId]  = useState(PROVIDERS[0].models[0].id);
  const [apiKey,   setApiKey]   = useState("");

  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [result,  setResult]    = useState<ReviewResult | null>(null);

  const run = async () => {
    if (!context.trim() || (!pcImage && !spImage)) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res  = await fetch("/api/review", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          pcImage:  pcImage  ?? undefined,
          spImage:  spImage  ?? undefined,
          provider: provider.id,
          modelId,
          apiKey:   provider.needsKey ? apiKey : undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPcImage(null);
    setSpImage(null);
    setContext("");
    setError(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <NavBar onReset={result ? reset : undefined} />
      <div style={{
        maxWidth:   result ? 1200 : 680,
        margin:     "0 auto",
        padding:    "48px 24px 88px",
        transition: "max-width .3s",
      }}>
        {!result ? (
          <InputPhase
            context={context}     setContext={setContext}
            pcImage={pcImage}     setPcImage={setPcImage}
            spImage={spImage}     setSpImage={setSpImage}
            provider={provider}   setProvider={setProvider}
            modelId={modelId}     setModelId={setModelId}
            apiKey={apiKey}       setApiKey={setApiKey}
            loading={loading}     error={error}
            onRun={run}
          />
        ) : (
          <ResultPhase
            result={result}
            pcImage={pcImage}
            spImage={spImage}
            provider={provider.name}
            modelId={modelId}
            onReset={reset}
          />
        )}
      </div>
    </div>
  );
}
