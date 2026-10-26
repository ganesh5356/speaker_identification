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

  authenticity: {
    classification: "Human",
    is_human: true,
    confidence: 89.4,
    human_probability: 89.4,
    synthetic_probability: 10.6,
    risk_level: "LOW",
    verdict_title: "Verified Authentic Human Voice",
    explanation: "Biological vocal tract characteristics confirmed (89.4% authentic human confidence). Organic pitch intonation, natural vocal resonances, and authentic speech dynamics detected.",
    indicators: {
      neural_score: 89.4,
      pitch_dynamics: "Organic Human Dynamics (185 Hz avg, ±42 Hz)",
      avg_pitch_hz: 185.0,
      spectral_naturalness: 92.5,
      vocoder_artifacts: "None (Authentic Biological Acoustics)"
    }
  },

  waveform: [20, 35, 60, 45, 80, 95, 70, 40, 65, 85, 90, 50, 30, 65, 80, 55, 40, 25, 60, 75, 45, 30, 50, 35, 20],

  mfcc: []
};

export const normalizeResultData = (rawResult) => {
  if (!rawResult) return defaultMockResult;

  // Handles fractional confidence (0.85 -> 85.0) or percentage (85.0)
  let rawConf = rawResult.confidence ?? rawResult.similarity ?? rawResult.confidence_score ?? 92.4;
  if (rawConf <= 1.0 && rawConf > 0) {
    rawConf = +(rawConf * 100).toFixed(1);
  } else {
    rawConf = +rawConf.toFixed(1);
  }

  let threshold = rawResult.threshold ?? 45;
  if (threshold <= 1.0 && threshold > 0) {
    threshold = +(threshold * 100).toFixed(0);
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

  // Authenticity normalization
  const defaultAuth = defaultMockResult.authenticity;
  const rawAuth = rawResult.authenticity || {};
  const isHuman = rawAuth.is_human !== undefined ? rawAuth.is_human : (rawAuth.classification !== "AI-Generated");
  const humanProb = Number(rawAuth.human_probability ?? (isHuman ? (rawAuth.confidence ?? defaultAuth.confidence) : (100 - (rawAuth.confidence ?? 85.0))));
  const synthProb = Number(rawAuth.synthetic_probability ?? (100 - humanProb));

  const normalizedAuth = {
    classification: rawAuth.classification || (isHuman ? "Human" : "AI-Generated"),
    is_human: isHuman,
    confidence: Number(rawAuth.confidence ?? (isHuman ? humanProb : synthProb)),
    human_probability: +humanProb.toFixed(1),
    synthetic_probability: +synthProb.toFixed(1),
    risk_level: rawAuth.risk_level || (isHuman ? "LOW" : (synthProb >= 80 ? "HIGH" : "MEDIUM")),
    verdict_title: rawAuth.verdict_title || (isHuman ? "Verified Authentic Human Voice" : "Synthetic Voice / AI Deepfake Detected"),
    explanation: rawAuth.explanation || (isHuman 
      ? `Biological vocal tract characteristics confirmed (${humanProb.toFixed(1)}% authentic human confidence). Organic pitch intonation and natural vocal resonances detected.` 
      : `Acoustic sequence characteristics indicate synthetic speech synthesis or voice cloning (${synthProb.toFixed(1)}% synthetic confidence).`),
    indicators: {
      neural_score: Number(rawAuth.indicators?.neural_score ?? (isHuman ? humanProb : synthProb)),
      pitch_dynamics: rawAuth.indicators?.pitch_dynamics ?? (isHuman ? "Organic Human Dynamics" : "Robotic Pitch Flattening"),
      avg_pitch_hz: Number(rawAuth.indicators?.avg_pitch_hz ?? 185.0),
      spectral_naturalness: Number(rawAuth.indicators?.spectral_naturalness ?? (isHuman ? 92.5 : 38.0)),
      vocoder_artifacts: rawAuth.indicators?.vocoder_artifacts ?? (isHuman ? "None (Authentic Biological Acoustics)" : "Neural Vocoder Signature Detected")
    }
  };

  return {
    speaker: normalizedSpeaker.replace(/\.(wav|mp3)$/i, ''),
    confidence: rawConf,
    threshold: threshold,
    is_known: rawResult.is_known,
    probabilities: probs,
    authenticity: normalizedAuth,
    timeline: rawResult.timeline || [],
    multi_speaker: rawResult.multi_speaker || false,
    active_speakers: rawResult.active_speakers || [normalizedSpeaker],
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
    summary: rawResult.summary || rawResult.plain_explanation,
    transcription: rawResult.transcription || "No words recognized."
  };
};
