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

export async function getEvaluation() {
  const res = await fetch("/api/evaluation");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to load evaluation metrics");
  return data;
}