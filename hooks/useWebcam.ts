"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export type WebcamError = "permission-denied" | "no-device" | "unknown";

const CAPTURE_MAX_WIDTH = 640;
const CAPTURE_JPEG_QUALITY = 0.8;

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: WebcamError | null;
  startCamera: () => Promise<boolean>;
  captureFrame: () => string | null;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<WebcamError | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsStreaming(true);
      return true;
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("permission-denied");
        } else if (err.name === "NotFoundError") {
          setError("no-device");
        } else {
          setError("unknown");
        }
      } else {
        setError("unknown");
      }
      setIsStreaming(false);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return null;

    // downscale: Rekognition doesn't need full resolution, and a
    // small payload keeps uploads fast on slow connections
    const scale = Math.min(1, CAPTURE_MAX_WIDTH / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg", CAPTURE_JPEG_QUALITY);

    stopCamera();

    return base64Image;
  }, [stopCamera]);

  return { videoRef, isStreaming, error, startCamera, captureFrame };
}
