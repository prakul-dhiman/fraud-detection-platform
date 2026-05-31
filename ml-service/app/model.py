"""
model.py
--------
Model loader and predictor for the Fraud Detection API.

Loads:
  - model/fraud_model.pkl  (XGBClassifier trained with train_model_full.py)
  - model/scaler.pkl       (StandardScaler for Amount and Time)

Exposes:
  - predict_single(features_dict) -> dict
  - predict_bulk(rows)            -> list[dict]
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import shap

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Feature column order – must match training
# ---------------------------------------------------------------------------
FEATURE_COLS: list[str] = (
    ["Time"]
    + [f"V{i}" for i in range(1, 29)]
    + ["Amount"]
)

# Columns whose values are scaled by the scaler (order matches training)
SCALE_COLS: list[str] = ["Amount", "Time"]

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BASE_DIR   = Path(__file__).resolve().parent.parent   # ml-service/
_MODEL_PATH = _BASE_DIR / "model" / "fraud_model.pkl"
_SCALER_PATH= _BASE_DIR / "model" / "scaler.pkl"

# ---------------------------------------------------------------------------
# Module-level singletons (populated by load_model())
# ---------------------------------------------------------------------------
_model:    Any | None = None
_scaler:   Any | None = None
_explainer: shap.TreeExplainer | None = None


def load_model() -> None:
    """
    Load the XGBoost model, scaler, and initialise SHAP TreeExplainer.
    Called once on application startup via FastAPI lifespan.
    Raises FileNotFoundError if artifacts are missing.
    """
    global _model, _scaler, _explainer

    if not _MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model artifact not found: {_MODEL_PATH}\n"
            "Run notebooks/train_model_full.py first."
        )
    if not _SCALER_PATH.exists():
        raise FileNotFoundError(
            f"Scaler artifact not found: {_SCALER_PATH}\n"
            "Run notebooks/train_model_full.py first."
        )

    logger.info("Loading model from %s …", _MODEL_PATH)
    _model  = joblib.load(_MODEL_PATH)
    _scaler = joblib.load(_SCALER_PATH)

    logger.info("Initialising SHAP TreeExplainer …")
    _explainer = shap.TreeExplainer(_model)

    logger.info("Model ready.")


def is_model_loaded() -> bool:
    """Return True when all artifacts are loaded."""
    return _model is not None and _scaler is not None and _explainer is not None


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _build_feature_array(features_dict: dict[str, float]) -> np.ndarray:
    """
    Convert a feature dict to a scaled numpy array in the correct column order.
    Amount and Time are scaled via the loaded StandardScaler.
    """
    # Build a 1-row DataFrame in training column order
    row = {col: features_dict[col] for col in FEATURE_COLS}
    df  = pd.DataFrame([row], columns=FEATURE_COLS)

    # Scale Amount and Time in-place (CoW-safe copy)
    df = df.copy()
    df[SCALE_COLS] = _scaler.transform(df[SCALE_COLS])

    return df.values  # shape (1, 30)


def _build_feature_matrix(rows: list[dict[str, float]]) -> np.ndarray:
    """Build a scaled feature matrix from a list of feature dicts."""
    df = pd.DataFrame(rows, columns=FEATURE_COLS).copy()
    df[SCALE_COLS] = _scaler.transform(df[SCALE_COLS])
    return df.values


def _extract_shap_dict(X_row: np.ndarray) -> dict[str, float]:
    """
    Compute SHAP values for a single row and return as a feature-name-keyed dict.
    Handles both ndarray output (XGBoost 3.x default) and legacy list output.
    """
    shap_vals = _explainer.shap_values(X_row)   # shape (1, 30) or list of that

    # Binary classification: XGBoost TreeExplainer returns a 2-D ndarray for
    # the positive class.  Older versions returned a list [neg, pos].
    if isinstance(shap_vals, list):
        # list of [neg_class_array, pos_class_array]
        sv_row = np.array(shap_vals[1]).flatten()
    else:
        sv_row = np.array(shap_vals).flatten()

    return {feat: float(sv_row[i]) for i, feat in enumerate(FEATURE_COLS)}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def predict_single(features_dict: dict[str, float]) -> dict:
    """
    Predict fraud for a single transaction.

    Parameters
    ----------
    features_dict : dict mapping feature name -> value (unscaled)

    Returns
    -------
    dict with keys:
        fraud             (bool)
        confidence        (float 0-1, same as fraud_probability)
        fraud_probability (float 0-1)
        shap_values       (dict[str, float])
    """
    if not is_model_loaded():
        raise RuntimeError("Model is not loaded. Call load_model() first.")

    X = _build_feature_array(features_dict)          # (1, 30)
    fraud_prob  = float(_model.predict_proba(X)[0, 1])
    fraud_label = bool(_model.predict(X)[0])

    shap_dict = _extract_shap_dict(X)

    return {
        "fraud":             fraud_label,
        "confidence":        fraud_prob,
        "fraud_probability": fraud_prob,
        "shap_values":       shap_dict,
    }


def predict_bulk(rows: list[dict[str, float]]) -> list[dict]:
    """
    Predict fraud for multiple transactions.

    Parameters
    ----------
    rows : list of feature dicts (unscaled)

    Returns
    -------
    list of dicts, each containing:
        row_index         (int)
        fraud             (bool)
        confidence        (float)
        fraud_probability (float)
    """
    if not is_model_loaded():
        raise RuntimeError("Model is not loaded. Call load_model() first.")

    if not rows:
        return []

    X = _build_feature_matrix(rows)                   # (N, 30)
    probs  = _model.predict_proba(X)[:, 1]            # (N,)
    labels = _model.predict(X)                        # (N,)

    results = []
    for i, (prob, label) in enumerate(zip(probs, labels)):
        results.append(
            {
                "row_index":         i,
                "fraud":             bool(label),
                "confidence":        float(prob),
                "fraud_probability": float(prob),
            }
        )
    return results
