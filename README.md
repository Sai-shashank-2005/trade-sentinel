# 🩺 KubeHeals Telemetry Lab

This repository serves as the official telemetry generation lab for the **KubeHeals** project. It utilizes the Trade Sentinel application as a realistic Kubernetes workload to generate, capture, and extract ground-truth observability data (logs, metrics, and Kubernetes events).

This data will be consumed by the future KubeHeals Feature Engineering pipeline to train ML models (Random Forest / XGBoost) for automated anomaly detection and self-healing.

---

## 📂 Repository Architecture

The repository is strictly partitioned to separate application code, infrastructure, and telemetry extraction:

*   **`apps/`**: Contains the workload generators.
    *   `trade-sentinel/backend/` - FastAPI anomaly detection engine.
    *   `trade-sentinel/frontend/` - React dashboard.
    *   `load-generator/` - Python script for simulating traffic and failure scenarios.
*   **`infrastructure/`**: Kubernetes deployment code.
    *   `kubernetes/` - Deployments, StatefulSets, Services.
    *   `observability/` - Prometheus ServiceMonitors and Loki configurations.
*   **`telemetry/`**: The extracted datasets.
    *   `scenarios/` - Documentation of failure states (CPU pressure, DB failure, etc.).
    *   `samples/` - The extracted raw JSON data from Prometheus and Loki. **(Used for ML training)**
*   **`services/`**: The future home of the KubeHeals Go backend.
    *   `feature-engine/` - Boundary established for the future Go-based feature extraction pipeline.

---

## 🛠️ Infrastructure Stack

*   **Platform:** Kubernetes (Minikube)
*   **Observability:** Prometheus (Metrics), Loki (Logs), kube-state-metrics (Events)
*   **Workload:** FastAPI, React, PostgreSQL

## 🚀 Usage

### 1. Start the Cluster
```bash
minikube start
```

### 2. Deploy Infrastructure
```bash
kubectl apply -f infrastructure/kubernetes/trade-sentinel/
kubectl apply -f infrastructure/observability/prometheus/
```

### 3. Generate Telemetry Samples
To simulate failures (like a sudden pod restart or CPU pressure) and extract the telemetry to JSON files, run:
```bash
./run_all_scenarios.sh
```
*The resulting JSON datasets will be saved to `telemetry/samples/`.*
