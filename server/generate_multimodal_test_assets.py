import wave
import numpy as np
import os
import base64

dir_path = os.path.dirname(__file__)

# 1. Silent Audio File (3.0s 16kHz zero samples)
silent_path = os.path.join(dir_path, "test_silent_audio.wav")
sr = 16000
duration = 3.0
zeros = np.zeros(int(sr * duration), dtype=np.int16)
with wave.open(silent_path, "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes(zeros.tobytes())
print("Generated silent audio asset:", silent_path)

# 2. Short Audio File (0.5s 16kHz audio)
short_path = os.path.join(dir_path, "test_short_audio.wav")
t_short = np.linspace(0, 0.5, int(sr * 0.5), False)
tone_short = (np.sin(2 * np.pi * 440 * t_short) * 32767.0).astype(np.int16)
with wave.open(short_path, "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    wf.writeframes(tone_short.tobytes())
print("Generated short audio asset:", short_path)

# 3. Corrupted Audio/Video File
corrupt_path = os.path.join(dir_path, "test_corrupted_file.wav")
with open(corrupt_path, "wb") as f:
    f.write(b"CORRUPTED_HEADER_DATA_1234567890_TRUNCATED")
print("Generated corrupted media asset:", corrupt_path)

# 4. Invalid Text File
invalid_path = os.path.join(dir_path, "test_invalid_file.txt")
with open(invalid_path, "w") as f:
    f.write("This is a plain text file, not a valid media file.")
print("Generated invalid file asset:", invalid_path)

# 5. Valid Portrait JPEG Asset
portrait_path = os.path.join(dir_path, "test_portrait.jpg")
tiny_jpeg_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
with open(portrait_path, "wb") as f:
    f.write(base64.b64decode(tiny_jpeg_b64))
print("Generated test_portrait.jpg asset:", portrait_path)
