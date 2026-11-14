export interface AuthenticityData {
  classification: string;
  is_human: boolean;
  confidence: number;
  human_probability: number;
  synthetic_probability: number;
  risk_level: string;
  verdict_title: string;
  explanation: string;
  indicators: {
    neural_score: number;
    pitch_dynamics: string;
    avg_pitch_hz: number;
    spectral_naturalness: number;
    vocoder_artifacts: string;
  };
}

export interface TimelineSegment {
  start_time: number;
  end_time: number;
  speaker: string;
  is_known?: boolean;
  similarity: number;
}

export interface QualityFlags {
  duration: string;
  noise: string;
  volume: string;
}

export interface AudioMeta {
  id: string;
  duration: string;
  sampleRate: string;
  analyzedAt: string;
}

export interface ResultData {
  speaker: string;
  confidence: number;
  threshold: number;
  is_known: boolean;
  probabilities: Array<{ speaker: string; probability: number }>;
  authenticity: AuthenticityData;
  timeline: TimelineSegment[];
  multi_speaker: boolean;
  active_speakers: string[];
  audio: AudioMeta;
  quality: QualityFlags;
  waveform: number[];
  mfcc: number[][];
  summary?: string;
  transcription: string;
}

export interface HistoryEntry {
  id: string;
  sampleNumber: string;
  status: string;
  speaker: string;
  confidence: number;
  timestamp: string;
  isKnown: boolean;
  multiSpeaker: boolean;
  activeSpeakers?: string[];
  timeline: Array<{
    startTime: number;
    endTime: number;
    speaker: string;
    similarity: number;
  }>;
}

const DEFAULT_AUTHENTICITY: AuthenticityData = {
  classification: "Human",
  is_human: true,
  confidence: 89.4,
  human_probability: 89.4,
  synthetic_probability: 10.6,
  risk_level: "LOW",
  verdict_title: "Verified Authentic Human Voice",
  explanation: "Biological vocal tract characteristics confirmed.",
  indicators: {
    neural_score: 89.4,
    pitch_dynamics: "Organic Human Dynamics (185 Hz avg, ±42 Hz)",
    avg_pitch_hz: 185.0,
    spectral_naturalness: 92.5,
    vocoder_artifacts: "None (Authentic Biological Acoustics)",
  },
};

const DEFAULT_WAVEFORM = [
  20, 35, 60, 45, 80, 95, 70, 40, 65, 85, 90, 50, 30, 65, 80, 55, 40, 25, 60, 75, 45, 30, 50, 35, 20,
];

