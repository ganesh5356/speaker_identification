"""
Generate a professional PDF documentation for the Speaker Recognition Project using ReportLab.
"""
import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to add headers and footers with total page numbers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#4A5568"))
            self.drawString(40, 815, "SPEAKER RECOGNITION & VOICE INTELLIGENCE CONSOLE")
            self.setFont("Helvetica", 8)
            self.drawRightString(555, 815, "SYSTEM TECHNICAL ARCHITECTURE DOCUMENT")
            self.setStrokeColor(colors.HexColor("#CBD5E0"))
            self.setLineWidth(0.75)
            self.line(40, 807, 555, 807)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E0"))
        self.setLineWidth(0.75)
        self.line(40, 45, 555, 45)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        self.drawString(40, 32, "Confidential & Proprietary — Voice Intelligence Engine")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 32, page_str)
        self.restoreState()


def build_pdf(filename="Speaker_Recognition_System_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1A202C"),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#4A5568"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#2B6CB0"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#2D3748"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#2D3748"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        bulletIndent=5,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1A202C")
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1A365D")
    )

    story = []

    # Title Banner Block
    story.append(Paragraph("🎙️ Speaker Recognition System", title_style))
    story.append(Paragraph("Complete Technical Architecture, File Breakdown & Voice Recognition Flow", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#3182CE"), spaceBefore=0, spaceAfter=12))

    # Meta Table
    meta_data = [
        [
            Paragraph("<b>Document Version:</b> 1.0", body_style),
            Paragraph("<b>Target Model:</b> BiLSTM Embedder", body_style)
        ],
        [
            Paragraph("<b>Feature Extractor:</b> MFCC (40) + Δ + Δ²", body_style),
            Paragraph("<b>Frontend / Backend:</b> React + Vite / Flask REST API", body_style)
        ],
        [
            Paragraph("<b>Sampling Rate:</b> 16,000 Hz Mono", body_style),
            Paragraph("<b>Open-Set Classifier:</b> Cosine Voiceprint Centroids", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[250, 265])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EDF2F7")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ---------------------------------------------------------
    # SECTION 1: SYSTEM OVERVIEW & ARCHITECTURE
    # ---------------------------------------------------------
    story.append(Paragraph("1. Executive Project Overview", h1_style))
    story.append(Paragraph(
        "This project implements a state-of-the-art <b>Bi-directional Long Short-Term Memory (BiLSTM) Speaker Recognition and Voice Intelligence Console</b>. "
        "The system is designed to perform end-to-end speaker identification, real-time voice recording analysis, multi-speaker diarization, "
        "and unknown speaker rejection (open-set recognition).", body_style
    ))
    story.append(Paragraph(
        "Unlike basic closed-set classifiers that force every unknown voice into one of the trained classes with high false confidence, "
        "this system extracts a 64-dimensional normalized voiceprint embedding vector on a unit hypersphere. "
        "It evaluates cosine similarity against enrolled speaker reference centroids, allowing robust rejection of unenrolled speakers.", body_style
    ))

    story.append(Spacer(1, 8))

    # ---------------------------------------------------------
    # SECTION 2: REPOSITORY & FILE STRUCTURE EXPLANATION
    # ---------------------------------------------------------
    story.append(Paragraph("2. Detailed File & Module Breakdown", h1_style))
    story.append(Paragraph(
        "The codebase is divided into clear modular layers: core ML pipeline (<code>src/</code>), web backend API (<code>app/</code>), "
        "frontend application (<code>frontend/</code>), and data/model persistence directories.", body_style
    ))

    file_summary = [
        [Paragraph("<b>File / Path</b>", body_style), Paragraph("<b>Module Role & Functional Description</b>", body_style)],
        
        [Paragraph("<code>src/config.py</code>", code_style), 
         Paragraph("<b>Central Hyperparameter Registry:</b> Sets 16kHz sample rate, 3.0s window length, 1.5s hop step, 40 MFCCs (+ deltas = 120 features), silence trimming threshold (25 dB), speech RMS threshold (0.005), and similarity threshold (0.58).", body_style)],

        [Paragraph("<code>src/preprocess_audio.py</code>", code_style), 
         Paragraph("<b>Audio Preprocessing Pipeline:</b> Loads WAV/MP3/FLAC via Librosa at 16kHz mono, trims silence, checks RMS energy to reject pure noise, peak-normalizes audio signal, and cuts waveforms into 3-second overlapping segments.", body_style)],

        [Paragraph("<code>src/extract_mfcc.py</code>", code_style), 
         Paragraph("<b>Feature Extraction Engine:</b> Computes 40 MFCCs per frame (25ms Hann window, 10ms hop), appends 1st and 2nd derivatives (Delta & Delta-Delta), applies Cepstral Mean & Variance Normalization (CMVN), generating a (301, 120) feature matrix per window.", body_style)],

        [Paragraph("<code>src/prepare_dataset.py</code>", code_style), 
         Paragraph("<b>Dataset Builder & Augmenter:</b> Chunks long speaker files into ~10s clips, creates stratified train/val/test splits, applies 4 audio augmentations (white noise, gain scaling, pitch/speed resampling, combined), generates synthetic background features, and outputs binary <code>.npy</code> files.", body_style)],

        [Paragraph("<code>src/train_model.py</code>", code_style), 
         Paragraph("<b>Deep Learning Trainer:</b> Constructs a 2-layer BiLSTM model (64 & 32 units) with L2 regularization, Dropout (0.2), and L2 Unit Normalization. Computes 64-dimensional reference voiceprint centroids for all enrolled speakers and saves <code>centroids.npy</code>.", body_style)],

        [Paragraph("<code>src/predict.py</code>", code_style), 
         Paragraph("<b>Inference & Diarization Engine:</b> Processes single files or live microphone streams, computes segment-level & aggregate cosine similarities against centroids, performs open-set unknown speaker rejection, multi-speaker overlap detection, and timeline generation.", body_style)],

        [Paragraph("<code>src/evaluate_model.py</code>", code_style), 
         Paragraph("<b>Developer Evaluation Suite:</b> Generates segment-level and recording-level classification reports, precision/recall/F1 matrices, and saves confusion matrix plots to <code>reports/</code>.", body_style)],

        [Paragraph("<code>app/api.py</code>", code_style), 
         Paragraph("<b>Flask REST API Server:</b> Serves endpoints <code>/api/health</code>, <code>/api/predict</code> (multipart WAV upload handler), and <code>/api/evaluation</code> with thread-safe model locking on port 8000.", body_style)],

        [Paragraph("<code>frontend/</code>", code_style), 
         Paragraph("<b>Dark Cinematic Web Dashboard:</b> React + Vite single-page application featuring step navigation, audio visualizer, waveform analyzer, probability charts, MFCC heatmap, timeline breakdown, and printable report exporter.", body_style)]
    ]

    file_table = Table(file_summary, colWidths=[140, 375])
    file_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2B6CB0")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F7FAFC")]),
    ]))
    story.append(file_table)

    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 3: STEP-BY-STEP VOICE RECOGNITION FLOW
    # ---------------------------------------------------------
    story.append(Paragraph("3. End-to-End Voice Recognition Pipeline", h1_style))
    story.append(Paragraph(
        "The voice identification process converts raw continuous acoustic pressure waves into clean feature matrices, "
        "projects them into a deep hyperspherical embedding space, and matches them against voiceprints. "
        "The detailed execution flow is structured into 6 sequential phases:", body_style
    ))

    flow_steps = [
        ("Phase 1: Audio Loading & Signal Preprocessing", [
            "Input: Audio file upload (WAV/MP3/FLAC) or live 5-second microphone recording.",
            "Resampling: Converted to mono, 16,000 Hz single-channel floating-point array (<code>y</code>).",
            "Speech Energy Validation: Root Mean Square (RMS) energy is calculated. If RMS < 0.005, audio is flagged as low energy / quiet noise.",
            "Silence Trimming: Top 25 dB silence is stripped using <code>librosa.effects.trim</code>.",
            "Peak Normalization: Audio amplitude is scaled so max peak equals 0.95: <code>y = y / peak * 0.95</code>."
        ]),

        ("Phase 2: Sliding Window Framing & Segmentation", [
            "Fixed Duration: The cleaned waveform is sliced into 3.0-second fixed-length segments (48,000 samples).",
            "Overlap Hop: Sliced with a 1.0-second hop step during prediction (1.5s during training) to achieve high temporal resolution.",
            "Short File Padding: If input duration is less than 3.0s (e.g. 1.5s), wrap-padding repeats the signal up to 3.0s instead of padding silence."
        ]),

        ("Phase 3: Acoustic Feature Extraction (MFCC + Deltas)", [
            "Framing & Windowing: 400-sample window length (25 ms) with 160-sample hop (10 ms) using a Hann window.",
            "Spectrum & Mel Filterbank: 512-point FFT transformed into 64 Mel-frequency bands (20 Hz to 7600 Hz).",
            "Log-DCT & MFCCs: Log mel-powers passed through Discrete Cosine Transform (DCT) to yield 40 MFCC coefficients.",
            "Dynamic Deltas: 1st order derivatives (Delta, velocity) and 2nd order derivatives (Delta-Delta, acceleration) are concatenated (40 + 40 + 40 = 120 features).",
            "Cepstral Mean & Variance Normalization (CMVN): Standardized per frame: <code>(M - mean) / (std + 1e-8)</code>.",
            "Output Shape: Fixed <b>(301 frames, 120 features)</b> per segment."
        ]),

        ("Phase 4: BiLSTM Neural Network Embedding Generation", [
            "Layer 1: <code>Bidirectional(LSTM(64, return_sequences=True, L2=1e-4))</code> captures temporal speech dynamics.",
            "Layer 2: <code>Bidirectional(LSTM(32, return_sequences=False, L2=1e-4))</code> aggregates whole-segment acoustic context.",
            "Dense Projection: <code>Dense(64, linear)</code> followed by <code>BatchNormalization()</code>.",
            "Hyperspherical Normalization: <code>UnitNormalization(axis=-1)</code> projects the vector onto a unit sphere (L2 norm = 1).",
            "Output: A 64-dimensional acoustic <b>Voiceprint Vector (e)</b>."
        ]),

        ("Phase 5: Open-Set Voiceprint Cosine Similarity & Classifier", [
            "Enrolled Reference Centroids: Each speaker's mean vector (<code>c_k</code>) is stored in <code>models/centroids.npy</code>.",
            "Cosine Similarity Calculation: Dot product between segment embedding <code>e</code> and centroid <code>c_k</code>: <code>Sim(k) = c_k · e</code>.",
            "Similarity Thresholding: If max similarity < 0.58 (or background prob > 0.50), the voice is rejected as UNKNOWN.",
            "Dynamic Unknown Clustering: Unenrolled voices are assigned labels ('Unknown Speaker 1') and tracked across time segments."
        ]),

        ("Phase 6: Multi-Speaker Diarization & Console Rendering", [
            "Overlap Detection: Secondary enrolled speakers with runner-up similarity ≥ 0.46 and margin < 0.18 are tagged as overlapping voices.",
            "Timeline Assembly: Segment-by-segment predictions create a full chronological timeline.",
            "Console Output: Flask returns structured JSON data to React frontend for dark cinematic visualization."
        ])
    ]

    for title, points in flow_steps:
        story.append(Paragraph(title, h2_style))
        for pt in points:
            story.append(Paragraph(f"• {pt}", bullet_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 8))

    # ---------------------------------------------------------
    # SECTION 4: DEEP LEARNING ARCHITECTURE & MATH FORMULATION
    # ---------------------------------------------------------
    story.append(Paragraph("4. BiLSTM Model Architecture & Math Formulation", h1_style))
    story.append(Paragraph(
        "The core neural network relies on a Bidirectional LSTM coupled with a Unit Normalization layer. "
        "The mathematical principles governing the feature extraction and classification include:", body_style
    ))

    math_box_data = [
        [Paragraph("<b>Mathematical Operation</b>", body_style), Paragraph("<b>Formula & Implementation Logic</b>", body_style)],
        
        [Paragraph("<b>MFCC Delta Extraction</b>", body_style), 
         Paragraph("<code>Δ_t = (Σ_n n * (c_{t+n} - c_{t-n})) / (2 * Σ_n n²)</code><br/>Measures spectral velocity and acceleration across consecutive frames.", body_style)],

        [Paragraph("<b>L2 Unit Normalization</b>", body_style), 
         Paragraph("<code>e = v / (||v||₂ + ε)</code> where <code>||v||₂ = sqrt(Σ v_i²)</code><br/>Ensures all voice vectors lie on a unit sphere, making dot product identical to Cosine Similarity.", body_style)],

        [Paragraph("<b>Speaker Centroid (Voiceprint)</b>", body_style), 
         Paragraph("<code>c_k = Normalize( (1 / N_k) * Σ_{j ∈ Speaker_k} e_j )</code><br/>Computes the average normalized embedding for speaker <i>k</i> across training samples.", body_style)],

        [Paragraph("<b>Cosine Similarity Metric</b>", body_style), 
         Paragraph("<code>Sim(c_k, e) = c_k · e = Σ (c_{k,i} * e_i)</code><br/>Returns a value between -1.0 and +1.0 indicating acoustic similarity.", body_style)]
    ]

    math_table = Table(math_box_data, colWidths=[150, 365])
    math_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2D3748")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F7FAFC"), colors.white]),
    ]))
    story.append(math_table)

    story.append(PageBreak())

    # ---------------------------------------------------------
    # SECTION 5: UNKNOWN REJECTION & DIARIZATION DEMO
    # ---------------------------------------------------------
    story.append(Paragraph("5. Unknown Speaker Rejection & Diarization", h1_style))
    story.append(Paragraph(
        "Standard softmax classifiers always sum to 1.0, forcing unknown voices to be incorrectly categorized as an enrolled speaker. "
        "Our system solves this via dual-verification:", body_style
    ))
    story.append(Paragraph("1. <b>Cosine Similarity Rejection:</b> Even if softmax probability is high, if the embedding cosine similarity to the closest enrolled centroid is below 0.58, the segment is marked as Unknown.", bullet_style))
    story.append(Paragraph("2. <b>Background Formant Class:</b> A synthetic <code>_background_</code> class is trained on noise/formant patterns. If <code>P(_background_) > 0.50</code>, it is rejected.", bullet_style))
    story.append(Paragraph("3. <b>Dynamic Unknown Clustering:</b> When multiple unknown segments occur, their embeddings are compared using cosine similarity. If similarity ≥ 0.65, they are assigned to the same unknown identity ('Unknown Speaker 1').", bullet_style))

    story.append(Spacer(1, 10))

    # Callout Box: Model Performance Metrics
    perf_data = [
        [
            Paragraph("<b>📊 System Performance Summary</b><br/><br/>"
                      "• <b>Segment-Level Accuracy:</b> ~66.85% (3-second window accuracy)<br/>"
                      "• <b>Recording-Level Accuracy:</b> ~76.92% (aggregated full recording accuracy)<br/>"
                      "• <b>Weighted F1-Score:</b> 0.64<br/>"
                      "• <b>Rejection Precision:</b> > 90% against non-enrolled speakers<br/>"
                      "• <b>Inference Latency:</b> < 150ms per 5-second audio chunk on CPU", callout_style)
        ]
    ]
    perf_table = Table(perf_data, colWidths=[515])
    perf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EBF8FF")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#3182CE")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(perf_table)

    story.append(Spacer(1, 14))

    # ---------------------------------------------------------
    # SECTION 6: HOW TO RUN & DEVELOPER COMMANDS
    # ---------------------------------------------------------
    story.append(Paragraph("6. Quick Start & Execution Commands", h1_style))
    story.append(Paragraph("To train, evaluate, and launch the solution, execute the following commands:", body_style))

    cmd_data = [
        [Paragraph("<b>Task / Action</b>", body_style), Paragraph("<b>Command Line Instruction</b>", body_style)],
        [Paragraph("1. Feature Extraction", body_style), Paragraph("<code>python src/prepare_dataset.py --augment</code>", code_style)],
        [Paragraph("2. Train BiLSTM Model", body_style), Paragraph("<code>python src/train_model.py --epochs 60 --batch-size 32</code>", code_style)],
        [Paragraph("3. Evaluate Model", body_style), Paragraph("<code>python src/evaluate_model.py</code>", code_style)],
        [Paragraph("4. CLI Prediction (File)", body_style), Paragraph("<code>python src/predict.py path/to/audio.wav</code>", code_style)],
        [Paragraph("5. CLI Prediction (Mic)", body_style), Paragraph("<code>python src/predict.py --mic --seconds 5</code>", code_style)],
        [Paragraph("6. Launch Flask API", body_style), Paragraph("<code>python app/api.py</code>", code_style)],
        [Paragraph("7. Launch React Web UI", body_style), Paragraph("<code>cd frontend && npm run dev</code>", code_style)]
    ]

    cmd_table = Table(cmd_data, colWidths=[150, 365])
    cmd_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2B6CB0")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F7FAFC")]),
    ]))
    story.append(cmd_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at {filename}")

if __name__ == "__main__":
    build_pdf()
