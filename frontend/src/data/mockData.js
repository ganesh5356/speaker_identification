export const INITIAL_SYSTEM_STATE = {
  activeScreen: "entry", // "entry" | "analysis" | "result" | "about"
  interactionState: "idle", // "idle" | "listening" | "analyzing" | "result"
  activeSampleId: 1,
  sampleCounter: 1,
};

export const MOCK_HISTORY = [
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

export const MOCK_RESULT = {
  sampleNumber: "01",
  speaker: "VOICEPRINT 01",
  status: "AUTHENTICATED",
  confidence: 0.984,
  is_known: true,
  multi_speaker: false,
  speaker_count: 1,
  active_speakers: ["VOICEPRINT 01"],
  summary: "Single voiceprint verified with 98.4% similarity.",
  timeline: [
    { start_time: 0.0, end_time: 3.0, speaker: "VOICEPRINT 01", is_known: true, similarity: 0.98 },
    { start_time: 1.5, end_time: 4.5, speaker: "VOICEPRINT 01", is_known: true, similarity: 0.97 },
    { start_time: 3.0, end_time: 6.0, speaker: "VOICEPRINT 01", is_known: true, similarity: 0.99 },
  ],
};

export const SCREENS = [
  { id: "01", label: "ENTRY", key: "entry" },
  { id: "02", label: "ANALYSIS", key: "analysis" },
  { id: "03", label: "RESULT", key: "result" },
  { id: "04", label: "ABOUT", key: "about" },
  { id: "05", label: "HISTORY", key: "history" },
  { id: "06", label: "EVALUATION", key: "evaluation" },
];
