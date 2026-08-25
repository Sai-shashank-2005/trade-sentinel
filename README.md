# 🌐 Trade Sentinel AI v3.0

[![Role](https://img.shields.io/badge/Role-SOC%20Analyst-blue.svg)]()
[![Framework](https://img.shields.io/badge/Architecture-Hybrid%20AI%20%2B%20KubeHeals-purple.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Go%20%2B%20Scikit--Learn-green.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue.svg)]()

> **Context-Aware Hybrid Trade Risk Intelligence Platform**
> Trade Sentinel AI is a hybrid anomaly detection system designed to identify suspicious transaction behavior using techniques aligned with modern threat detection systems. Legacy systems suffer from high false positives, static detection logic, and limited explainability. This project introduces a hybrid intelligence architecture that improves detection accuracy while maintaining operational efficiency.

---

## 🛡️ Cybersecurity & SOC Relevance

This system applies core detection engineering principles directly mirrored from Security Operations Center (SOC) environments:

* **Behavioral Anomaly Detection:** Functions similarly to UEBA (User and Entity Behavior Analytics) systems.
* **Signal Correlation:** Fuses AI outputs with a strict rule engine, mimicking SIEM detection pipelines.
* **Context-Aware Calibration:** Reduces false positives contextually, directly addressing alert fatigue challenges.
* **Explainable Risk Scoring:** Provides transparent metric breakdowns to support rapid investigation workflows.

---

## 📈 Performance & Impact

* **False Positive Reduction:** Reduced from **5,333 → 418 (~92% reduction)**.
* **Recall Rate:** Maintained **~99% recall** for critical anomalies.
* **Precision Improvement:** Increased from **~33% → 88%** after implementing context-aware calibration.
* **Scale:** Validated on **100,000+** transactions.

> **💡 Key Insight:** Initial hybrid modeling prioritized high recall, which caused precision to drop significantly (~33%). A context-aware calibration layer was engineered to reduce false positives without suppressing high-risk alerts, recovering precision while maintaining recall.

---

## ⚙️ Core Intelligence Pipeline

### 1. Feature Engineering
Ensures context-aware and product-specific anomaly detection:
* Price Z-score grouped by HS code
* Volume Z-score grouped by HS code
* Trade route frequency & Counterparty frequency

### 2. AI Model (Isolation Forest)
* Unsupervised anomaly detection requiring no labeled dataset.
* Highly efficient for parsing high-dimensional behavioral data.

### 3. Rule Engine (Compliance Signals)
Provides deterministic scoring based on hard thresholds. Score is capped at 100.

| Condition | Score Weight |
| :--- | :--- |
| **Price Z > 5** | +40 |
| **Price Z > 3** | +30 |
| **Volume Z > 5** | +30 |
| **Volume Z > 3** | +20 |
| **Rare Route** | +20 |
| **Rare Exporter** | +10 |

### 4. Hybrid Risk Scoring
Combines statistical deviations with deterministic rules:
`raw_risk = 0.6 * ai_score + 0.4 * rule_score`

| Risk Level | Threshold |
| :--- | :--- |
| 🔴 **High** | ≥ 75 |
| 🟡 **Medium** | ≥ 50 |
| 🟢 **Low** | < 50 |

### 5. Context Calibration
* High-risk alerts (≥ 75) are **never** suppressed.
* Medium/Low risks are dynamically adjusted based on behavioral stability (e.g., stable routes, established exporters).
* Maximum suppression is capped at 20% to prevent blind spots.

---

## 🖥️ Platform Interface & Features

| Feature | Description | Screenshot |
| :--- | :--- | :--- |
| **Risk Intelligence Dashboard** | Transaction metrics, risk distribution, and global risk index feeds. | ![Dashboard](docs/architecture/assets/dashboard.png) |
| **Live Trade Intelligence Monitor** | Manual transaction injection with real-time hybrid risk evaluation. | ![Live Monitor](docs/architecture/assets/live-monitor.png) |
| **Transaction Console** | Searchable intelligence database with risk classification filtering. | ![Transactions](docs/architecture/assets/transactions.png) |
| **Investigation Engine** | Explainable summaries showing AI contributions and rule triggers. | ![Investigation](docs/architecture/assets/investigation.png) |

---

## 🏗️ Cloud-Native Architecture & KubeHeals (v3.0)

The repository is built for enterprise-scale deployments, cleanly separating application source code from Kubernetes infrastructure. **v3.0 introduces KubeHeals**, an underlying infrastructure auto-remediation layer powered by ML.

*   **`apps/`**: The core Trade Sentinel application (FastAPI & React) and load generators.
*   **`infrastructure/`**: Kubernetes deployments, StatefulSets, and Prometheus/Loki observability configurations.
*   **`services/`**: High-performance Go microservices (`aqx-normalizer`, `feature-engine`) and Python AI engines driving KubeHeals automated remediation.
*   **`telemetry/`**: Structured JSON metrics, generated datasets, and logs captured from failure simulations for KubeHeals model training.
*   **`test-datasets/`**: Readily accessible CSV datasets and symlinks used for ML validation and root-level application testing.

---

## 🛠️ Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Backend API & ML** | `FastAPI`, `Python`, `Scikit-learn`, `Pandas`, `NumPy` |
| **Database** | `SQLAlchemy`, `SQLite` / `PostgreSQL` |
| **Frontend UI** | `React`, `Vite`, `Tailwind CSS`, `Recharts`, `Framer Motion` |
| **Infrastructure** | `Kubernetes`, `Docker`, `Helm`, `Prometheus`, `Loki` |

---

## 🚀 Setup & Installation

### Option A: Local Development

**1. Backend Setup**
```bash
cd apps/trade-sentinel/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in the backend directory:
```env
DATABASE_URL=sqlite:///./trade.db
```
Start the API:
```bash
uvicorn app.main:app --reload
```
*API running at [http://127.0.0.1:8000](http://127.0.0.1:8000) | Docs at `/docs`*

**2. Frontend Setup**
```bash
cd apps/trade-sentinel/frontend
npm install
npm run dev
```
*Frontend running at [http://localhost:5174](http://localhost:5174)*

### Option B: Kubernetes Deployment (Production / Enterprise)

This project is orchestrated using a unified `Makefile` for one-click environment bootstrapping.

**1. One-Click Bootstrap**
Automates tool validation, Go module downloads, and Python AI environment setup:
```bash
make setup
```

**2. Smart Instant-Up (Deploy Cluster & Intelligence Layer)**
Automatically boots the Minikube cluster, enables NGINX Ingress, deploys Trade Sentinel AI, and waits for 100% microservice readiness.
```bash
make up
```
*The command will output the direct IP address where Trade Sentinel AI is running. Click the link to access the platform!*

**3. Tear Down / Stop the Cluster**
When you are finished testing, cleanly shut down the entire environment:
```bash
make down
```
*(When you want to run it again, just run `make up` and it will instantly resume!)*

---

## 👤 Author

**Sai Shashank P**
*SOC Analyst* | *System Engineer*

---
*MIT License. Copyright (c) 2026 Sai Shashank.*
