<<<<<<< HEAD
# FraudShield — AI-Powered Credit Card Fraud Detection Platform

FraudShield is a full-stack, machine-learning-driven web application designed to detect fraudulent credit card transactions in real-time. It uses an advanced XGBoost model trained on highly imbalanced data using SMOTE, combined with SHAP values for model explainability.

## 🌟 Features
- **Real-time Prediction**: Instantly classify a transaction as fraudulent or legitimate with a confidence score.
- **Bulk Upload**: Drag and drop CSV files for batch prediction on hundreds of transactions.
- **Explainable AI (XAI)**: Visual SHAP charts explaining exactly *why* the model made a specific prediction (showing which features pushed the decision toward fraud).
- **Beautiful Dashboard**: Glassmorphism dark-theme UI with Recharts analytics (fraud rates over time, etc.).
- **Admin Panel**: Manage users and view all transactions across the system.
- **Secure**: JWT-based authentication and Bcrypt password hashing.

## 🏗️ Architecture & Tech Stack

### 1. ML Service (Python / FastAPI)
- **Model**: XGBoost Classifier
- **Techniques**: SMOTE (Synthetic Minority Oversampling), StandardScaler
- **Explainability**: SHAP (TreeExplainer)
- **API**: FastAPI, Uvicorn, Pandas, scikit-learn

### 2. Backend (Node.js / Express)
- **Framework**: Express.js
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: JSON Web Tokens (JWT)
- **Features**: Multer for CSV uploads, advanced aggregations for dashboard stats

### 3. Frontend (React / Vite)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v3 (Custom Dark Theme, Glassmorphism)
- **Charts**: Recharts (Area, Pie, RadialBar, HorizontalBar)
- **Routing**: React Router DOM v6

### 4. Infrastructure
- **Containerization**: Docker & Docker Compose (3 separate multi-stage Dockerfiles)
- **CI/CD**: GitHub Actions
- **Deployment**: Railway

## 🚀 How to Run Locally

### Prerequisites
- Node.js v20+
- Python 3.10+
- Docker & Docker Compose (optional)
- MongoDB Atlas cluster URL

### Using Docker (Recommended)
1. Clone the repo
2. Rename `.env.example` or update `backend/.env` with your `MONGODB_URI` and `JWT_SECRET`.
3. Run `docker-compose up --build`
4. Visit `http://localhost:3000`

### Manual Setup (Without Docker)

**1. ML Service (Port 8000)**
```bash
cd ml-service
python -m venv venv
# Activate venv: .\venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**2. Node.js Backend (Port 5000)**
```bash
cd backend
npm install
# Ensure .env is populated
npm run dev
```

**3. React Frontend (Port 3000)**
```bash
cd frontend
npm install
npm run dev
```

## 📸 Screenshots
*(Add screenshots of your Dashboard, SHAP charts, and Prediction Form here!)*

## 🧠 Dataset Details
Trained on the ULB Credit Card Fraud dataset from Kaggle, containing 284,807 European transactions. Due to massive class imbalance (0.17% fraud), SMOTE was used to synthesize minority samples during training.
=======
# fraud-detection-platform
Enterprise-grade AI-powered Credit Card Fraud Detection Platform built with React, Node.js, FastAPI, MongoDB, XGBoost, and SHAP Explainable AI. Features real-time fraud detection, risk scoring, analytics dashboard, OTP authentication, bulk transaction analysis, and admin command center.
>>>>>>> 918d29b3dcac37a1a407e460289fe788280545de
