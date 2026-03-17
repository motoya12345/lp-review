"use client";
import { useState } from "react";
import NavBar from "@/components/NavBar";
import InputPhase from "@/components/InputPhase";
import ResultPhase from "@/components/ResultPhase";
import { ReviewResult } from "@/lib/types";
import { C } from "@/lib/tokens";

interface ResultState {
  result: ReviewResult;
  pcImage: string | null;
  spImage: string | null;
  providerName: string;
  modelId: string;
}

export default function Home() {
  const [resultState, setResultState] = useState<ResultState | null>(null);

  function handleResult(
    result: unknown,
    pcImage: string | null,
    spImage: string | null,
    providerName: string,
    modelId: string,
  ) {
    setResultState({
      result: result as ReviewResult,
      pcImage,
      spImage,
      providerName,
      modelId,
    });
  }

  function handleReset() {
    setResultState(null);
  }

  return (
    <>
      <NavBar />
      <main
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "32px 24px 64px",
          background: C.bg,
          minHeight: "calc(100vh - 52px)",
        }}
      >
        {!resultState ? (
          <InputPhase onResult={handleResult} />
        ) : (
          <ResultPhase
            result={resultState.result}
            pcImage={resultState.pcImage}
            spImage={resultState.spImage}
            providerName={resultState.providerName}
            modelId={resultState.modelId}
            onReset={handleReset}
          />
        )}
      </main>
    </>
  );
}
