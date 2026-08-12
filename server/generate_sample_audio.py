import wave
import numpy as np
import os

audio_path = os.path.join(os.path.dirname(__file__), "test_sample_audio.wav")

# Generate 3.5-second 16kHz stereo sine wave audio (440 Hz tone)
sr = 16000
duration = 3.5
t = np.linspace(0, duration, int(sr * duration), False)
tone = np.sin(2 * np.pi * 440 * t) * 0.5

# Convert to 16-bit PCM stereo (2 channels)
stereo_pcm = np.column_stack((tone, tone)) * 32767.0
stereo_pcm = stereo_pcm.astype(np.int16)

with wave.open(audio_path, "wb") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes(stereo_pcm.tobytes())

print("Generated valid sample WAV audio at:", audio_path)
