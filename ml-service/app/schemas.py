"""
schemas.py
----------
Pydantic v2 request / response models for the Fraud Detection API.
"""

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class TransactionFeatures(BaseModel):
    """
    All 30 features expected by the fraud model.
    Time and Amount will be scaled server-side by the saved StandardScaler.
    V1-V28 are PCA-transformed features from the original dataset.
    """

    Time:  float = Field(..., description="Seconds elapsed since first transaction")
    V1:    float
    V2:    float
    V3:    float
    V4:    float
    V5:    float
    V6:    float
    V7:    float
    V8:    float
    V9:    float
    V10:   float
    V11:   float
    V12:   float
    V13:   float
    V14:   float
    V15:   float
    V16:   float
    V17:   float
    V18:   float
    V19:   float
    V20:   float
    V21:   float
    V22:   float
    V23:   float
    V24:   float
    V25:   float
    V26:   float
    V27:   float
    V28:   float
    Amount: float = Field(..., description="Transaction amount in USD", ge=0)

    model_config = {
        "json_schema_extra": {
            "example": {
                "Time": 406.0,
                "V1": -1.3598071,
                "V2": -0.0727811,
                "V3": 2.5363467,
                "V4": 1.3781552,
                "V5": -0.3383208,
                "V6": 0.4623878,
                "V7": 0.2395986,
                "V8": 0.0986979,
                "V9": 0.3637870,
                "V10": 0.0907942,
                "V11": -0.5515995,
                "V12": -0.6178009,
                "V13": -0.9913898,
                "V14": -0.3111694,
                "V15": 1.4681770,
                "V16": -0.4704005,
                "V17": 0.2079708,
                "V18": 0.0257905,
                "V19": 0.4039936,
                "V20": 0.2514121,
                "V21": -0.0183068,
                "V22": 0.2778376,
                "V23": -0.1104739,
                "V24": 0.0669281,
                "V25": 0.1285395,
                "V26": -0.1891093,
                "V27": 0.1335584,
                "V28": -0.0210530,
                "Amount": 149.62,
            }
        }
    }


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class PredictionResponse(BaseModel):
    """Single-transaction prediction result."""

    fraud:             bool  = Field(..., description="True if transaction is predicted fraudulent")
    confidence:        float = Field(..., ge=0.0, le=1.0, description="Model confidence (fraud probability)")
    fraud_probability: float = Field(..., ge=0.0, le=1.0, description="Raw fraud probability score")
    shap_values:       dict[str, float] = Field(
        ..., description="SHAP feature contributions (positive = pushes toward fraud)"
    )


class SinglePrediction(BaseModel):
    """One entry inside a bulk response."""

    row_index:         int
    fraud:             bool
    confidence:        float = Field(..., ge=0.0, le=1.0)
    fraud_probability: float = Field(..., ge=0.0, le=1.0)


class BulkPredictionResponse(BaseModel):
    """Bulk-CSV prediction result."""

    predictions:      list[SinglePrediction]
    total:            int   = Field(..., description="Total number of transactions processed")
    fraud_count:      int   = Field(..., description="Number of transactions predicted as fraud")
    fraud_percentage: float = Field(..., description="Percentage of transactions predicted as fraud")
