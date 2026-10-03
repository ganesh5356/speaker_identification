"""
Steps 10 & 11 - Prediction for a new audio file or microphone waveform.

The model is closed-set (softmax must output SOME enrolled speaker's
probability), so rejection of unenrolled voices is done by EMBEDDING
DISTANCE instead: each enrolled speaker has a reference "voiceprint"
(models/centroids.npy, built in train_model.py). A new voice is accepted
only if it is cosine-similar enough to one of those voiceprints.

CLI:   python src/predict.py path/to/voice.wav
       python src/predict.py --mic --seconds 5
Code:  from predict import predict_file, predict_waveform
"""
import argparse
import json
from functools import lru_cache

import numpy as np

import config as C
from preprocess_audio import load_audio
from extract_mfcc import waveform_to_mfcc_segments

UNKNOWN_LABEL = "Unknown"


def _l2_normalize(v, axis=-1, eps=1e-9):
    return v / (np.linalg.norm(v, axis=axis, keepdims=True) + eps)


@lru_cache(maxsize=1)
def _load():
    import tensorflow as tf                                # imported lazily (slow)
    model_path = C.MODELS_DIR / "speaker_bilstm.keras"
    centroid_path = C.MODELS_DIR / "centroids.npy"
    if not model_path.exists():
        raise FileNotFoundError("No trained model found. Run src/train_model.py first.")
    if not centroid_path.exists():
        raise FileNotFoundError(
            "No speaker voiceprints found (models/centroids.npy). "
            "Re-run src/train_model.py - it now saves these automatically."
        )

    model = tf.keras.models.load_model(model_path)
    embedder = tf.keras.Model(model.input, model.get_layer("embedding").output)
    centroids = np.load(centroid_path)                      # (n_enrolled, embed_dim), L2-normalised
    all_classes = json.loads((C.MODELS_DIR / "label_map.json").read_text())
    
    enrolled_path = C.MODELS_DIR / "enrolled_map.json"
    if enrolled_path.exists():
        enrolled_classes = json.loads(enrolled_path.read_text())
    else:
        enrolled_classes = [c for c in all_classes if c != "_background_"]

    saved = json.loads((C.MODELS_DIR / "params.json").read_text())
    if saved != C.snapshot():
        print("[warning] config.py differs from the settings used for training - "
              "predictions may be unreliable. Re-run prepare_dataset.py and train_model.py.")
    return model, embedder, centroids, all_classes, enrolled_classes


def get_speakers():
    return _load()[4]


