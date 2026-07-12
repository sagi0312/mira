"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceAnalysis } from "@/types";
import { useWebcam } from "@/hooks/useWebcam";
import { analyzeEmotion } from "@/services/emotionService";
import { copy, emotionLabel } from "@/lib/copy";
import {
  LanternSky,
  NOTICING_DURATION_MS,
  type LanternPhase,
} from "./LanternSky";

export const MiraScreen = () => {
  const { videoRef, error, startCamera, captureFrame } = useWebcam();

  const [phase, setPhase] = useState<LanternPhase>("resting");
  const [result, setResult] = useState<FaceAnalysis | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const captureTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (captureTimeoutRef.current !== null) {
        window.clearTimeout(captureTimeoutRef.current);
      }
    };
  }, []);

  const handleImReady = async () => {
    if (phase !== "resting") return;

    const started = await startCamera();
    if (!started) return;

    setPhase("noticing");

    captureTimeoutRef.current = window.setTimeout(async () => {
      const image = captureFrame();
      setPhase("warm");

      if (!image) {
        setResultError(copy.errors.captureFailed);
        return;
      }

      const response = await analyzeEmotion(image);

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setResultError(response.error || copy.errors.analysisFailed);
      }
    }, NOTICING_DURATION_MS);
  };

  const readLine = (r: FaceAnalysis): string => {
    if (r.readKind === "clear" && r.spokenEmotions[0]) {
      return copy.reads.clear(emotionLabel(r.spokenEmotions[0].type));
    }
    if (r.readKind === "single" && r.spokenEmotions[0]) {
      return copy.reads.single(emotionLabel(r.spokenEmotions[0].type));
    }
    if (r.readKind === "pair" && r.spokenEmotions[1]) {
      return copy.reads.pair(
        emotionLabel(r.spokenEmotions[0].type),
        emotionLabel(r.spokenEmotions[1].type),
      );
    }
    return copy.reads.open;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <LanternSky phase={phase} />

      {/* hidden video: the stream needs a playing element to capture from */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      {/* invisible click target over the lantern (canvas draws it at 40% height) */}
      {phase === "resting" && (
        <button
          onClick={handleImReady}
          aria-label="begin"
          className="absolute left-1/2 top-[40vh] z-20 h-48 w-48 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
        />
      )}

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center">
        <h1 className="animate-settle font-display text-[28px] font-light uppercase tracking-[0.42em] text-moon/85 [animation-delay:0.6s] [text-indent:0.42em]">
          Mira
        </h1>

        {phase === "resting" && (
          <p className="animate-settle mt-3.5 font-body text-[13.5px] font-extralight tracking-[0.14em] text-mist/55 [animation-delay:1.4s]">
            {copy.welcome}
          </p>
        )}
        {phase === "noticing" && (
          <p className="animate-settle mt-3.5 font-body text-[13.5px] font-extralight tracking-[0.14em] text-mist/55 [animation-delay:0.3s]">
            {copy.noticing}
          </p>
        )}
        {phase === "warm" && (result || resultError) && (
          <div className="animate-settle mt-[26vh] text-center font-body [animation-delay:0.8s]">
            {result ? (
              <p className="text-[15px] font-light tracking-[0.08em] text-moon/70">
                {readLine(result)}
              </p>
            ) : (
              <p className="text-[13.5px] font-extralight tracking-[0.08em] text-mist/60">
                {resultError}
              </p>
            )}
          </div>
        )}

        {error && phase === "resting" && (
          <p className="animate-settle mt-8 font-body text-[13px] font-extralight tracking-[0.08em] text-mist/60">
            {copy.errors.webcam[error]}
          </p>
        )}
      </div>
    </div>
  );
};