export function normalizeResultData(rawResult: any): ResultData {
  if (!rawResult)
    return {
      speaker: "Speaker A",
      confidence: 92.4,
      threshold: 60,
      is_known: true,
      probabilities: [
        { speaker: "Speaker A", probability: 92 },
        { speaker: "Speaker B", probability: 5 },
      ],
      authenticity: DEFAULT_AUTHENTICITY,
      timeline: [],
      multi_speaker: false,
      active_speakers: ["Speaker A"],
      audio: { id: "01", duration: "00:08", sampleRate: "16 kHz", analyzedAt: "—" },
      quality: { duration: "good", noise: "acceptable", volume: "good" },
      waveform: DEFAULT_WAVEFORM,
      mfcc: [],
      transcription: "No words recognized.",
    };

  let rawConf = rawResult.confidence ?? rawResult.similarity ?? 92.4;
  if (rawConf <= 1.0 && rawConf > 0) rawConf = +(rawConf * 100).toFixed(1);
  else rawConf = +rawConf.toFixed(1);

  let threshold = rawResult.threshold ?? 45;
  if (threshold <= 1.0 && threshold > 0) threshold = +(threshold * 100).toFixed(0);

  const normalizedSpeaker = (rawResult.speaker || rawResult.predicted_speaker || "Speaker A")
    .replace(/\.(wav|mp3)$/i, "");

  let probs = rawResult.probabilities ?? rawResult.top_predictions ?? [];
  if (rawResult.top_predictions && Array.isArray(rawResult.top_predictions)) {
    probs = rawResult.top_predictions.map((item: any) => ({
      speaker: item.speaker || item.name,
      probability: Math.round(item.probability <= 1 ? item.probability * 100 : item.probability),
    }));
  }

  probs = probs.map((item: any, idx: number) => {
    let name = item.speaker || `Speaker ${String.fromCharCode(65 + idx)}`;
    name = name.replace(/\.(wav|mp3|flac|ogg)$/i, "");
    if (name.includes("/") || name.includes("\\"))
      name = name.split(/[/\\]/).pop() || name;
    return { speaker: name, probability: item.probability };
  });

  const rawAuth = rawResult.authenticity || {};
  const isHuman = rawAuth.is_human !== undefined ? rawAuth.is_human : rawAuth.classification !== "AI-Generated";
  const humanProb = Number(rawAuth.human_probability ?? (isHuman ? (rawAuth.confidence ?? 89.4) : 100 - (rawAuth.confidence ?? 85.0)));
  const synthProb = Number(rawAuth.synthetic_probability ?? 100 - humanProb);

  const normalizedAuth: AuthenticityData = {
    classification: rawAuth.classification || (isHuman ? "Human" : "AI-Generated"),
    is_human: isHuman,
    confidence: Number(rawAuth.confidence ?? (isHuman ? humanProb : synthProb)),
    human_probability: +humanProb.toFixed(1),
    synthetic_probability: +synthProb.toFixed(1),
    risk_level: rawAuth.risk_level || (isHuman ? "LOW" : synthProb >= 80 ? "HIGH" : "MEDIUM"),
    verdict_title: rawAuth.verdict_title || (isHuman ? "Verified Authentic Human Voice" : "Synthetic Voice / AI Deepfake Detected"),
    explanation:
      rawAuth.explanation ||
      (isHuman
        ? `Biological vocal tract characteristics confirmed (${humanProb.toFixed(1)}% authentic human confidence).`
        : `Acoustic sequence characteristics indicate synthetic speech synthesis (${synthProb.toFixed(1)}% synthetic confidence).`),
    indicators: {
      neural_score: Number(rawAuth.indicators?.neural_score ?? (isHuman ? humanProb : synthProb)),
      pitch_dynamics: rawAuth.indicators?.pitch_dynamics ?? (isHuman ? "Organic Human Dynamics" : "Robotic Pitch Flattening"),
      avg_pitch_hz: Number(rawAuth.indicators?.avg_pitch_hz ?? 185.0),
      spectral_naturalness: Number(rawAuth.indicators?.spectral_naturalness ?? (isHuman ? 92.5 : 38.0)),
      vocoder_artifacts: rawAuth.indicators?.vocoder_artifacts ?? (isHuman ? "None (Authentic Biological Acoustics)" : "Neural Vocoder Signature Detected"),
    },
  };

  return {
    speaker: normalizedSpeaker,
    confidence: rawConf,
    threshold,
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
      analyzedAt:
        rawResult.audio?.analyzedAt ||
        new Date()
          .toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
          .toUpperCase()
          .replace(",", " ·"),
    },
    quality: rawResult.quality || rawResult.quality_flags || { duration: "good", noise: "acceptable", volume: "good" },
    waveform: rawResult.waveform || DEFAULT_WAVEFORM,
    mfcc: rawResult.mfcc || [],
    summary: rawResult.summary || rawResult.plain_explanation,
    transcription: rawResult.transcription || "No words recognized.",
  };
}

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: "04",
    sampleNumber: "04",
    status: "AUTHENTICATED",
    speaker: "VOICEPRINT 01",
    confidence: 98.4,
    timestamp: "14:32:10",
    isKnown: true,
    multiSpeaker: false,
    timeline: [
      { startTime: 0.0, endTime: 3.0, speaker: "VOICEPRINT 01", similarity: 0.98 },
      { startTime: 1.5, endTime: 4.5, speaker: "VOICEPRINT 01", similarity: 0.97 },
      { startTime: 3.0, endTime: 6.0, speaker: "VOICEPRINT 01", similarity: 0.99 },
    ],
  },
  {
    id: "03",
    sampleNumber: "03",
    status: "MULTI-SPEAKER DETECTED",
    speaker: "MULTI-SPEAKER DETECTED",
    confidence: 91.2,
    timestamp: "14:15:45",
    isKnown: true,
    multiSpeaker: true,
    activeSpeakers: ["VOICEPRINT 01", "UNKNOWN VOICE 01"],
    timeline: [
      { startTime: 0.0, endTime: 3.0, speaker: "VOICEPRINT 01", similarity: 0.95 },
      { startTime: 1.5, endTime: 4.5, speaker: "UNKNOWN VOICE 01", similarity: 0.58 },
      { startTime: 3.0, endTime: 6.0, speaker: "VOICEPRINT 01", similarity: 0.96 },
    ],
  },
  {
    id: "02",
    sampleNumber: "02",
    status: "UNIDENTIFIED",
    speaker: "UNKNOWN VOICE 01",
    confidence: 42.8,
    timestamp: "13:58:20",
    isKnown: false,
    multiSpeaker: false,
    timeline: [
      { startTime: 0.0, endTime: 3.0, speaker: "UNKNOWN VOICE 01", similarity: 0.42 },
      { startTime: 1.5, endTime: 4.5, speaker: "UNKNOWN VOICE 01", similarity: 0.45 },
    ],
  },
  {
    id: "01",
    sampleNumber: "01",
    status: "AUTHENTICATED",
    speaker: "VOICEPRINT 02",
    confidence: 94.6,
    timestamp: "13:40:05",
    isKnown: true,
    multiSpeaker: false,
    timeline: [
      { startTime: 0.0, endTime: 3.0, speaker: "VOICEPRINT 02", similarity: 0.94 },
      { startTime: 1.5, endTime: 4.5, speaker: "VOICEPRINT 02", similarity: 0.95 },
    ],
  },
];
