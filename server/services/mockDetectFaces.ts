import type { DetectFacesCommandOutput } from "@aws-sdk/client-rekognition";

/**
 * Raw DetectFaces responses, shaped exactly like AWS returns them
 * (uppercase Type/Confidence, FaceDetails array). All processing
 * happens in the real service code.
 *
 * To test a different case, change ACTIVE_SCENARIO below.
 */
const ACTIVE_SCENARIO: MockScenario = "openMuddled"; // "clear" | "clearHappy" | "single" | "pair" | "openMuddled" | "openFlat" | "noFace" | "failure"

type MockScenario = keyof typeof MOCK_SCENARIOS;

const MOCK_SCENARIOS = {
  // one emotion at 91+: "clear" bucket
  clear: {
    $metadata: {},
    FaceDetails: [
      {
        Emotions: [
          { Type: "CALM", Confidence: 93.4 },
          { Type: "SAD", Confidence: 3.2 },
          { Type: "HAPPY", Confidence: 1.1 },
          { Type: "CONFUSED", Confidence: 0.8 },
          { Type: "ANGRY", Confidence: 0.5 },
          { Type: "SURPRISED", Confidence: 0.3 },
          { Type: "DISGUSTED", Confidence: 0.2 },
          { Type: "FEAR", Confidence: 0.1 },
        ],
        AgeRange: { Low: 38, High: 46 },
      },
    ],
  },

  // one emotion at 91+, happy variant: "clear" bucket
  clearHappy: {
    $metadata: {},
    FaceDetails: [
      {
        Emotions: [
          { Type: "HAPPY", Confidence: 97.8 },
          { Type: "CALM", Confidence: 1.4 },
          { Type: "SURPRISED", Confidence: 0.4 },
          { Type: "CONFUSED", Confidence: 0.2 },
          { Type: "SAD", Confidence: 0.1 },
          { Type: "ANGRY", Confidence: 0.05 },
          { Type: "DISGUSTED", Confidence: 0.03 },
          { Type: "FEAR", Confidence: 0.02 },
        ],
        AgeRange: { Low: 36, High: 44 },
      },
    ],
  },

  // real captured response: one emotion above 30, under 91: "single" bucket
  single: {
    $metadata: {},
    FaceDetails: [
      {
        Emotions: [
          { Type: "CALM", Confidence: 50.97 },
          { Type: "SAD", Confidence: 18.37 },
          { Type: "ANGRY", Confidence: 5.43 },
          { Type: "CONFUSED", Confidence: 2.1 },
          { Type: "DISGUSTED", Confidence: 1.15 },
          { Type: "SURPRISED", Confidence: 0.14 },
          { Type: "HAPPY", Confidence: 0.13 },
          { Type: "FEAR", Confidence: 0.03 },
        ],
        AgeRange: { Low: 38, High: 46 },
      },
    ],
  },

  // two emotions above 30: "pair" bucket
  pair: {
    $metadata: {},
    FaceDetails: [
      {
        Emotions: [
          { Type: "SAD", Confidence: 44.2 },
          { Type: "CALM", Confidence: 36.1 },
          { Type: "CONFUSED", Confidence: 4.8 },
          { Type: "ANGRY", Confidence: 2.3 },
          { Type: "FEAR", Confidence: 1.2 },
          { Type: "DISGUSTED", Confidence: 0.6 },
          { Type: "SURPRISED", Confidence: 0.3 },
          { Type: "HAPPY", Confidence: 0.1 },
        ],
        AgeRange: { Low: 39, High: 47 },
      },
    ],
  },

  // three emotions above 30: "open" bucket
  openMuddled: {
    $metadata: {},
    FaceDetails: [
      {
        Emotions: [
          { Type: "CONFUSED", Confidence: 33.5 },
          { Type: "CALM", Confidence: 31.9 },
          { Type: "SAD", Confidence: 30.2 },
          { Type: "SURPRISED", Confidence: 2.8 },
          { Type: "ANGRY", Confidence: 1.1 },
          { Type: "FEAR", Confidence: 0.9 },
          { Type: "DISGUSTED", Confidence: 0.2 },
          { Type: "HAPPY", Confidence: 0.1 },
        ],
        AgeRange: { Low: 37, High: 45 },
      },
    ],
  },

  // nothing above 30: "open" bucket, flat face
  openFlat: {
    $metadata: {},
    FaceDetails: [
      {
        Emotions: [
          { Type: "CALM", Confidence: 24.5 },
          { Type: "SAD", Confidence: 21.2 },
          { Type: "CONFUSED", Confidence: 15.8 },
          { Type: "ANGRY", Confidence: 8.1 },
          { Type: "SURPRISED", Confidence: 4.2 },
          { Type: "FEAR", Confidence: 2.9 },
          { Type: "DISGUSTED", Confidence: 1.4 },
          { Type: "HAPPY", Confidence: 0.9 },
        ],
        AgeRange: { Low: 40, High: 48 },
      },
    ],
  },

  // no face in frame: exercises the "No face detected" branch
  noFace: {
    $metadata: {},
    FaceDetails: [],
  },

  // Rekognition call fails: exercises the catch/error path
  failure: null,
} satisfies Record<string, DetectFacesCommandOutput | null>;

export async function mockDetectFaces(): Promise<DetectFacesCommandOutput> {
  const output = MOCK_SCENARIOS[ACTIVE_SCENARIO];
  if (output === null) {
    throw new Error("mock: simulated Rekognition failure");
  }
  return output;
}
