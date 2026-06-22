import { useWebcam } from "../../hooks/useWebcam";
import { analyzeEmotion } from "../../services/emotionService";
import type { FaceAnalysis } from "../../types";

interface WebcamCircleProps {
  onResult: (result: FaceAnalysis | null, error?: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
}

export const WebcamCircle = ({
  onResult,
  isAnalyzing,
  setIsAnalyzing,
}: WebcamCircleProps) => {
  const { videoRef, isStreaming, error, captureFrame } = useWebcam();

  const handleCapture = async () => {
    const image = captureFrame();
    if (!image) return;

    setIsAnalyzing(true);
    const response = await analyzeEmotion(image);
    setIsAnalyzing(false);

    if (response.success && response.data) {
      onResult(response.data);
    } else {
      onResult(null, response.error || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className={`relative w-64 h-64 rounded-full overflow-hidden border border-slate/30 ${
          isStreaming || isAnalyzing ? "animate-breathe" : ""
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-panel">
            <div className="w-3 h-3 rounded-full bg-ember/40" />
          </div>
        )}
      </div>

      {error && <p className="text-ember/80 text-sm font-body">{error}</p>}

      <button
        onClick={handleCapture}
        disabled={!isStreaming || isAnalyzing}
        className="px-8 py-3 rounded-full bg-ember/90 hover:bg-ember disabled:opacity-50 text-ink font-body font-medium transition-colors"
      >
        {isAnalyzing ? "Reading…" : "I'm here"}
      </button>
    </div>
  );
};
