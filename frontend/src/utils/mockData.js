// Utility to normalize incoming backend result or fallback mock data into standard result structure

export const defaultMockResult = {
  speaker: "Speaker A",
  confidence: 92.4,
  threshold: 60,

  probabilities: [
    { speaker: "Speaker A", probability: 92 },
    { speaker: "Speaker B", probability: 5 },
    { speaker: "Speaker C", probability: 2 },
    { speaker: "Speaker D", probability: 1 }
  ],

  audio: {
    id: "01",
    duration: "00:08",
    sampleRate: "16 kHz",
    analyzedAt: "03 OCT 2026 · 16:42"
  },

  quality: {
    duration: "good",
    noise: "acceptable",
    volume: "good"
  },

  waveform: [20, 35, 60, 45, 80, 95, 70, 40, 65, 85, 90, 50, 30, 65, 80, 55, 40, 25, 60, 75, 45, 30, 50, 35, 20],

  mfcc: []
};

export const normalizeResultData = (rawResult) => {
  if (!rawResult) return defaultMockResult;

  // Handles fractional confidence (0.924 -> 92.4) or percentage (92.4)
  let rawConf = rawResult.confidence ?? rawResult.confidence_score ?? 92.4;
  if (rawConf <= 1.0 && rawConf > 0) {
    rawConf = +(rawConf * 100).toFixed(1);
  } else {
    rawConf = +rawConf.toFixed(1);
  }

  const normalizedSpeaker = rawResult.speaker || rawResult.predicted_speaker || "Speaker A";

  // Probabilities processing
  let probs = defaultMockResult.probabilities;
  if (rawResult.probabilities && Array.isArray(rawResult.probabilities)) {
    probs = rawResult.probabilities;
  } else if (rawResult.top_predictions && Array.isArray(rawResult.top_predictions)) {
    probs = rawResult.top_predictions.map(item => ({
      speaker: item.speaker || item.name,
      probability: Math.round(item.probability <= 1 ? item.probability * 100 : item.probability)
    }));
  }

  // Sanitize speaker labels in probabilities to prevent exposing raw filenames
  probs = probs.map((item, idx) => {
    let name = item.speaker || `Speaker ${String.fromCharCode(65 + idx)}`;
    // Strip file extensions or path names if present
    name = name.replace(/\.(wav|mp3|flac|ogg)$/i, '');
    if (name.includes('/') || name.includes('\\')) {
      name = name.split(/[/\\]/).pop();
    }
    return {
      speaker: name,
      probability: item.probability
    };
  });

  return {
    speaker: normalizedSpeaker.replace(/\.(wav|mp3)$/i, ''),
    confidence: rawConf,
    threshold: rawResult.threshold || 60,
    probabilities: probs,
    audio: {
      id: rawResult.audio?.id || "01",
      duration: rawResult.audio?.duration || "00:08",
      sampleRate: rawResult.audio?.sampleRate || "16 kHz",
      analyzedAt: rawResult.audio?.analyzedAt || new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }).toUpperCase().replace(',', ' ·')
    },
    quality: rawResult.quality || rawResult.quality_flags || {
      duration: "good",
      noise: "acceptable",
      volume: "good"
    },
    waveform: rawResult.waveform || defaultMockResult.waveform,
    mfcc: rawResult.mfcc || defaultMockResult.mfcc,
    summary: rawResult.summary || rawResult.plain_explanation
  };
};
