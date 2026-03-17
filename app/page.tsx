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
  const [result,   setResult]   = useState<ReviewResult | null>(null);

  function handleResult(r: ReviewResult) {
    setResult(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setResult(null);
    setPcImage(null);
    setSpImage(null);
    setContext("");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <NavBar onReset={result ? handleReset : undefined} />
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
            onResult={handleResult}
          />
        ) : (
          <ResultPhase
            result={result}
            pcImage={pcImage}
            spImage={spImage}
            provider={provider.name}
            modelId={modelId}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