def predict_waveform(y: np.ndarray) -> dict:
    """
    Mono 16 kHz waveform -> multi-speaker diarization JSON output:
    {
        'speaker'         : top primary speaker, or "Unknown Speaker 1",
        'is_known'        : bool,
        'speaker_count'   : total number of distinct active speakers detected,
        'multi_speaker'   : bool (True if >1 speaker detected),
        'active_speakers' : list of active speaker names (e.g. ['Ganesh', 'Unknown Speaker 1']),
        'summary'         : descriptive text summary of detected speakers,
        'timeline'        : segment-by-segment speaker identification timeline,
        'confidence'      : confidence score for top speaker,
        'similarity'      : cosine similarity for top speaker,
        'closest_match'   : top matched enrolled name,
        'probabilities'   : {speaker: probability, ...},
        'similarities'    : {speaker: similarity, ...}
    }
    """
    model, embedder, centroids, all_classes, enrolled_classes = _load()
    feats = waveform_to_mfcc_segments(y)
    if len(feats) == 0:
        raise ValueError("Audio is too short or contains no clear speech. Please speak for at least 1-2 seconds.")

    n_segments = len(feats)
    seg_probs_all = model.predict(feats, verbose=0)                    # (n_segments, n_all_classes)
    seg_embeds_all = embedder.predict(feats, verbose=0)                # (n_segments, embed_dim)
    seg_embeds_all = _l2_normalize(seg_embeds_all, axis=-1)

    timeline = []
    active_speakers_order = []
    unknown_clusters = []                                              # list of dicts: {"label": "Unknown Speaker 1", "vector": np.array}
    unknown_counter = 1

    for i in range(n_segments):
        start_t = round(i * C.SEGMENT_HOP_SECONDS, 2)
        end_t = round(start_t + C.SEGMENT_SECONDS, 2)

        probs = seg_probs_all[i]
        embed = seg_embeds_all[i]

        sims = centroids @ embed                                       # cosine sim to enrolled centroids
        order = np.argsort(sims)[::-1]
        best_idx, runner_idx = order[0], order[1] if len(order) > 1 else order[0]
        best_sim = float(sims[best_idx])
        margin = float(sims[best_idx] - sims[runner_idx])
        closest_match = enrolled_classes[best_idx]

        bg_prob = 0.0
        if "_background_" in all_classes:
            bg_prob = float(probs[all_classes.index("_background_")])

        enrolled_prob_sum = sum(probs[all_classes.index(c)] for c in enrolled_classes) + 1e-9
        confidence = float(probs[all_classes.index(closest_match)] / enrolled_prob_sum)

        is_known = (best_sim >= C.SIMILARITY_THRESHOLD) and (margin >= C.SIMILARITY_MARGIN or best_sim >= 0.70) and (bg_prob < 0.50)

        if is_known:
            speaker_label = closest_match
        else:
            # Check against previously seen unknown speaker embeddings in this recording
            matched_unk = None
            for unk in unknown_clusters:
                cos_sim = float(np.dot(unk["vector"], embed))
                if cos_sim >= 0.65:
                    matched_unk = unk["label"]
                    # Update running average centroid of this unknown speaker
                    unk["vector"] = _l2_normalize(unk["vector"] * 0.7 + embed * 0.3)
                    break
            
            if matched_unk:
                speaker_label = matched_unk
            else:
                speaker_label = f"Unknown Speaker {unknown_counter}"
                unknown_clusters.append({"label": speaker_label, "vector": embed})
                unknown_counter += 1

        if speaker_label not in active_speakers_order:
            active_speakers_order.append(speaker_label)

        timeline.append({
            "segment": i + 1,
            "start_time": start_t,
            "end_time": end_t,
            "speaker": speaker_label,
            "is_known": is_known,
            "closest_match": closest_match,
            "similarity": round(best_sim, 2),
            "margin": round(margin, 2),
            "confidence": round(confidence, 3),
        })

    # Overall aggregate metrics across recording
    avg_probs = seg_probs_all.mean(axis=0)
    avg_embed = _l2_normalize(seg_embeds_all.mean(axis=0, keepdims=True))[0]
    avg_sims = centroids @ avg_embed
    sorted_sim_indices = np.argsort(avg_sims)[::-1]
    top_overall_idx = int(sorted_sim_indices[0])
    runner_up_idx = int(sorted_sim_indices[1]) if len(sorted_sim_indices) > 1 else top_overall_idx
    
    top_overall_sim = float(avg_sims[top_overall_idx])
    top_overall_speaker = enrolled_classes[top_overall_idx]
    runner_up_speaker = enrolled_classes[runner_up_idx]
    runner_up_sim = float(avg_sims[runner_up_idx])

    overall_is_known = (top_overall_sim >= C.SIMILARITY_THRESHOLD)
    primary_speaker = top_overall_speaker if overall_is_known else (active_speakers_order[0] if active_speakers_order else UNKNOWN_LABEL)

    enrolled_prob_sum = sum(avg_probs[all_classes.index(c)] for c in enrolled_classes) + 1e-9
    norm_probs = {c: float(avg_probs[all_classes.index(c)] / enrolled_prob_sum) for c in enrolled_classes}

    speaker_count = len(active_speakers_order)
    summary_text = f"Detected {speaker_count} speaker(s): {', '.join(active_speakers_order)}"

    # Audio details & quality flags
    duration_sec = round(float(len(y) / C.SAMPLE_RATE), 2)
    rms_energy = float(np.sqrt(np.mean(y ** 2)))
    quality_flags = []
    if duration_sec < 1.5:
        quality_flags.append("Too Short (<1.5s)")
    if rms_energy < C.MIN_SPEECH_RMS:
        quality_flags.append("Low Energy / Quiet Audio")
    if not quality_flags:
        quality_flags.append("Clean Speech Signal")

    # Confidence label & plain explanation
    conf_pct = round(top_overall_sim * 100, 1)
    runner_pct = round(max(0, runner_up_sim) * 100, 1)
    if conf_pct >= 75:
        confidence_level = "High"
    elif conf_pct >= 55:
        confidence_level = "Medium"
    else:
        confidence_level = "Low"

    if overall_is_known:
        plain_exp = f"The voice matches {primary_speaker} with {conf_pct}% confidence. The next closest match was {runner_up_speaker} at {runner_pct}%."
        tip = "High quality match verified against enrolled voiceprint model."
    else:
        plain_exp = f"The voice does not confidently match any enrolled speaker (closest was {top_overall_speaker} at {conf_pct}%)."
        tip = "Try a longer or cleaner voice recording (3–5 seconds) closer to the microphone."

    # Top-3 predictions
    top_predictions = []
    for idx in sorted_sim_indices[:3]:
        spk_name = enrolled_classes[idx]
        sim_val = round(float(avg_sims[idx]), 4)
        top_predictions.append({
            "speaker": spk_name,
            "confidence": sim_val,
            "percentage": round(sim_val * 100, 1)
        })

    return {
        "speaker": primary_speaker,
        "is_known": bool(overall_is_known),
        "speaker_count": speaker_count,
        "multi_speaker": speaker_count > 1,
        "active_speakers": active_speakers_order,
        "summary": summary_text,
        "timeline": timeline,
        "confidence": norm_probs.get(top_overall_speaker, 0.0),
        "similarity": round(top_overall_sim, 2),
        "confidence_level": confidence_level,
        "closest_match": top_overall_speaker,
        "plain_explanation": plain_exp,
        "recommendation_tip": tip,
        "audio_details": {
            "duration_seconds": duration_sec,
            "sample_rate": C.SAMPLE_RATE,
            "quality_flags": quality_flags,
            "rms_energy": round(rms_energy, 4),
        },
        "top_predictions": top_predictions,
        "model_info": {
            "architecture": "MFCC (40) + BiLSTM Embedder",
            "feature_count": C.N_MFCC,
            "sample_rate": C.SAMPLE_RATE,
            "segment_seconds": C.SEGMENT_SECONDS,
            "test_accuracy_segment": "66.8%",
            "test_accuracy_recording": "76.9%",
        },
        "probabilities": {c: round(v, 4) for c, v in norm_probs.items()},
        "similarities": {c: round(float(s), 2) for c, s in zip(enrolled_classes, avg_sims)},
    }


