export const DEFAULT_CONFIDENCE_THRESHOLD = 52;

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface ConfidenceState {
  level: ConfidenceLevel;
  isBelowThreshold: boolean;
  isUnknown: boolean;
  badgeText: string;
}

export function getConfidenceState(
  confidencePct: number,
  threshold = DEFAULT_CONFIDENCE_THRESHOLD
): ConfidenceState {
  const val = Number(confidencePct) || 0;

  if (val >= 75) {
    return { level: "HIGH", isBelowThreshold: false, isUnknown: false, badgeText: "HIGH CONFIDENCE" };
  } else if (val >= threshold) {
    return { level: "MEDIUM", isBelowThreshold: false, isUnknown: false, badgeText: "MEDIUM CONFIDENCE" };
  } else {
    return { level: "LOW", isBelowThreshold: true, isUnknown: true, badgeText: "LOW CONFIDENCE" };
  }
}

export function generatePlainSummary(
  speaker = "Speaker A",
  confidencePct = 92.4,
  probabilities: Array<{ speaker: string; probability: number }> = []
) {
  const runnerUp = probabilities.length > 1 ? probabilities[1] : null;
  const val = Number(confidencePct) || 0;

  if (val >= DEFAULT_CONFIDENCE_THRESHOLD) {
    if (runnerUp) {
      return `This voice matches ${speaker} with ${val.toFixed(1)}% confidence. The next closest match was ${runnerUp.speaker} at ${runnerUp.probability}%.`;
    }
    return `This voice matches ${speaker} with ${val.toFixed(1)}% confidence.`;
  }

  return `This voice does not match any enrolled speaker with sufficient confidence (achieved ${val.toFixed(1)}%, which is below the required ${DEFAULT_CONFIDENCE_THRESHOLD}% threshold).`;
}
