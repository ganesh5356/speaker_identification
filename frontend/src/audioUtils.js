// Converts ANY browser-decodable audio (recorded webm/ogg, uploaded mp3/m4a/wav...)
// into a mono 16 kHz 16-bit WAV, so the Python backend never needs ffmpeg.

const TARGET_SR = 16000;

export async function blobToWav16k(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx({ sampleRate: TARGET_SR });
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    const length = decoded.length;
    const mono = new Float32Array(length);
    for (let c = 0; c < decoded.numberOfChannels; c++) {
      const channel = decoded.getChannelData(c);
      for (let i = 0; i < length; i++) mono[i] += channel[i] / decoded.numberOfChannels;
    }
    return encodeWav(mono, decoded.sampleRate);
  } catch {
    throw new Error("Could not read this audio. Try a WAV, MP3 or a fresh recording.");
  } finally {
    ctx.close();
  }
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);            // PCM chunk size
  view.setUint16(20, 1, true);             // PCM format
  view.setUint16(22, 1, true);             // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);            // 16-bit
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: "audio/wav" });
}