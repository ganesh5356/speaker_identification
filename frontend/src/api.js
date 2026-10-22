export async function getHealth() {
  const res = await fetch("/api/health");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Backend not reachable");
  return data;
}

export async function identifySpeaker(wavBlob) {
  const form = new FormData();
  form.append("audio", wavBlob, "voice.wav");
  const res = await fetch("/api/predict", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Prediction failed");
  return data;
}

export async function getEvaluation(recompute = false) {
  const url = recompute ? "/api/evaluation?recompute=true" : "/api/evaluation";
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to load evaluation metrics");
  return data;
}

export async function recomputeEvaluation() {
  const res = await fetch("/api/evaluation/recompute", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to recompute evaluation metrics");
  return data;
}