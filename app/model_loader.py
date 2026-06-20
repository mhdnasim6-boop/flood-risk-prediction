"""
Model and artifact loader.

Loads all serialized ML artifacts at module import time.
Logs warnings for missing files and None models (fallback mode).
"""

import logging
from pathlib import Path

import joblib

logger = logging.getLogger(__name__)

MODELS_DIR = Path("models")


def _load_artifact(filename: str, required: bool = True):
    """Load a joblib artifact with error handling."""
    filepath = MODELS_DIR / filename
    if not filepath.exists():
        msg = f"Artifact not found: {filepath}"
        if required:
            raise FileNotFoundError(msg)
        logger.warning(msg)
        return None
    try:
        artifact = joblib.load(filepath)
        logger.info("Loaded %s", filepath)
        return artifact
    except Exception as e:
        msg = f"Failed to load {filepath}: {e}"
        if required:
            raise RuntimeError(msg) from e
        logger.warning(msg)
        return None


# --- Load all artifacts ---

model = _load_artifact("flood_model.pkl", required=False)

if model is None:
    logger.warning(
        "flood_model.pkl is None — predictions will use "
        "heuristic fallback (rainfall/threshold ratio)."
    )

label_encoder = _load_artifact("label_encoder.pkl")
historical_profiles = _load_artifact("historical_profiles.pkl")
overall_profile = _load_artifact("overall_profile.pkl")
train_thresholds = _load_artifact("train_thresholds.pkl")
global_threshold = _load_artifact("global_threshold.pkl")