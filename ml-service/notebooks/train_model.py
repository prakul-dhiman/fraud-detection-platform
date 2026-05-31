"""
╔══════════════════════════════════════════════════════════════╗
║   Credit Card Fraud Detection — Complete Training Notebook   ║
║   Week 1, Day 1 — Load Dataset + EDA + Stats                 ║
╚══════════════════════════════════════════════════════════════╝

INSTRUCTIONS:
  1. Open Jupyter: run `jupyter notebook` in your terminal
  2. Create new notebook in ml-service/notebooks/
  3. Copy each section between the ═══ dividers as a new cell
  4. OR just run this file directly: python train_model.py

Each section is clearly labelled with what it does.
"""

# ════════════════════════════════════════════════════════════════
# CELL 1 — IMPORTS
# What each library does:
#   pandas   → read and manipulate tabular data (like Excel but in code)
#   numpy    → fast math on arrays of numbers
#   matplotlib / seaborn → create charts and plots
#   sklearn  → machine learning tools (we use it for splits + metrics)
#   imblearn → fix class imbalance (SMOTE lives here)
#   xgboost  → our main fraud detection model
#   shap     → explain WHY the model made each prediction
#   joblib   → save/load the trained model to a file
# ════════════════════════════════════════════════════════════════

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
import os

warnings.filterwarnings("ignore")  # suppress noisy warnings

# Set plot style globally — makes every chart look clean
plt.style.use("seaborn-v0_8-darkgrid")
sns.set_palette("husl")

print("✅ All libraries imported successfully!")
print(f"   pandas  version: {pd.__version__}")
print(f"   numpy   version: {np.__version__}")


# ════════════════════════════════════════════════════════════════
# CELL 2 — LOAD DATASET
#
# CONCEPT: pd.read_csv() reads the CSV file into a DataFrame.
# A DataFrame is like a spreadsheet:
#   - Rows    = transactions (each row is one credit card transaction)
#   - Columns = features (Time, V1-V28, Amount, Class)
#
# BEFORE RUNNING: place creditcard.csv in ml-service/ folder
# ════════════════════════════════════════════════════════════════

# Build path relative to this file's location
NOTEBOOK_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(NOTEBOOK_DIR, "..", "creditcard.csv")

print(f"\n📂 Loading dataset from: {os.path.abspath(DATA_PATH)}")
print("   (This may take 10–20 seconds — the file is ~150MB)\n")

df = pd.read_csv(DATA_PATH)

print(f"✅ Dataset loaded!")
print(f"   Shape: {df.shape[0]:,} rows × {df.shape[1]} columns")
print(f"   Memory: {df.memory_usage(deep=True).sum() / 1024**2:.1f} MB")


# ════════════════════════════════════════════════════════════════
# CELL 3 — FIRST LOOK AT THE DATA
#
# CONCEPT: Always do EDA (Exploratory Data Analysis) first.
# Never touch the model before you understand your data.
# This is a professional habit that separates good engineers
# from amateurs.
# ════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("FIRST 5 ROWS (df.head())")
print("="*60)
print(df.head())

print("\n" + "="*60)
print("COLUMN NAMES AND DATA TYPES (df.dtypes)")
print("="*60)
print(df.dtypes)

print("\n" + "="*60)
print("MISSING VALUES CHECK (df.isnull().sum())")
print("="*60)
missing = df.isnull().sum()
if missing.sum() == 0:
    print("✅ No missing values! Dataset is clean.")
else:
    print("⚠️  Missing values found:")
    print(missing[missing > 0])

print("\n" + "="*60)
print("BASIC STATISTICS (df.describe())")
print("="*60)
print(df.describe().round(3))


# ════════════════════════════════════════════════════════════════
# CELL 4 — CLASS IMBALANCE ANALYSIS
#
# CONCEPT: Class Imbalance
# Our target column is 'Class':
#   0 = Legitimate transaction
#   1 = Fraud
#
# The KEY problem: fraud is extremely rare in real life.
# If we have 99.83% legitimate and 0.17% fraud, a "dumb" model
# that always says "legitimate" gets 99.83% accuracy — but it
# NEVER catches any fraud. Accuracy is a useless metric here.
#
# Better metrics:
#   Precision = Of all transactions I PREDICTED as fraud,
#               how many actually WERE fraud?
#               (Minimize false alarms)
#
#   Recall    = Of all ACTUAL frauds,
#               how many did I CATCH?
#               (Minimize missed fraud — more important!)
#
#   F1 Score  = Harmonic mean of Precision and Recall.
#               Balances both. Range: 0 (worst) to 1 (best)
# ════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("CLASS DISTRIBUTION ANALYSIS")
print("="*60)

