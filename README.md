
---

# 🚀 Trade Sentinel AI v2

### Hybrid Context-Aware Trade Risk Intelligence Platform

---

## 📌 Overview

**Trade Sentinel AI v2** is a full-stack hybrid fraud detection system designed to detect anomalies in international trade transactions while reducing false positives through contextual calibration.

This platform combines:

* Isolation Forest (AI anomaly detection)
* Statistical rule engine (Z-score based scoring)
* Hybrid weighted risk model
* Context-aware alert suppression
* Confidence scoring
* Structured explainability
* Investigation dashboard (React + Tailwind)

The system preserves high-risk alerts while intelligently reducing noise in low and medium-risk categories.

---

# 🧠 Problem Statement

Trade-based fraud (over/under invoicing, abnormal routing, suspicious counterparties) is difficult to detect using static rules alone.

Challenges include:

* High false positive rates
* Alert fatigue
* Lack of explainability
* Operational inefficiency

Trade Sentinel AI v2 addresses these through a layered hybrid detection architecture.

---

# 🏗️ System Architecture

```
Synthetic Trade Data (50,000 records, 6% anomalies)
        ↓
Feature Engineering (Z-score, frequency metrics)
        ↓
Isolation Forest → AI Score (0–100 percentile)
        ↓
Rule Engine → Rule Score (0–100)
        ↓
Hybrid Risk Engine
Raw Risk = 0.6 * AI + 0.4 * Rule
        ↓
Context Adjustment Layer
(Max 20% suppression for stable behavior)
        ↓
Final Risk + Confidence Score
        ↓
Explainability Engine
        ↓
React Investigation Dashboard
```

---

# 🔍 Core Detection Components

## 1️⃣ AI Model

* Isolation Forest (unsupervised anomaly detection)
* Features:

  * `price_zscore`
  * `volume_zscore`
  * `route_frequency`
  * `counterparty_frequency`
* Converted to percentile-based AI score (0–100)

---

## 2️⃣ Rule Engine

| Condition           | Score |
| ------------------- | ----- |
| Price Z > 5         | +40   |
| Price Z > 3         | +30   |
| Volume Z > 5        | +30   |
| Volume Z > 3        | +20   |
| Rare Route (<1%)    | +20   |
| Rare Exporter (<1%) | +10   |

Rule score capped at 100.

---

## 3️⃣ Hybrid Risk Model

```
raw_risk = 0.6 * ai_score + 0.4 * rule_score
```

Risk Levels:

* **High** ≥ 75
* **Medium** ≥ 50
* **Low** < 50

---

## 4️⃣ Context-Aware Calibration

High-risk alerts are preserved.

Low & medium risks are adjusted downward if:

* Route is historically stable
* Counterparty is historically stable

Maximum suppression capped at 20%.

This reduces false positives without masking serious fraud.

---

# 📊 Dataset & Results

* Total Transactions: **50,000**
* Synthetic Anomalies Injected: **6% (3,000 records)**

### Output Risk Distribution

| Risk Level | Count  | Percentage |
| ---------- | ------ | ---------- |
| High       | 230    | 0.46%      |
| Medium     | 3,173  | 6.3%       |
| Low        | 46,597 | 93.2%      |

Total flagged (High + Medium): **3,403**

Detection proportion aligns closely with injected anomaly rate.

---

# 🖥️ System Interface Preview

## 📊 Dashboard

![Dashboard](./assets/dashboard.png)

## 📋 Transactions Page

![Transactions](./assets/transactions.png)

## 🔎 Investigation Detail View

![Transaction Detail](./assets/detail.png)

---

# ⚙️ Tech Stack

## Backend

* FastAPI
* SQLAlchemy
* Pandas
* NumPy
* Scikit-learn
* SQLite (local)
* PostgreSQL (production-ready)

## Frontend

* React
* Tailwind CSS
* Vite
* Recharts
* React Router

## Deployment

* Vercel (Frontend)
* Railway / PostgreSQL compatible backend

---

# 📂 Project Structure

```
trade-sentinel-ai-v2/
│
├── backend/
├── frontend/
├── assets/
├── README.md
└── LICENSE
```

---

# 🚀 Running Locally

---

# 🔹 Backend Setup (FastAPI)

### 1️⃣ Navigate to backend folder

```
cd backend
```

### 2️⃣ Create virtual environment

```
python -m venv venv
```

### 3️⃣ Activate virtual environment

Linux / Mac:

```
source venv/bin/activate
```

Windows:

```
venv\Scripts\activate
```

### 4️⃣ Install dependencies

```
pip install -r requirements.txt
```

### 5️⃣ Run backend server

```
uvicorn app.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger Docs:

```
http://127.0.0.1:8000/docs
```

---

# 🔹 Frontend Setup (React + Vite)

Open a new terminal.

### 1️⃣ Navigate to frontend folder

```
cd frontend
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Run development server

```
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔗 Connecting Frontend to Backend

Ensure `frontend/src/services/api.js` contains:

```
const BASE_URL = "http://127.0.0.1:8000";
```

If backend is deployed, replace with production API URL.

---

# 🔐 Environment Variables

Backend supports:

```
DATABASE_URL=postgresql://user:password@host/dbname
```

If not set, defaults to SQLite for local development.

---

# 📜 License

This project is licensed under the MIT License.
See the LICENSE file for details.

---

# 👨‍💻 Author

Sai Shashank
Cybersecurity & AI Enthusiast
Building intelligent, real-world AI systems.

---