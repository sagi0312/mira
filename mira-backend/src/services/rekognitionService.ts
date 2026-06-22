import {
  RekognitionClient,
  DetectFacesCommand,
} from "@aws-sdk/client-rekognition";
import {
  FaceAnalysis,
  RekognitionResponse,
  EmotionResult,
  RECOMMENDED_THRESHOLD,
} from "../types";

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
});

export async function analyzeFace(
  imageBytes: Buffer,
): Promise<RekognitionResponse> {
  try {
    const command = new DetectFacesCommand({
      Image: { Bytes: imageBytes },
      Attributes: ["ALL"],
    });

    const response = await client.send(command);

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

    const top = emotions[0];
    const recommended =
      top && top.confidence >= RECOMMENDED_THRESHOLD ? top : null;

    const analysis: FaceAnalysis = {
      emotions,
      recommended,
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
