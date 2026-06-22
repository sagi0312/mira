export const RECOMMENDED_THRESHOLD = 91;

export interface EmotionResult {
  type: string;
  confidence: number;
}

export interface FaceAnalysis {
  emotions: EmotionResult[];
  recommended: EmotionResult | null;
  ageRange: {
    low: number;
    high: number;
  };
}

export interface RekognitionResponse {
  success: boolean;
  data?: FaceAnalysis;
  error?: string;
}
