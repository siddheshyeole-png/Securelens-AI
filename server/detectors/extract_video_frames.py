#!/usr/bin/env python3
"""
SecureLens AI - Server-Side Representative Video Frame Extractor
Samples 8 to 12 representative keyframes across video timeline using OpenCV.
"""

import sys
import os
import json
import tempfile
import shutil

def extract_representative_frames(video_path, target_count=10):
    if not os.path.exists(video_path):
        return {
            "success": False,
            "error": f"Video file not found: {video_path}"
        }

    try:
        import cv2
    except ImportError as e:
        return {
            "success": False,
            "error": f"Required CV package missing: {str(e)}"
        }

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "success": False,
            "error": "OpenCV failed to open video container stream."
        }

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 0
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 0
    duration_sec = round(total_frames / fps, 2) if (total_frames > 0 and fps > 0) else 0.0

    # Ensure target frame count is within 8-12 range when possible
    num_frames_to_extract = max(1, min(12, max(8, target_count)))
    
    if total_frames > 0 and total_frames < num_frames_to_extract:
        frame_indices = list(range(total_frames))
    elif total_frames > 0:
        step = total_frames / num_frames_to_extract
        frame_indices = [int(i * step) for i in range(num_frames_to_extract)]
    else:
        frame_indices = [0]

    temp_dir = tempfile.mkdtemp(prefix="securelens_video_frames_")
    extracted_frames = []

    try:
        for idx, f_index in enumerate(frame_indices):
            cap.set(cv2.CAP_PROP_POS_FRAMES, f_index)
            ret, frame = cap.read()
            if ret and frame is not None and frame.size > 0:
                frame_filename = f"frame_{idx:02d}_f{f_index}.jpg"
                frame_path = os.path.join(temp_dir, frame_filename)
                
                # Save as high-quality JPEG image
                cv2.imwrite(frame_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
                timestamp_sec = round(f_index / fps, 2) if fps > 0 else 0.0

                extracted_frames.append({
                    "frameIndex": f_index,
                    "timestampSec": timestamp_sec,
                    "framePath": frame_path,
                    "width": width,
                    "height": height
                })
    finally:
        cap.release()

    if len(extracted_frames) == 0:
        # Fallback if seek failed: read sequentially
        cap = cv2.VideoCapture(video_path)
        count = 0
        while cap.isOpened() and count < num_frames_to_extract:
            ret, frame = cap.read()
            if not ret or frame is None or frame.size == 0:
                break
            frame_filename = f"frame_fallback_{count:02d}.jpg"
            frame_path = os.path.join(temp_dir, frame_filename)
            cv2.imwrite(frame_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
            extracted_frames.append({
                "frameIndex": count,
                "timestampSec": round(count / fps, 2) if fps > 0 else 0.0,
                "framePath": frame_path,
                "width": width,
                "height": height
            })
            count += 1
        cap.release()

    diagnostics = {
        "duration": f"{duration_sec}s",
        "frameCount": total_frames,
        "extractedFrameCount": len(extracted_frames),
        "fps": fps,
        "resolution": f"{width}x{height}"
    }

    return {
        "success": True,
        "metadata": {
            "fps": fps,
            "totalFrames": total_frames,
            "width": width,
            "height": height,
            "durationSec": duration_sec
        },
        "diagnostics": diagnostics,
        "extractedFrames": extracted_frames,
        "tempCacheDir": temp_dir
    }

def cleanup_temp_dir(temp_dir):
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

    video_path = sys.argv[1]
    target_count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    result = extract_representative_frames(video_path, target_count)
    print(json.dumps(result))
