// API client — proxied via next.config.ts rewrites to Flask backend at :8000

const BASE = "/api";

export async function getHealth() {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function identifySpeaker(wavBlob: Blob) {
  const form = new FormData();
  form.append("audio", wavBlob, "recording.wav");
  const res = await fetch(`${BASE}/predict`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Prediction failed: ${res.status}`);
  return res.json();
}

export async function getEvaluation() {
  const res = await fetch(`${BASE}/evaluation`);
  if (!res.ok) throw new Error(`Evaluation fetch failed: ${res.status}`);
  return res.json();
}

export async function recomputeEvaluation() {
  const res = await fetch(`${BASE}/evaluation/recompute`, { method: "POST" });
  if (!res.ok) throw new Error(`Recompute failed: ${res.status}`);
  return res.json();
}
