import logging

import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.model_loader import (
    model,
    label_encoder,
    historical_profiles,
    overall_profile,
    train_thresholds,
    global_threshold,
)

logger = logging.getLogger(__name__)


def predict_flood(
    rainfall: float,
    month: int,
    year: int,
    subdivision_name: str,
) -> dict:
    """
    Predict flood probability for a given location and rainfall.

    Uses a trained ML model when available, otherwise falls back
    to a heuristic based on the rainfall-to-threshold ratio.
    """

    # --- Validate subdivision (case-insensitive) ---
    valid_names = {
        name.lower(): name
        for name in label_encoder.classes_
    }

    subdivision_name = subdivision_name.strip()

    if subdivision_name.lower() not in valid_names:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown subdivision: '{subdivision_name}'. "
                   f"Use GET /subdivisions for valid values.",
        )

    subdivision_name = valid_names[subdivision_name.lower()]

    # --- Build historical profile ---
    match = historical_profiles[
        (historical_profiles["SUBDIVISION"] == subdivision_name)
        & (historical_profiles["MONTH"] == month)
    ]

    if match.empty:
        profile = overall_profile
    else:
        profile = match.iloc[0]

    # --- Encode subdivision ---
    subdivision_encoded = label_encoder.transform(
        [subdivision_name]
    )[0]

    # --- Derived features ---
    monsoon = int(month in [6, 7, 8, 9])

    lag_1 = float(profile["RAINFALL_LAG_1"])
    lag_2 = float(profile["RAINFALL_LAG_2"])
    lag_3 = float(profile["RAINFALL_LAG_3"])
    lag_12 = float(profile["RAINFALL_LAG_12"])

    roll_3 = float(profile["RAINFALL_ROLL_3"])
    roll_6 = float(profile["RAINFALL_ROLL_6"])

    change_1 = rainfall - lag_1

    input_df = pd.DataFrame([{
        "RAINFALL": rainfall,
        "MONTH": month,
        "YEAR": year,
        "SUBDIVISION_ENC": subdivision_encoded,
        "MONSOON": monsoon,
        "RAINFALL_LAG_1": lag_1,
        "RAINFALL_LAG_2": lag_2,
        "RAINFALL_LAG_3": lag_3,
        "RAINFALL_LAG_12": lag_12,
        "RAINFALL_ROLL_3": roll_3,
        "RAINFALL_ROLL_6": roll_6,
        "RAINFALL_CHANGE_1": change_1,
    }])

    # --- Historical threshold ---
    threshold = float(
        train_thresholds.get(subdivision_name, global_threshold)
    )

    margin = abs(rainfall - threshold)

    # --- Prediction ---
    if model is None:
        logger.info("Model is None — using heuristic fallback")
        probability = float(
            np.clip(
                (rainfall / max(threshold, 1e-6)) / 1.5,
                0,
                1,
            )
        )
    else:
        probability = float(
            model.predict_proba(input_df)[0][1]
        )

    # --- Confidence / Uncertainty ---
    confidence = min(
        margin / max(threshold, 1e-6),
        1.0,
    )
    uncertainty = 1.0 - confidence

    # --- Risk level ---
    if probability < 0.30:
        risk = "LOW"
    elif probability < 0.70:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return {
        "probability": round(probability * 100, 2),
        "confidence": round(confidence * 100, 2),
        "uncertainty": round(uncertainty * 100, 2),
        "risk": risk,
        "threshold": round(threshold, 2),
    }
