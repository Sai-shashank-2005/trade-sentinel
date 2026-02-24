# 🚀 Trade Sentinel AI

## Context-Aware Hybrid Trade Risk Intelligence System

Trade Sentinel AI is a full-stack hybrid anomaly detection platform designed to detect suspicious international trade transactions while significantly reducing false positives through behavioral calibration.

Developed for: **TNI26183 – Difficulty Detecting Fraud and Anomalies in Trade Transactions**

---

# 📌 Overview

Trade-based fraud such as:

- Over-invoicing  
- Under-invoicing  
- Abnormal routing  
- Suspicious counterparties  

is difficult to detect using static rule-based systems alone.

Traditional monitoring systems suffer from:

- High false positive rates  
- Alert fatigue  
- Lack of explainability  
- Operational inefficiency  

Trade Sentinel AI introduces a layered hybrid detection architecture combining statistical modeling, machine learning, deterministic rules, and bounded contextual calibration.

---

# 🧠 System Architecture

```
Trade Data
    ↓
Feature Engineering
    ↓
Isolation Forest → AI Score (0–100)
    ↓
Rule Engine → Rule Score (0–100)
    ↓
Hybrid Risk Model
    ↓
Context-Aware Calibration
    ↓
Final Risk + Confidence
    ↓
Explainable Investigation Dashboard
```

---

# 🔍 Core Detection Components

## 1️⃣ Feature Engineering

Category-aware statistical normalization:

- Price Z-score (grouped by HS code)
- Volume Z-score (grouped by HS code)
- Route frequency
- Counterparty frequency

This ensures anomaly detection is product-category specific and behavior-aware.

---

## 2️⃣ AI Model — Isolation Forest

- Unsupervised anomaly detection
- Multi-dimensional anomaly detection
- Percentile-based anomaly scoring (0–100)

Isolation Forest isolates anomalies through random feature partitioning.  
Anomalies require fewer splits, resulting in higher anomaly scores.

---

## 3️⃣ Rule Engine

Deterministic compliance logic:

| Condition              | Score |
|------------------------|-------|
| Price Z > 5            | +40   |
| Price Z > 3            | +30   |
| Volume Z > 5           | +30   |
| Volume Z > 3           | +20   |
| Rare Route (<1%)       | +20   |
| Rare Exporter (<1%)    | +10   |

Rule score capped at 100.

---

## 4️⃣ Hybrid Risk Model

```
raw_risk = 0.6 * ai_score + 0.4 * rule_score
```

Risk Classification:
- **High** ≥ 75
- **Medium** ≥ 50
- **Low** < 50

Hybridization balances statistical anomaly detection with deterministic regulatory logic.

---

## 5️⃣ Context-Aware Calibration (Core Innovation)

The context layer performs bounded behavioral risk adjustment.

Rules:

- High-risk alerts are never suppressed.
- Medium and low risks are reduced if:
  - Route behavior is stable.
  - Counterparty behavior is stable.
- Maximum suppression capped at **20%**.

```
FinalRisk = RawRisk × ContextFactor
ContextFactor ∈ [0.8, 1.0]
```

This significantly reduces false positives while preserving high-risk fraud detection.

---

# 📊 Experimental Validation

## Dataset
- 50,000 synthetic trade transactions
- 6% injected anomalies (3,000 records)

## Results (Medium + High flagged as anomaly)

| Model Version       | Precision | Recall | False Positives |
|---------------------|-----------|--------|----------------|
| Hybrid Only         | ~36%      | 100%   | 5,333          |
| Hybrid + Context    | ~88%      | ~99%   | 418            |

False positives reduced by over **90%** after context calibration.

---

## 🔬 Scalability Test

Tested on **100,000 transactions**:

- Precision: ~83–88%
- Recall: ~99%
- False Positive Rate: ~1%

Performance remains stable as dataset size increases.

---

# 🖥️ Investigation Dashboard

### 📊 Risk Dashboard

![Dashboard](assets/dashboard.png)

---

### 📋 Transactions View

![Transactions](assets/transactions.png)

---

### 🔎 Investigation Detail View

![Transaction Detail](assets/detail.png)

---

# ⚙️ Technology Stack

## Backend

- FastAPI
- SQLAlchemy
- Pandas
- NumPy
- Scikit-learn
- PostgreSQL (Production)
- SQLite (Local)

## Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- React Router

---

# 🏗️ Project Structure

```
trade-sentinel-ai/
│
├── backend/
│   ├── app/
│   └── tests/
│
├── frontend/
├── assets/
├── README.md
└── LICENSE
```

---

# 🚀 Local Setup

## 🔹 Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API:
```
http://127.0.0.1:8000
```

Swagger Docs:
```
http://127.0.0.1:8000/docs
```

---

## 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:
```
http://localhost:5173
```

---

# 🔐 Environment Variables

```
DATABASE_URL=postgresql://user:password@host/dbname
```

Defaults to SQLite if not provided.

---

# 📈 Key Strengths

- Hybrid statistical + ML detection
- Context-aware false positive reduction
- Bounded suppression for safety
- High recall (~99%)
- Explainable investigation workflow
- Scalable architecture

---

# 📜 License

MIT License

---

# 👨‍💻 Author

Sai Shashank  
Cybersecurity × AI  
Building intelligent, real-world AI systems.
