"""
Step 12 - Simple Streamlit interface.
Run from the project root:   streamlit run app/app.py
"""
import io
import sys
from pathlib import Path

import pandas as pd
import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import config as C                                     # noqa: E402
from predict import predict_file, get_speakers         # noqa: E402

st.set_page_config(page_title="Speaker Identification", page_icon="🎙️")
st.title("🎙️ Speaker Identification")
st.caption("MFCC + BiLSTM · closed-set: it can only choose among the enrolled speakers")

try:
    speakers = get_speakers()
except Exception as e:                                 # model missing / not trained yet
    st.error(f"Model not ready: {e}")
    st.stop()

with st.sidebar:
    st.subheader("Enrolled speakers")
    for s in speakers:
        st.write(f"• {s}")
    threshold = st.slider("Low-confidence warning below", 0.0, 1.0, float(C.MIN_CONFIDENCE), 0.05)


def show_result(audio_bytes: bytes):
    with st.spinner("Extracting MFCC and running the BiLSTM..."):
        try:
            result = predict_file(io.BytesIO(audio_bytes))
        except ValueError as e:
            st.warning(str(e))
            return
    st.success(f"Predicted Speaker: **{result['speaker']}**")
    st.metric("Confidence", f"{result['confidence']:.1%}")
    if result["confidence"] < threshold:
        st.warning("Low confidence - this may be someone who is not enrolled, or a noisy recording.")
    probs = pd.Series(result["probabilities"], name="probability").sort_values(ascending=False)
    st.bar_chart(probs)


tab_rec, tab_up = st.tabs(["🎤 Record", "📁 Upload file"])

with tab_rec:
    if hasattr(st, "audio_input"):
        clip = st.audio_input("Click the microphone, speak for 3-6 seconds, then stop")
        if clip is not None:
            show_result(clip.getvalue())
    else:
        st.info("Your Streamlit version has no built-in recorder. "
                "Upgrade with `pip install -U streamlit`, or use the Upload tab.")

with tab_up:
    up = st.file_uploader("Upload a voice sample", type=["wav", "flac", "mp3", "ogg"])
    if up is not None:
        st.audio(up)
        show_result(up.getvalue())

        # hello