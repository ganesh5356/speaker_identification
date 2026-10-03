export const DEFAULT_CONFIDENCE_THRESHOLD = 60; // 60% threshold

export function getConfidenceState(confidencePct, threshold = DEFAULT_CONFIDENCE_THRESHOLD) {
  const val = Number(confidencePct) || 0;

  if (val >= 80) {
    return {
      level: "HIGH",
      colorClass: "level-high",
      isBelowThreshold: false,
      isUnknown: false,
      badgeText: "HIGH CONFIDENCE",
    };
  } else if (val >= threshold) {
    return {
      level: "MEDIUM",
      colorClass: "level-medium",
      isBelowThreshold: false,
      isUnknown: false,
      badgeText: "MEDIUM CONFIDENCE",
    };
  } else {
    return {
      level: "LOW",
      colorClass: "level-low",
      isBelowThreshold: true,
      isUnknown: true,
      badgeText: "LOW CONFIDENCE",
    };
  }
}

export const getConfidenceStatus = getConfidenceState;

export function generatePlainSummary(speaker = "Speaker A", confidencePct = 92.4, probabilities = []) {
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

export const generatePlainLanguageSummary = generatePlainSummary;