class_counts = df["Class"].value_counts()
class_pct    = df["Class"].value_counts(normalize=True) * 100

print(f"\n  Legitimate (0): {class_counts[0]:>8,}  ({class_pct[0]:.4f}%)")
print(f"  Fraud      (1): {class_counts[1]:>8,}  ({class_pct[1]:.4f}%)")
print(f"\n  Imbalance ratio: {class_counts[0] / class_counts[1]:.0f}:1")
print(f"  → For every 1 fraud, there are {class_counts[0] / class_counts[1]:.0f} legitimate transactions")

# ─── Visualize class imbalance ───────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Class Distribution: Fraud vs Legitimate", fontsize=16, fontweight="bold")

# Bar chart
colors = ["#2ecc71", "#e74c3c"]
axes[0].bar(["Legitimate (0)", "Fraud (1)"], class_counts.values, color=colors, edgecolor="white", linewidth=1.5)
axes[0].set_title("Transaction Count by Class")
axes[0].set_ylabel("Number of Transactions")
for i, v in enumerate(class_counts.values):
    axes[0].text(i, v + 1000, f"{v:,}", ha="center", fontweight="bold")

# Pie chart
axes[1].pie(
    class_counts.values,
    labels=["Legitimate", "Fraud"],
    colors=colors,
    autopct="%1.4f%%",
    startangle=90,
    textprops={"fontsize": 12}
)
axes[1].set_title("Proportion by Class")

plt.tight_layout()
plt.savefig(os.path.join(NOTEBOOK_DIR, "class_distribution.png"), dpi=150, bbox_inches="tight")
plt.show()
print("\n📊 Chart saved as class_distribution.png")


# ════════════════════════════════════════════════════════════════
# CELL 5 — FEATURE ANALYSIS
#
# CONCEPT: Feature Engineering Mindset
# Even though V1–V28 are anonymized (PCA-transformed),
# we can still analyze:
#   1. Their distributions
#   2. How they differ between fraud vs legitimate
#   3. Which ones have the most "signal" (correlation with fraud)
#
# The 'Amount' column is NOT anonymized — we can analyze it directly.
# ════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("FEATURE ANALYSIS")
print("="*60)

# ─── Amount Analysis ─────────────────────────────────────────
legit = df[df["Class"] == 0]["Amount"]
fraud = df[df["Class"] == 1]["Amount"]

print(f"\n  Transaction Amount Statistics:")
print(f"  ┌─────────────────┬──────────────┬──────────────┐")
print(f"  │ Metric          │ Legitimate   │ Fraud        │")
print(f"  ├─────────────────┼──────────────┼──────────────┤")
print(f"  │ Mean            │ ${legit.mean():>10.2f}  │ ${fraud.mean():>10.2f}  │")
print(f"  │ Median          │ ${legit.median():>10.2f}  │ ${fraud.median():>10.2f}  │")
print(f"  │ Std Dev         │ ${legit.std():>10.2f}  │ ${fraud.std():>10.2f}  │")
print(f"  │ Min             │ ${legit.min():>10.2f}  │ ${fraud.min():>10.2f}  │")
print(f"  │ Max             │ ${legit.max():>10.2f}  │ ${fraud.max():>10.2f}  │")
print(f"  └─────────────────┴──────────────┴──────────────┘")

# ─── Amount Distribution Plot ─────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle("Transaction Amount Distribution", fontsize=16, fontweight="bold")

# Full distribution (log scale to handle skew)
axes[0].hist(legit, bins=100, alpha=0.7, color="#2ecc71", label="Legitimate", log=True)
axes[0].hist(fraud, bins=100, alpha=0.7, color="#e74c3c", label="Fraud", log=True)
axes[0].set_title("Amount Distribution (Log Scale)")
axes[0].set_xlabel("Amount ($)")
axes[0].set_ylabel("Count (log scale)")
axes[0].legend()

