import cv2
import numpy as np
import os

video_path = os.path.join(os.path.dirname(__file__), "test_sample_video.mp4")

# Create a 2-second 30fps 360x360 video
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(video_path, fourcc, 30.0, (360, 360))

for i in range(60):
    # Generate animated frame
    frame = np.zeros((360, 360, 3), dtype=np.uint8)
    color = (int(i * 4) % 255, 128, 200)
    cv2.circle(frame, (180, 180), 50 + (i % 20), color, -1)
    out.write(frame)

out.release()
print("Generated valid MP4 video at:", video_path)
