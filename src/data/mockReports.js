export const MOCK_REPORTS = [
  {
    id: "SCN-2026-8941",
    target: "press_conference_statement.mp4",
    type: "VIDEO",
    mediaCategory: "Video Stream",
    timestamp: "2026-08-06T14:32:00Z",
    status: "Completed",
    riskScore: 98,
    result: "LIKELY AUTHENTIC",
    confidenceScore: "99.8% REAL",
    riskLevel: "LOW RISK",
    duration: "42s",
    resolution: "3840 x 2160 (4K UHD)",
    codec: "H.264 / AVC High @ L5.1",
    hardware: "Sony Alpha a7 IV",
    checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    summary: "Our deep learning neural classifier inspected 300 sequential keyframes and voice acoustic spectral bands. The file displays no signs of Generative Adversarial Network (GAN) diffusion patterns, facial boundary blurring, or lip-sync misalignment.",
    forensicFindings: [
      { title: "Facial Boundary Analysis", score: "0.02% Anomaly", status: "Clean", detail: "No boundary blending or edge artifacts detected along jawline or hairline." },
      { title: "Lip-Sync & Audio Alignment", score: "99.9% Sync", status: "Clean", detail: "Phoneme-to-viseme alignment matches natural vocal acoustic cadence." },
      { title: "Compression & GAN Artifacts", score: "Zero Diffusion Traces", status: "Clean", detail: "Frequency spectrum exhibits natural sensor noise distribution." }
    ],
    metadataFindings: [
      { label: "Camera Hardware Signature", value: "Sony Alpha a7 IV (Validated)" },
      { label: "Software Encoding Tag", value: "Adobe Premiere Pro 2024.2 Native" },
      { label: "Color Space Profile", value: "Rec.709 / BT.709 Standard" },
      { label: "Audio Sample Rate", value: "48.0 kHz 24-bit PCM Uncompressed" }
    ],
    manipulationIndicators: [
      { name: "Face-Swap Boundary Distortion", detected: false, confidence: "0.1%" },
      { name: "GAN Spectral Grid Patterns", detected: false, confidence: "0.2%" },
      { name: "Voice Synthesizer Harmonics", detected: false, confidence: "0.1%" },
      { name: "Temporal Frame Inconsistency", detected: false, confidence: "0.3%" }
    ],
    timelineEvents: [
      { timestamp: "00:00:02", title: "Frame Stream Initialized", status: "Authentic", detail: "Keyframe 1-30 EXIF header validated." },
      { timestamp: "00:00:08", title: "Facial Landmark Inspection", status: "Authentic", detail: "Biometric mesh vector alignment confirmed." },
      { timestamp: "00:00:15", title: "Spectral Acoustic FFT Check", status: "Authentic", detail: "Voice frequency matches natural human formant resonance." },
      { timestamp: "00:00:30", title: "GAN Artifact Sweep", status: "Authentic", detail: "No spatial frequency grid anomalies detected." }
    ]
  },
  {
    id: "SCN-2026-7810",
    target: "executive_portrait_hd.png",
    type: "IMAGE",
    mediaCategory: "Image Forensics",
    timestamp: "2026-08-05T19:15:00Z",
    status: "Completed",
    riskScore: 32,
    result: "DEEPFAKE DETECTED",
    confidenceScore: "94.2% SYNTHETIC",
    riskLevel: "CRITICAL RISK",
    duration: "N/A",
    resolution: "2048 x 2048",
    codec: "PNG / 32-bit RGBA",
    hardware: "Unknown / Synthetic Generator",
    checksum: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    summary: "Pixel-level Error Level Analysis (ELA) and frequency domain Fourier transforms revealed clear GAN diffusion lattice signatures, synthetic eye reflection asymmetry, and AI generation metadata signatures.",
    forensicFindings: [
      { title: "GAN Diffusion Lattice", score: "94.2% Anomaly", status: "Flagged", detail: "High-frequency Fourier spectrum displays unnatural grid patterns characteristic of StyleGAN3." },
      { title: "Biometric Eye Symmetry", score: "Inconsistent Reflection", status: "Flagged", detail: "Catchlight reflection vectors in pupils do not match environmental light sources." },
      { title: "Hair & Background Blending", score: "Edge Blur Detected", status: "Flagged", detail: "Unnatural pixel smoothing artifacts along fine hair strands." }
    ],
    metadataFindings: [
      { label: "Camera Hardware Signature", value: "Missing / Stripped EXIF" },
      { label: "Software Encoding Tag", value: "Midjourney v6.0 / Stable Diffusion XL" },
      { label: "Color Space Profile", value: "sRGB IEC61966-2.1" },
      { label: "Pixel Density", value: "72 DPI (Standard Web Generation)" }
    ],
    manipulationIndicators: [
      { name: "Face-Swap Boundary Distortion", detected: true, confidence: "94.2%" },
      { name: "GAN Spectral Grid Patterns", detected: true, confidence: "96.5%" },
      { name: "Synthetic Texture Smoothing", detected: true, confidence: "89.1%" },
      { name: "Iris Iris-Reflection Asymmetry", detected: true, confidence: "92.0%" }
    ],
    timelineEvents: [
      { timestamp: "00:00:01", title: "Image Matrix Loaded", status: "Ingested", detail: "2048x2048 RGBA bitmap parsed." },
      { timestamp: "00:00:03", title: "Error Level Analysis (ELA)", status: "Flagged", detail: "Compression residual variance indicates AI synthesis." },
      { timestamp: "00:00:05", title: "Fourier Spectral Transform", status: "Flagged", detail: "Lattice spikes confirmed at 128px spatial frequencies." }
    ]
  },
  {
    id: "SCN-2026-6204",
    target: "ceo_voicemail_dispatch.wav",
    type: "AUDIO",
    mediaCategory: "Voice Spectral FFT",
    timestamp: "2026-08-04T09:10:00Z",
    status: "Completed",
    riskScore: 28,
    result: "DEEPFAKE DETECTED",
    confidenceScore: "96.8% SYNTHETIC VOICE",
    riskLevel: "CRITICAL RISK",
    duration: "18s",
    resolution: "N/A",
    codec: "WAV / 44.1 kHz 16-bit Mono",
    hardware: "VoIP Capture / Neural Voice Clone",
    checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    summary: "Spectral frequency analysis detected phase discontinuity at phoneme boundaries and robotic pitch-tracking artifacts consistent with zero-shot neural voice cloning models (ElevenLabs / VALL-E architecture).",
    forensicFindings: [
      { title: "Acoustic Formant Resonance", score: "Synthetic Phase Jump", status: "Flagged", detail: "Robotic phase alignment detected in glottal pulse transitions." },
      { title: "Background Noise Floor", score: "Zero Natural Ambience", status: "Flagged", detail: "Noise floor drops to absolute silence (-inf dB) between vocal utterances." },
      { title: "Pitch Modulation Consistency", score: "96.8% Model Signature", status: "Flagged", detail: "Fundamental frequency F0 contour shows flat pitch quantization." }
    ],
    metadataFindings: [
      { label: "Audio Container", value: "WAVE Audio File Format" },
      { label: "Sampling Frequency", value: "44.1 kHz Standard PCM" },
      { label: "Vocal Synthesizer Trace", value: "Neural Speech Synthesis Model v4" },
      { label: "Acoustic Duration", value: "18.42 Seconds" }
    ],
    manipulationIndicators: [
      { name: "Voice Synthesizer Harmonics", detected: true, confidence: "96.8%" },
      { name: "Phoneme Phase Discontinuity", detected: true, confidence: "94.5%" },
      { name: "Unnatural Silence Gaps", detected: true, confidence: "98.1%" },
      { name: "Breathing Pattern Absence", detected: true, confidence: "91.0%" }
    ],
    timelineEvents: [
      { timestamp: "00:00:01", title: "Audio Waveform Ingested", status: "Ingested", detail: "44.1kHz mono PCM buffer loaded." },
      { timestamp: "00:00:04", title: "Spectrogram FFT Generation", status: "Flagged", detail: "Harmonic overtones exhibit neural vocoder signature." },
      { timestamp: "00:00:09", title: "F0 Pitch Contour Tracking", status: "Flagged", detail: "Quantized pitch steps detected in vocal transitions." }
    ]
  },
  {
    id: "SCN-2026-5120",
    target: "candid_interview_clip.mp4",
    type: "VIDEO",
    mediaCategory: "Video Stream",
    timestamp: "2026-08-03T16:45:00Z",
    status: "Completed",
    riskScore: 52,
    result: "INCONCLUSIVE",
    confidenceScore: "58.4% UNCERTAIN",
    riskLevel: "MODERATE RISK",
    duration: "1m 15s",
    resolution: "1920 x 1080 (FHD)",
    codec: "H.264 / AAC",
    hardware: "iPhone 14 Pro",
    checksum: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    summary: "Heavy video compression and low lighting created compression artifacts that overlap with synthetic face-swap thresholds. Additional manual forensic verification recommended.",
    forensicFindings: [
      { title: "Facial Boundary Analysis", score: "Compression Blur", status: "Warning", detail: "Low bitrate encoding causes blockiness around subject features." },
      { title: "Lip-Sync & Audio Alignment", score: "92.0% Sync", status: "Clean", detail: "Audio and video streams remain temporally synchronized." },
      { title: "Compression Residuals", score: "High Bitrate Compression", status: "Warning", detail: "H.264 macroblocking interferes with GAN detection threshold." }
    ],
    metadataFindings: [
      { label: "Camera Hardware Signature", value: "Apple iPhone 14 Pro (Front Camera)" },
      { label: "Software Encoding Tag", value: "iOS 17.4 Camera App" },
      { label: "Video Bitrate", value: "4.2 Mbps (Compressed Web Stream)" }
    ],
    manipulationIndicators: [
      { name: "Face-Swap Boundary Distortion", detected: false, confidence: "45.0%" },
      { name: "GAN Spectral Grid Patterns", detected: false, confidence: "38.2%" },
      { name: "Voice Synthesizer Harmonics", detected: false, confidence: "12.0%" }
    ],
    timelineEvents: [
      { timestamp: "00:00:01", title: "Video Stream Initialized", status: "Ingested", detail: "1080p H.264 video container parsed." },
      { timestamp: "00:00:10", title: "Frame Bitrate Analysis", status: "Warning", detail: "Macroblocking detected due to mobile web compression." }
    ]
  }
];
