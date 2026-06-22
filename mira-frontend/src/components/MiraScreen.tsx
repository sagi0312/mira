import { useState } from "react";
import type { FaceAnalysis } from "../types";
import { WebcamCircle } from "./webcam/WebcamCircle";

export const MiraScreen = () => {
  const [result, setResult] = useState<FaceAnalysis | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleResult = (data: FaceAnalysis | null, error?: string) => {
    setResult(data);
    setResultError(error || null);
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-3xl text-bone mb-2 tracking-wide">
        Mira
      </h1>
      <p className="font-body text-slate text-sm mb-12">
        I'm here when you're ready to talk
      </p>

      <WebcamCircle
        onResult={handleResult}
        isAnalyzing={isAnalyzing}
        setIsAnalyzing={setIsAnalyzing}
      />

      {resultError && (
        <p className="mt-8 text-ember/80 font-body text-sm">{resultError}</p>
      )}

      {result && (
        <div className="mt-10 text-center font-body">
          {result.recommended ? (
            <p className="text-bone text-lg">
              You seem{" "}
              <span className="text-ember">
                {result.recommended.type.toLowerCase()}
              </span>
            </p>
          ) : (
            <p className="text-slate text-sm">
              Still getting a read on how you're feeling
            </p>
          )}
        </div>
      )}
    </div>
  );
};
