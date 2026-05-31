"""
train_model_full.py
-------------------
Full training pipeline for Credit Card Fraud Detection.

Compatible with:
  - xgboost       3.2.0
  - shap          0.52.0
  - pandas        3.0.3  (Copy-on-Write aware)
  - scikit-learn  1.8.0
  - imbalanced-learn 0.14.1
"""

import os
import sys
import warnings
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")          # non-interactive backend for saving figures
import matplotlib.pyplot as plt
import seaborn as sns
import shap
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score,
    roc_curve,
    precision_recall_curve,
)
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR   = Path(__file__).resolve().parent.parent   # ml-service/
DATA_PATH  = BASE_DIR / "creditcard.csv"
MODEL_DIR  = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "fraud_model.pkl"
SCALER_PATH= MODEL_DIR / "scaler.pkl"
CHARTS_DIR = BASE_DIR / "notebooks"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
CHARTS_DIR.mkdir(parents=True, exist_ok=True)

EVAL_CHART_PATH = CHARTS_DIR / "evaluation_charts.png"
SHAP_CHART_PATH = CHARTS_DIR / "shap_summary.png"

# ---------------------------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------------------------
print("=" * 60)
print("STEP 1: Loading data ...")
print("=" * 60)

if not DATA_PATH.exists():
    sys.exit(
        f"[ERROR] creditcard.csv not found at {DATA_PATH}.\n"
        "Please place the dataset in the ml-service/ folder."
    )

df = pd.read_csv(DATA_PATH)
print(f"  Loaded {len(df):,} rows x {df.shape[1]} columns")
print(f"  Fraud rate : {df['Class'].mean()*100:.4f}%  "
      f"({df['Class'].sum():,} fraud / {len(df):,} total)")

# ---------------------------------------------------------------------------
# 2. Feature engineering – scale Amount & Time
# ---------------------------------------------------------------------------
print("\nSTEP 2: Scaling Amount and Time ...")

feature_cols = [c for c in df.columns if c != "Class"]

# pandas 3.0 CoW: use .copy() explicitly when we want a detached frame
df_proc = df.copy()

scaler = StandardScaler()
df_proc[["Amount", "Time"]] = scaler.fit_transform(df_proc[["Amount", "Time"]])

joblib.dump(scaler, SCALER_PATH)
print(f"  Scaler saved -> {SCALER_PATH}")

X = df_proc[feature_cols].values
y = df_proc["Class"].values

