"""
main.py
-------
FastAPI application for Credit Card Fraud Detection.

Endpoints:
  GET  /health          → liveness / readiness check
  POST /predict         → single-transaction fraud prediction
  POST /predict-bulk    → bulk CSV upload prediction

Run locally:
  uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import io
import logging
from contextlib import asynccontextmanager

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from app import model as fraud_model
from app.schemas import (
    BulkPredictionResponse,
    PredictionResponse,
    SinglePrediction,
    TransactionFeatures,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Required CSV columns (same as model feature columns)
# ---------------------------------------------------------------------------
REQUIRED_COLS: list[str] = (
    ["Time"]
    + [f"V{i}" for i in range(1, 29)]
    + ["Amount"]
)


# ---------------------------------------------------------------------------
# Lifespan – load model artifacts on startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML model on startup, release resources on shutdown."""
    logger.info("Starting up – loading fraud detection model …")
    try:
        fraud_model.load_model()
        logger.info("Model loaded successfully.")
    except FileNotFoundError as exc:
        logger.error("Model artifact missing: %s", exc)
        # App will start but /predict endpoints will return 503
    except Exception as exc:
        logger.exception("Unexpected error loading model: %s", exc)

    yield  # ← application runs here

    logger.info("Shutting down.")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Fraud Detection API",
    description=(
        "Real-time and batch credit-card fraud detection "
        "powered by XGBoost + SHAP."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def _assert_model_ready() -> None:
    """Raise HTTP 503 if the model failed to load on startup."""
    if not fraud_model.is_model_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Model artifacts are not loaded. "
                "Please ensure fraud_model.pkl and scaler.pkl exist in model/ "
                "and restart the service."
            ),
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    summary="Health check",
    tags=["Ops"],
)
async def health_check() -> dict:
    """
    Liveness and readiness probe.

    Returns `model_loaded: true` when the ML model is ready to serve traffic.
    """
    return {
        "status": "ok",
        "model_loaded": fraud_model.is_model_loaded(),
    }


@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Single-transaction fraud prediction",
    tags=["Prediction"],
    status_code=status.HTTP_200_OK,
)
async def predict(transaction: TransactionFeatures) -> PredictionResponse:
    """
    Predict whether a single credit-card transaction is fraudulent.

    - **Time**: seconds elapsed since the first transaction in the dataset
    - **V1–V28**: PCA-transformed anonymised features
    - **Amount**: transaction amount in USD

    Returns a fraud flag, confidence score, and per-feature SHAP values.
    """
    _assert_model_ready()

    features_dict = transaction.model_dump()

    try:
        result = fraud_model.predict_single(features_dict)
    except Exception as exc:
        logger.exception("Prediction error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {exc}",
        ) from exc

    return PredictionResponse(**result)


@app.post(
    "/predict-bulk",
    response_model=BulkPredictionResponse,
    summary="Bulk CSV fraud prediction",
    tags=["Prediction"],
    status_code=status.HTTP_200_OK,
)
async def predict_bulk(file: UploadFile = File(...)) -> BulkPredictionResponse:
    """
    Upload a CSV file containing multiple transactions and get fraud predictions
    for each row.

    **Required columns**: Time, V1–V28, Amount  
    An optional `Class` column is allowed but ignored.

    Returns per-row predictions and aggregate fraud statistics.
    """
    _assert_model_ready()

    # ── Validate MIME type ────────────────────────────────────────────────
    if file.content_type not in ("text/csv", "application/csv", "application/octet-stream"):
        # Be permissive – browsers sometimes send octet-stream
        pass  # don't block; rely on pandas parse error instead

    # ── Read file content ─────────────────────────────────────────────────
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not parse CSV: {exc}",
        ) from exc

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded CSV is empty.",
        )

    # ── Validate columns ──────────────────────────────────────────────────
    missing_cols = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"CSV is missing required columns: {missing_cols}. "
                f"Expected: {REQUIRED_COLS}"
            ),
        )

    # Keep only the feature columns (drop Class or extras if present)
    df_features = df[REQUIRED_COLS].copy()

    # Coerce to float; raise on unconvertible values
    try:
        df_features = df_features.astype(float)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Non-numeric value found in feature columns: {exc}",
        ) from exc

    # Check for NaNs
    if df_features.isnull().any().any():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CSV contains NaN / missing values in feature columns.",
        )

    # ── Run bulk prediction ───────────────────────────────────────────────
    rows = df_features.to_dict(orient="records")

    try:
        raw_predictions = fraud_model.predict_bulk(rows)
    except Exception as exc:
        logger.exception("Bulk prediction error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk prediction failed: {exc}",
        ) from exc

    # ── Assemble response ─────────────────────────────────────────────────
    predictions = [SinglePrediction(**p) for p in raw_predictions]
    total       = len(predictions)
    fraud_count = sum(1 for p in predictions if p.fraud)
    fraud_pct   = round((fraud_count / total) * 100, 4) if total > 0 else 0.0

    return BulkPredictionResponse(
        predictions=predictions,
        total=total,
        fraud_count=fraud_count,
        fraud_percentage=fraud_pct,
    )
