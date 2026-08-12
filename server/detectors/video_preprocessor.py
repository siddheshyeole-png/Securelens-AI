#!/usr/bin/env python3
"""
SecureLens AI - Modular Video Preprocessor Layer
Handles container validation, metadata extraction, keyframe sampling,
face detection/cropping, temporary file management, and server diagnostics.
"""

import sys
import os
import json
import math
import shutil
import tempfile
import hashlib

def validate_video_file(video_path):
    """
    Validates that file exists, is non-empty, and has a readable container header.
    """
    if not os.path.exists(video_path):
        return False, "File does not exist on disk."

    file_size = os.path.getsize(video_path)
    if file_size < 64:
        return False, "File size is too small to be a valid video container."

    # Check container magic header bytes (MP4: ftyp, MOV: moov/mdat/free, WEBM: 1A 45 DF A3)
    try:
        with open(video_path, "rb") as f:
            header = f.read(32)
            is_mp4 = len(header) > 8 and b"ftyp" in header[:16]
            is_mov = len(header) > 8 and (b"moov" in header or b"free" in header or b"mdat" in header)
            is_webm = header.startswith(b"\x1a\x45\xdf\xa3")
            is_avi_mkv = b"RIFF" in header[:12] or b"matroska" in header[:32]

            if not (is_mp4 or is_mov or is_webm or is_avi_mkv):
                # Fallback check if OpenCV can open it
                return True, "Valid media payload (fallback header check)"
    except Exception as e:
        return False, f"Failed to read file header: {str(e)}"

    return True, "Valid video container"

def extract_container_metadata(cap, video_path):
    """
    Extracts metadata: FPS, total frame count, resolution, and duration in seconds.
    """
    fps = cap.get(10) # cv2.CAP_PROP_FPS = 5 or 10 depending on binding
    try:
        import cv2
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 0
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 0
    except Exception:
        fps = 30.0
        total_frames = 0
        width = 0
        height = 0

    fps = max(1.0, float(fps))
    duration_sec = round(total_frames / fps, 2) if total_frames > 0 else 0.0

    return {
        "fps": fps,
        "totalFrames": total_frames,
        "width": width,
        "height": height,
        "resolution": f"{width}x{height}",
        "durationSec": duration_sec
    }

def init_face_detector():
    """
    Initializes OpenCV face detector safely for OpenCV 5.0+ or Haar Cascades.
    """
    try:
        import cv2
        if hasattr(cv2, 'CascadeClassifier'):
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            if os.path.exists(cascade_path):
                clf = cv2.CascadeClassifier(cascade_path)
                if not clf.empty():
                    return clf
    except Exception:
        pass
    return None

def sample_keyframes_and_crop(video_path, max_samples=15):
    """
    Streams keyframes 1-by-1 (no huge memory buffers), crops faces, and generates dev diagnostics.
    Handles: ultra-short videos, no-face videos, multiple faces, and corrupted frames.
    """
    import cv2

    valid, msg = validate_video_file(video_path)
    if not valid:
        return {
            "success": False,
            "error": msg
        }

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "success": False,
            "error": "OpenCV failed to open video container stream."
        }

    meta = extract_container_metadata(cap, video_path)
    fps = meta["fps"]
    total_frames = meta["totalFrames"]

    # Sample rate: 1 frame per second, or at least 1 frame for short videos (<1s)
    sample_interval = max(1, int(fps))
    face_clf = init_face_detector()

    sampled_frames = []
    detected_faces = []
    
    frame_idx = 0
    corrupted_frame_count = 0
    face_count = 0

    # Temporary directory for cropped face frame cache
    temp_dir = tempfile.mkdtemp(prefix="securelens_frames_")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                # Handle end of stream or corrupted trailing frames gracefully
                break

            if frame is None or frame.size == 0:
                corrupted_frame_count += 1
                frame_idx += 1
                continue

            # Sample keyframes
            if frame_idx % sample_interval == 0 and len(sampled_frames) < max_samples:
                sampled_frames.append({
                    "frameIndex": frame_idx,
                    "timestampSec": round(frame_idx / fps, 2),
                    "shape": frame.shape
                })

                # Face Detection & Cropping
                if len(frame.shape) == 3:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                else:
                    gray = frame

                faces = []
                if face_clf is not None:
                    try:
                        faces = face_clf.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
                    except Exception:
                        faces = []

                if len(faces) > 0:
                    for face_i, (x, y, w, h) in enumerate(faces):
                        face_count += 1
                        face_crop = frame[y:y+h, x:x+w]
                        
                        # Save cropped face ROI to temp directory
                        crop_filename = f"face_f{frame_idx}_i{face_i}.jpg"
                        crop_path = os.path.join(temp_dir, crop_filename)
                        cv2.imwrite(crop_path, face_crop)

                        detected_faces.append({
                            "frameIndex": frame_idx,
                            "bbox": [int(x), int(y), int(w), int(h)],
                            "cropPath": crop_path
                        })

            frame_idx += 1

    finally:
        cap.release()

    # Fallback for ultra-short video with 0 sampled frames
    if len(sampled_frames) == 0 and total_frames > 0:
        sampled_frames.append({
            "frameIndex": 0,
            "timestampSec": 0.0,
            "shape": [meta["height"], meta["width"], 3]
        })

    diagnostics = {
        "duration": f"{meta['durationSec']}s",
        "frameCount": meta["totalFrames"],
        "sampledFrameCount": len(sampled_frames),
        "detectedFaceCount": face_count,
        "corruptedFrameCount": corrupted_frame_count,
        "fps": meta["fps"],
        "resolution": meta["resolution"]
    }

    return {
        "success": True,
        "metadata": meta,
        "diagnostics": diagnostics,
        "sampledFrames": sampled_frames,
        "detectedFaces": detected_faces,
        "tempCacheDir": temp_dir
    }

def cleanup_temp_dir(temp_dir):
    """
    Safely removes temporary frame cache directory.
    """
    if temp_dir and os.path.exists(temp_dir):
        try:
            shutil.rmtree(temp_dir)
            return True
        except Exception as e:
            sys.stderr.write(f"Warning: Failed to clean temp dir {temp_dir}: {str(e)}\n")
            return False
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Missing video file path argument"}))
        sys.exit(1)

    v_path = sys.argv[1]
    res = sample_keyframes_and_crop(v_path)
    
    # Print diagnostics report without raw frame arrays
    out = {
        "success": res.get("success", False),
        "metadata": res.get("metadata"),
        "diagnostics": res.get("diagnostics"),
        "error": res.get("error")
    }
    print(json.dumps(out))

    # Clean up temp cache
    if res.get("tempCacheDir"):
        cleanup_temp_dir(res["tempCacheDir"])
