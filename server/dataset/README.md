# SecureLens AI - Development Validation Test Dataset

[DEVELOPMENT & TESTING ONLY]

This directory holds test media files used to evaluate Sightengine model accuracy and measure false positives / false negatives without modifying production code or hardcoding scores.

## Directory Structure

```
server/dataset/
├── authentic/       # Known real/authentic photographs or recordings
├── ai_generated/    # Known AI-generated images (e.g. Midjourney, DALL-E, Stable Diffusion)
└── deepfake/        # Known face swap or manipulated media
```

## Running Validation Benchmark

Run the validation suite via CLI:

```bash
node server/validate_sightengine.js server/dataset
```

The script will submit each file to the real Sightengine API, record actual scores (`genaiScore`, `deepfakeScore`, `verdict`), compute TP/TN/FP/FN metrics, and save `server/logs/dataset_validation_metrics.json`.
