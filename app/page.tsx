"use client";
import { useState } from "react";
import NavBar from "@/components/NavBar";
import InputPhase from "@/components/InputPhase";
import ResultPhase from "@/components/ResultPhase";
import HistoryPanel from "@/components/HistoryPanel";
import { ReviewResult, ReviewHistory } from "@/lib/types";
import { C } from "@/lib/tokens";

interface ResultState {
  result:       ReviewResult;
  pcImage:      string | null;
  spImage:      string | null;
  providerName: string;
  modelId:      string;
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
    // 結果が出たらトップへスクロール
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setResultState(null);
  }

  function handleHistorySelect(history: ReviewHistory) {
    setResultState({
      result:       history.result,
      pcImage:      null,
      spImage:      null,
      providerName: "履歴",
      modelId:      "saved",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <NavBar />
      <main
        style={{
          maxWidth:  680,
          margin:    "0 auto",
          padding:   "32px 24px 64px",
          background: C.bg,
          minHeight: "calc(100vh - 52px)",
        }}
      >
        {!resultState ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <InputPhase onResult={handleResult} />
            <HistoryPanel onSelect={handleHistorySelect} />
          </div>
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
