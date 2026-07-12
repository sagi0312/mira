import type { DetectFacesCommandOutput } from "@aws-sdk/client-rekognition";
import {
  FaceAnalysis,
  RekognitionResponse,
  EmotionResult,
  ReadKind,
  RECOMMENDED_THRESHOLD,
  PRESENCE_THRESHOLD,
} from "@/types";

const USE_MOCK = process.env.MOCK_REKOGNITION === "true";

async function detectFaces(
  imageBytes: Buffer,
): Promise<DetectFacesCommandOutput> {
  if (USE_MOCK) {
    const { mockDetectFaces } = await import("./mockDetectFaces");
    return mockDetectFaces();
  }

  const { RekognitionClient, DetectFacesCommand } =
    await import("@aws-sdk/client-rekognition");
  const client = new RekognitionClient({ region: process.env.AWS_REGION });
  return client.send(
    new DetectFacesCommand({
      Image: { Bytes: imageBytes },
      Attributes: ["ALL"],
    }),
  );
}

interface Classification {
  readKind: ReadKind;
  recommended: EmotionResult | null;
  spokenEmotions: EmotionResult[];
}

/** emotions must be sorted by confidence descending */
export function classifyEmotions(emotions: EmotionResult[]): Classification {
  const present = emotions.filter((e) => e.confidence >= PRESENCE_THRESHOLD);

  if (present.length === 1) {
    const top = present[0];
    if (top.confidence >= RECOMMENDED_THRESHOLD) {
      return { readKind: "clear", recommended: top, spokenEmotions: [top] };
    }
    return { readKind: "single", recommended: null, spokenEmotions: [top] };
  }

  if (present.length === 2) {
    return { readKind: "pair", recommended: null, spokenEmotions: present };
  }

  // 0 or 3 above threshold: nothing worth asserting
  return { readKind: "open", recommended: null, spokenEmotions: [] };
}

export async function analyzeFace(
  imageBytes: Buffer,
): Promise<RekognitionResponse> {
  try {
    const response = await detectFaces(imageBytes);

    if (!response.FaceDetails || response.FaceDetails.length === 0) {
      return { success: false, error: "No face detected" };
    }

    const face = response.FaceDetails[0];

    const emotions: EmotionResult[] = (face.Emotions || [])
      .map((e) => ({
        type: e.Type || "UNKNOWN",
        confidence: e.Confidence || 0,
      }))
      .sort((a, b) => b.confidence - a.confidence);

    const { readKind, recommended, spokenEmotions } =
      classifyEmotions(emotions);

    const analysis: FaceAnalysis = {
      emotions,
      recommended,
      readKind,
      spokenEmotions,
      ageRange: {
        low: face.AgeRange?.Low || 0,
        high: face.AgeRange?.High || 0,
      },
    };

    return { success: true, data: analysis };
  } catch (error) {
    console.error("Rekognition error:", error);
    return { success: false, error: "Failed to analyze face" };
  }
}