def predict_file(path_or_file) -> dict:
    return predict_waveform(load_audio(path_or_file))


def _print(result: dict):
    print("\n" + "=" * 60)
    print(f"SUMMARY: {result['summary']}")
    print(f"Primary Speaker: {result['speaker']} (Multi-Speaker Detected: {result['multi_speaker']})")
    print("=" * 60)
    print("\nTimeline Breakdown:")
    for t in result["timeline"]:
        tag = f"[Enrolled: {t['speaker']}]" if t['is_known'] else f"[{t['speaker']}]"
        print(f"  {t['start_time']:4.1f}s - {t['end_time']:4.1f}s | {tag:<22s} | Closest Match: {t['closest_match']} (Sim: {t['similarity']:.2f})")
    print("\nVoiceprint similarity per enrolled speaker:")
    for name, s in sorted(result["similarities"].items(), key=lambda kv: -kv[1]):
        print(f"    {name:<20s} {s:6.2f}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", nargs="?", help="path to a WAV/FLAC/MP3 file")
    ap.add_argument("--mic", action="store_true", help="record from the microphone instead")
    ap.add_argument("--seconds", type=float, default=5.0)
    a = ap.parse_args()

    if a.mic:
        from record_audio import record
        print(f"Speak now ({a.seconds:.0f} s)...")
        _print(predict_waveform(record(a.seconds)))
    elif a.audio:
        _print(predict_file(a.audio))
    else:
        ap.error("give an audio file path or use --mic")