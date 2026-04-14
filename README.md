# Trade Sentinel AI v2.5

## Context-Aware Hybrid Trade Risk Intelligence Platform

Trade Sentinel AI is a full-stack anomaly detection platform designed to identify suspicious international trade transactions while reducing false positives through contextual behavioral calibration.

The platform combines machine learning, statistical anomaly detection, rule-based intelligence, and context-aware calibration to generate explainable trade risk assessments suitable for real-world compliance systems.

## Overview

Trade-based fraud such as over-invoicing, under-invoicing, abnormal routing, and suspicious counterparties is difficult to detect using traditional rule-based systems.

Legacy systems typically suffer from high false positives, static detection logic, and limited explainability. This project introduces a hybrid intelligence architecture that improves detection accuracy while maintaining operational efficiency.

## Key Features (v2.5)

### Live Trade Intelligence Monitor

* Manual trade transaction injection
* Real-time hybrid risk evaluation
* Immediate anomaly detection
* Investigation workflow initiation

### Risk Intelligence Dashboard

* Transaction metrics and high-risk alerts
* Risk distribution and concentration analysis
* Global risk index and activity feed

### Investigation Engine

* Hybrid risk score (AI + rules + context)
* Statistical anomaly signals
* Model contribution breakdown
* Rule trigger indicators
* Explainable investigation summary

### Persistent Storage

* Historical transaction records
* Stored anomaly analysis
* Searchable intelligence database

### Transaction Console

* Transaction search and filtering
* Risk classification inspection
* Investigation launching interface

## Performance Metrics

* Reduced false positives from **5,333 → 418 (~92% reduction)**
* Maintained **~99% recall**
* Improved precision from **~33% → 88%** after context-aware calibration
* Validated on **100,000+ transactions**

## Key Insight

Initial hybrid modeling prioritized high recall, which caused precision to drop significantly (~33%).

A context-aware calibration layer was engineered to reduce false positives without suppressing high-risk alerts, recovering precision while maintaining recall.

## Architecture

```
Trade Data
     ↓
Feature Engineering
     ↓
Isolation Forest (AI Score)
     ↓
Rule Engine (Compliance Signals)
     ↓
Hybrid Risk Model
     ↓
Context Calibration
     ↓
Final Risk Score
     ↓
Investigation Interface
```

## Core Components

### Feature Engineering

* Price Z-score grouped by HS code
* Volume Z-score grouped by HS code
* Trade route frequency
* Counterparty frequency

Ensures context-aware and product-specific anomaly detection.

### AI Model (Isolation Forest)

* Unsupervised anomaly detection
* No labeled dataset required
* Efficient for high-dimensional data

### Rule Engine

| Condition     | Score |
| ------------- | ----- |
| Price Z > 5   | +40   |
| Price Z > 3   | +30   |
| Volume Z > 5  | +30   |
| Volume Z > 3  | +20   |
| Rare Route    | +20   |
| Rare Exporter | +10   |

Score capped at 100.

### Hybrid Risk Model

```
raw_risk = 0.6 * ai_score + 0.4 * rule_score
```

| Level  | Score |
| ------ | ----- |
| High   | ≥ 75  |
| Medium | ≥ 50  |
| Low    | < 50  |

### Context Calibration

* High-risk alerts are never suppressed
* Medium/low risk adjusted based on behavioral stability
* Suppression capped at 20%

```
FinalRisk = RawRisk * ContextFactor
ContextFactor ∈ [0.8, 1.0]
```

## Interface

### Risk Intelligence Dashboard

![Dashboard](assets/dashboard.png)

### Transaction Intelligence Console

![Transactions](assets/transactions.png)

### Investigation Detail View

![Investigation](assets/investigation.png)

### Live Trade Intelligence Monitor

![Live Monitor](assets/live-monitor.png)

## Tech Stack

### Backend

FastAPI, SQLAlchemy, Pandas, NumPy, Scikit-learn, SQLite/PostgreSQL

### Frontend

React, Vite, Tailwind CSS, Recharts, React Router

## Project Structure

```
Trade-Sentinel-AI
│
├── trade-risk-backend
├── trade-risk-frontend
├── assets
├── README.md
└── LICENSE
```

## Setup

### Backend

```
cd trade-risk-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file:

```
DATABASE_URL=sqlite:///./trade.db
```

Run backend:

```
uvicorn app.main:app --reload
```

API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Frontend

```
cd trade-risk-frontend
npm install
npm run dev
```

Frontend: [http://localhost:5174](http://localhost:5174)

## Strengths

* Hybrid AI and rule-based detection
* Context-aware false positive reduction
* Real-time monitoring capability
* Explainable investigation workflow
* Persistent intelligence storage
* Scalable modular architecture

---

## License

MIT License

---

## Author

Sai Shashank P |
Cybersecurity Engineer