# Zoomed in: fraud amounts (since most are small)
axes[1].hist(fraud, bins=50, color="#e74c3c", alpha=0.8, edgecolor="white")
axes[1].set_title("Fraud Transaction Amounts (Zoomed)")
axes[1].set_xlabel("Amount ($)")
axes[1].set_ylabel("Count")
axes[1].axvline(fraud.median(), color="yellow", linestyle="--", linewidth=2, label=f"Median: ${fraud.median():.2f}")
axes[1].legend()

plt.tight_layout()
plt.savefig(os.path.join(NOTEBOOK_DIR, "amount_distribution.png"), dpi=150, bbox_inches="tight")
plt.show()
print("📊 Chart saved as amount_distribution.png")


# ════════════════════════════════════════════════════════════════
# CELL 6 — CORRELATION WITH FRAUD (FEATURE IMPORTANCE PREVIEW)
#
# CONCEPT: Correlation
# We want to know which features (V1–V28, Amount, Time)
# are most correlated with the Class column.
# Correlation ranges from -1 to +1:
#   +1 → as feature goes up, fraud probability goes up
#   -1 → as feature goes down, fraud probability goes up
#    0 → no linear relationship
#
# This helps us understand which PCA components the bank
# used to encode fraud-related behaviour.
# ════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("CORRELATION WITH FRAUD (TOP 10 FEATURES)")
print("="*60)

# Compute correlation of all features with the Class column
correlations = df.corr()["Class"].drop("Class").sort_values(key=abs, ascending=False)

print("\n  Top 10 most correlated features with fraud:")
print(f"  {'Feature':<10} {'Correlation':>12}  {'Direction'}")
print(f"  {'-'*10} {'-'*12}  {'-'*15}")
for feat, corr in correlations.head(10).items():
    direction = "↑ Higher = more fraud" if corr > 0 else "↓ Lower = more fraud"
    print(f"  {feat:<10} {corr:>12.4f}  {direction}")

# ─── Heatmap of top features ──────────────────────────────────
top_features = correlations.head(15).index.tolist() + ["Class"]
plt.figure(figsize=(14, 10))
sns.heatmap(
    df[top_features].corr(),
    annot=True,
    fmt=".2f",
    cmap="coolwarm",
    center=0,
    linewidths=0.5,
    annot_kws={"size": 8}
)
plt.title("Correlation Heatmap — Top 15 Fraud-Correlated Features", fontsize=14, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(NOTEBOOK_DIR, "correlation_heatmap.png"), dpi=150, bbox_inches="tight")
plt.show()
print("📊 Chart saved as correlation_heatmap.png")


# ════════════════════════════════════════════════════════════════
# CELL 7 — TIME ANALYSIS
#
# CONCEPT: Temporal Patterns in Fraud
# The 'Time' column is seconds since the first transaction.
# The dataset spans ~48 hours (2 days).
# Fraudsters may operate at specific times of day.
# We'll convert Time to hours and look for patterns.
# ════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("TEMPORAL ANALYSIS")
print("="*60)

# Convert seconds to hours (0–48 hours)
df["Hour"] = (df["Time"] / 3600).astype(int)

fig, axes = plt.subplots(2, 1, figsize=(14, 10))
fig.suptitle("Transaction Volume by Hour", fontsize=16, fontweight="bold")

# Legitimate transactions by hour
legit_by_hour = df[df["Class"] == 0].groupby("Hour").size()
fraud_by_hour = df[df["Class"] == 1].groupby("Hour").size()

axes[0].fill_between(legit_by_hour.index, legit_by_hour.values, alpha=0.7, color="#2ecc71", label="Legitimate")
axes[0].set_title("Legitimate Transactions by Hour")
axes[0].set_ylabel("Number of Transactions")
axes[0].set_xlabel("Hour (0 = start of dataset, spans 48 hours)")
axes[0].legend()

