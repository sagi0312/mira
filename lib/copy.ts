/**
 * Everything Mira says lives here. Components pick a line; they never
 * contain language themselves.
 *
 * Emotion labels translate Rekognition's machine vocabulary into
 * Mira's voice. The server reports raw AWS types; only the frontend
 * speaks them.
 */

const EMOTION_LABELS: Record<string, string> = {
  HAPPY: "happy",
  SAD: "sad",
  CALM: "calm",
  ANGRY: "frustrated",
  CONFUSED: "unsure",
  DISGUSTED: "unsettled",
  SURPRISED: "wound up",
  FEAR: "uneasy",
  UNKNOWN: "hard to read",
};

export function emotionLabel(type: string): string {
  return EMOTION_LABELS[type] ?? EMOTION_LABELS.UNKNOWN;
}

export const copy = {
  welcome: "i'm here when you're ready",
  noticing: "I've got you",
  reads: {
    clear: (label: string) => `you seem ${label} tonight`,
    single: (label: string) =>
      `you seem a little ${label}... tell me how you're feeling?`,
    pair: (a: string, b: string) =>
      `i'm sensing some ${a}... maybe some ${b} too. what's happening for you?`,
    open: "how are you feeling tonight?",
  },

  errors: {
    webcam: {
      "permission-denied": "mira needs your permission to see you",
      "no-device": "mira can't find a camera here",
      unknown: "something drifted. try again in a moment",
    },
    captureFailed: "mira couldn't quite see you. try again in a moment",
    analysisFailed: "something drifted. try again",
  },
} as const;
