import { useRef, useState, useCallback, useEffect } from "react";

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: string | null;
  captureFrame: () => string | null;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setIsStreaming(true);
      } catch {
        if (!cancelled) {
          setError("Could not access camera. Please check permissions.");
          setIsStreaming(false);
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg", 0.9);

    stopCamera();

    return base64Image;
  }, [stopCamera]);

  return { videoRef, isStreaming, error, captureFrame };
}
