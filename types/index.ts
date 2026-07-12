export const RECOMMENDED_THRESHOLD = 91;
export const PRESENCE_THRESHOLD = 30;

export type ReadKind = "clear" | "single" | "pair" | "open";

export interface EmotionResult {
  type: string;
  confidence: number;
}

export interface FaceAnalysis {
  emotions: EmotionResult[];
  recommended: EmotionResult | null;
  readKind: ReadKind;
  /** the emotions worth speaking about: 1 for clear/single, 2 for pair, 0 for open */
  spokenEmotions: EmotionResult[];
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