axes[1].bar(fraud_by_hour.index, fraud_by_hour.values, color="#e74c3c", alpha=0.8, label="Fraud")
axes[1].set_title("Fraud Transactions by Hour")
axes[1].set_ylabel("Number of Transactions")
axes[1].set_xlabel("Hour (0 = start of dataset, spans 48 hours)")
axes[1].legend()

plt.tight_layout()
plt.savefig(os.path.join(NOTEBOOK_DIR, "temporal_analysis.png"), dpi=150, bbox_inches="tight")
plt.show()
print("📊 Chart saved as temporal_analysis.png")

# Remove helper column
df.drop(columns=["Hour"], inplace=True)


# ════════════════════════════════════════════════════════════════
# CELL 8 — V-FEATURE DISTRIBUTION (FRAUD VS LEGIT)
#
# CONCEPT: Box Plots for Distribution Comparison
# Even though V1–V28 are anonymized PCA components,
# they have different distributions for fraud vs legitimate.
# Box plots show:
#   - Median (middle line)
#   - IQR = middle 50% of data (the box)
#   - Outliers (dots beyond whiskers)
#
# If the fraud box is far from the legitimate box for a feature,
# that feature is highly useful for fraud detection.
# ════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("V-FEATURE DISTRIBUTIONS (FRAUD vs LEGITIMATE)")
print("="*60)

# Top 6 most correlated V features
top_v_features = [f for f in correlations.head(6).index if f.startswith("V")][:6]

fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.suptitle("Top V-Features: Fraud vs Legitimate Distribution", fontsize=16, fontweight="bold")
axes = axes.flatten()

for i, feature in enumerate(top_v_features):
    data = [
        df[df["Class"] == 0][feature].values,
        df[df["Class"] == 1][feature].values
    ]
    bp = axes[i].boxplot(data, labels=["Legitimate", "Fraud"],
                         patch_artist=True, notch=True)
    bp["boxes"][0].set_facecolor("#2ecc71")
    bp["boxes"][1].set_facecolor("#e74c3c")
    axes[i].set_title(f"{feature} (corr={correlations[feature]:.3f})")
    axes[i].set_ylabel("Value")

plt.tight_layout()
plt.savefig(os.path.join(NOTEBOOK_DIR, "feature_distributions.png"), dpi=150, bbox_inches="tight")
plt.show()
print("📊 Chart saved as feature_distributions.png")


# ════════════════════════════════════════════════════════════════
# CELL 9 — DATASET SUMMARY REPORT
#
# Professional habit: always end your EDA with a written summary
# of what you found. This becomes part of your project docs.
# ════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("📋 EDA SUMMARY REPORT")
print("="*60)
print(f"""
Dataset Overview:
  • Source       : Kaggle — ULB Credit Card Fraud Dataset
  • Total rows   : {df.shape[0]:,}
  • Total columns: {df.shape[1]}
  • Missing data : None
  • Time span    : ~48 hours of transactions

Class Distribution:
  • Legitimate   : {class_counts[0]:,} ({class_pct[0]:.4f}%)
  • Fraud        : {class_counts[1]:,} ({class_pct[1]:.4f}%)
  • Imbalance    : {class_counts[0] / class_counts[1]:.0f}:1 ratio

Key Findings:
  • Top fraud-predictive features: {', '.join(correlations.head(5).index.tolist())}
  • Fraud transactions tend to have smaller amounts (median ~${fraud.median():.2f})
  • Legitimate transactions have a much wider amount range
  • Temporal patterns visible — fraud clusters in certain hours

What We Need to Fix Before Training:
  1. ⚠️  Class imbalance (will use SMOTE in Day 2)
  2. ⚠️  Amount needs scaling (values range 0–25,000)
  3. ⚠️  Time feature needs normalization
  4. ✅  No missing values — no imputation needed
  5. ✅  No categorical features — no encoding needed

Next Steps (Day 2):
  → Apply StandardScaler to Amount and Time
  → Split into train/test (stratified to preserve fraud ratio)
  → Apply SMOTE to oversample fraud in training set only
  → Train XGBoost model
  → Evaluate with Precision, Recall, F1, Confusion Matrix
  → Add SHAP explanations
  → Save model with joblib
""")

print("✅ Day 1 EDA Complete! All charts saved to notebooks/ folder.")