# ---------------------------------------------------------------------------
# 3. Stratified 80/20 split
# ---------------------------------------------------------------------------
print("\nSTEP 3: Stratified 80/20 train/test split ...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)
print(f"  Train size : {len(X_train):,}  |  Test size : {len(X_test):,}")
print(f"  Train fraud: {y_train.sum():,}  |  Test fraud: {y_test.sum():,}")

# ---------------------------------------------------------------------------
# 4. SMOTE on training set only
# ---------------------------------------------------------------------------
print("\nSTEP 4: Applying SMOTE to training set ...")

smote = SMOTE(k_neighbors=5, random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

print(f"  Before SMOTE -> {np.bincount(y_train)}")
print(f"  After  SMOTE -> {np.bincount(y_train_res)}")

# ---------------------------------------------------------------------------
# 5. Train XGBoost
# ---------------------------------------------------------------------------
print("\nSTEP 5: Training XGBoost classifier ...")

model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss",   # passed in constructor, not fit(); xgboost 3.x
    random_state=42,
    n_jobs=-1,
)

model.fit(
    X_train_res, y_train_res,
    eval_set=[(X_test, y_test)],
    verbose=False,
)
print("  Training complete.")

# ---------------------------------------------------------------------------
# 6. Evaluation
# ---------------------------------------------------------------------------
print("\nSTEP 6: Evaluating model ...")

y_pred      = model.predict(X_test)
y_prob      = model.predict_proba(X_test)[:, 1]

roc_auc     = roc_auc_score(y_test, y_prob)
avg_prec    = average_precision_score(y_test, y_prob)
cm          = confusion_matrix(y_test, y_pred)
report      = classification_report(y_test, y_pred, target_names=["Legit", "Fraud"])

print("\n  Classification Report:")
print(report)
print(f"  ROC-AUC Score        : {roc_auc:.6f}")
print(f"  Average Precision    : {avg_prec:.6f}")
print(f"\n  Confusion Matrix:\n{cm}")

# ---------------------------------------------------------------------------
# 7. Charts – evaluation_charts.png (confusion matrix + ROC + PR)
# ---------------------------------------------------------------------------
print("\nSTEP 7: Generating evaluation charts ...")

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle("Fraud Detection - Model Evaluation", fontsize=15, fontweight="bold")

# 7a. Confusion Matrix
ax = axes[0]
sns.heatmap(
    cm, annot=True, fmt="d", cmap="Blues", ax=ax,
    xticklabels=["Legit", "Fraud"],
    yticklabels=["Legit", "Fraud"],
)
ax.set_title("Confusion Matrix")
ax.set_ylabel("True Label")
ax.set_xlabel("Predicted Label")

# 7b. ROC Curve
ax = axes[1]
fpr, tpr, _ = roc_curve(y_test, y_prob)
ax.plot(fpr, tpr, color="darkorange", lw=2,
        label=f"ROC curve (AUC = {roc_auc:.4f})")
ax.plot([0, 1], [0, 1], color="navy", lw=1, linestyle="--")
ax.set_xlim([0.0, 1.0])
ax.set_ylim([0.0, 1.05])
ax.set_xlabel("False Positive Rate")
ax.set_ylabel("True Positive Rate")
ax.set_title("ROC Curve")
ax.legend(loc="lower right")

# 7c. Precision-Recall Curve
ax = axes[2]
precision, recall, _ = precision_recall_curve(y_test, y_prob)
ax.plot(recall, precision, color="green", lw=2,
        label=f"PR curve (AP = {avg_prec:.4f})")
ax.set_xlabel("Recall")
ax.set_ylabel("Precision")
ax.set_title("Precision-Recall Curve")
ax.legend(loc="upper right")

plt.tight_layout()
fig.savefig(EVAL_CHART_PATH, dpi=150, bbox_inches="tight")
plt.close(fig)
print(f"  Evaluation charts saved -> {EVAL_CHART_PATH}")

# ---------------------------------------------------------------------------
# 8. SHAP summary chart
# ---------------------------------------------------------------------------
print("\nSTEP 8: Computing SHAP values (TreeExplainer) ...")

# Use a subsample for SHAP (keep computation tractable)
N_SHAP = min(2000, len(X_test))
rng    = np.random.default_rng(42)
idx    = rng.choice(len(X_test), size=N_SHAP, replace=False)
X_shap = X_test[idx]

explainer   = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_shap)

# For binary classification XGBoost, shap_values is a 2-D ndarray
# (one matrix for the positive class).
# Some versions return a list [neg_class, pos_class] – handle both.
if isinstance(shap_values, list):
    shap_matrix = shap_values[1]   # positive (fraud) class
else:
    shap_matrix = shap_values      # already the positive class matrix

fig_shap, ax_shap = plt.subplots(figsize=(10, 8))
shap.summary_plot(
    shap_matrix,
    X_shap,
    feature_names=feature_cols,
    show=False,
    plot_size=None,
)
plt.title("SHAP Feature Importance - Fraud Class", fontsize=13)
plt.tight_layout()
fig_shap.savefig(SHAP_CHART_PATH, dpi=150, bbox_inches="tight")
plt.close(fig_shap)
print(f"  SHAP summary saved    -> {SHAP_CHART_PATH}")

# ---------------------------------------------------------------------------
# 9. Save model
# ---------------------------------------------------------------------------
print("\nSTEP 9: Saving model ...")
joblib.dump(model, MODEL_PATH)
print(f"  Model saved -> {MODEL_PATH}")

# ---------------------------------------------------------------------------
# Final summary
# ---------------------------------------------------------------------------
tn, fp, fn, tp = cm.ravel()

print("\n" + "=" * 60)
print("  TRAINING COMPLETE – FINAL SUMMARY")
print("=" * 60)
print(f"  Dataset rows          : {len(df):,}")
print(f"  Train rows (SMOTE)    : {len(X_train_res):,}")
print(f"  Test rows             : {len(X_test):,}")
print(f"  ROC-AUC               : {roc_auc:.6f}")
print(f"  Average Precision     : {avg_prec:.6f}")
print(f"  True Positives (TP)   : {tp}")
print(f"  True Negatives (TN)   : {tn}")
print(f"  False Positives (FP)  : {fp}")
print(f"  False Negatives (FN)  : {fn}")
print(f"  Precision (Fraud)     : {tp / (tp + fp):.6f}")
print(f"  Recall    (Fraud)     : {tp / (tp + fn):.6f}")
print(f"  Model artifact        : {str(MODEL_PATH)}")
print(f"  Scaler artifact       : {str(SCALER_PATH)}")
print(f"  Evaluation chart      : {str(EVAL_CHART_PATH)}")
print(f"  SHAP chart            : {str(SHAP_CHART_PATH)}")
print("=" * 60)
