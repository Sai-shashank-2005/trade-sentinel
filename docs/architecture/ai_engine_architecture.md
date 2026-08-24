# 🧠 KubeHeals AI Engine Architecture Specification

## 1. Executive Summary
The KubeHeals Intelligence Layer employs a **Decoupled Training / Embedded In-Memory Inference** architecture:
* **Training Plane (Offline):** Python-based training pipeline leveraging `scikit-learn` and `xgboost` to train, validate, and export ensemble models.
* **Inference Plane (Online):** Embedded inside the native Go runtime engine. Zero HTTP/gRPC endpoints, zero network hops, sub-millisecond evaluation directly in memory.

---

## 2. End-to-End Pipeline Architecture

```
                                  OFFLINE TRAINING PLANE (Python)
 +-----------------------------------------------------------------------------------------+
 |                                                                                         |
 |   telemetry/dataset/ ──> Feature Validator ──> Train Ensemble Models ──> Export Models  |
 |   (CSV / AQX Data)        (Schema/Range)       - Isolation Forest         (ONNX / JSON) |
 |                                                - Random Forest                          |
 |                                                - XGBoost                                |
 +---------------------------------------------------------┬-------------------------------+
                                                           │ (Model Artifacts)
                                                           ▼
                                  ONLINE INFERENCE RUNTIME (100% Go)
 +-----------------------------------------------------------------------------------------+
 |  KubeHeals Core Binary (Single Pod Daemon)                                              |
 |                                                                                         |
 |  [ Raw Logs & Metrics ]                                                                 |
 |           │                                                                             |
 |           ▼ (in-memory channel)                                                         |
 |  [ Go AQX Normalizer ]                                                                  |
 |           │                                                                             |
 |           ▼ (in-memory sliding window)                                                  |
 |  [ Go Feature Engine ] (O(N) MapReduce)                                                 |
 |           │                                                                             |
 |           ▼ (in-memory pointer pass)                                                    |
 |  [ Embedded Go ML Inference Engine ]                                                    |
 |       ├── 1. Isolation Forest  ──> Is cluster anomalous? (Zero-Day check)               |
 |       ├── 2. Random Forest     ──> What is the exact root cause? (Classification)       |
 |       └── 3. XGBoost           ──> What exact action is needed? (Remediation Policy)    |
 |           │                                                                             |
 |           ▼ (deterministic decision)                                                    |
 |  [ Go K8s Remediation Operator ]                                                        |
 |           │                                                                             |
 |           ▼ (client-go direct API call)                                                 |
 |  [ Kubernetes Self-Healing Action: Restart / Scale / Rollback ]                         |
 |                                                                                         |
 +-----------------------------------------------------------------------------------------+
```

---

## 3. The 3-Stage Ensemble Model Specification

| Stage | Model | Paradigm | Inputs | Outputs | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage 1** | **Isolation Forest** | Unsupervised | `[ReqRate, LogVolume, ErrorCount, Latency]` | `Score ∈ [-1, 1]` (Anomaly Flag) | Detects unknown/zero-day degradation without prior labels. |
| **Stage 2** | **Random Forest** | Supervised | `[Telemetry Feature Vector]` | `Class ∈ [0..7]` (Root Cause) | Classifies specific failure mode (`cpu_pressure`, `db_latency`, etc.). |
| **Stage 3** | **XGBoost** | Supervised Policy | `[Root Cause, Severity, Replica State]` | `Action ∈ [NO_OP, RESTART, SCALE, ROLLBACK]` | Determines the precise, safe Kubernetes remediation action. |

---

## 4. File Structure Specification

```text
services/
├── ai-engine/                        # OFFLINE: Training & Model Research (Python)
│   ├── config/
│   │   └── model_config.yaml         # Hyperparameters, feature names, contamination rates
│   ├── models/                       # Exported model weights & artifacts (.onnx / .json)
│   │   ├── isolation_forest.json
│   │   ├── random_forest.json
│   │   └── xgboost_remediation.json
│   ├── src/
│   │   ├── validator.py              # Feature schema validation & data integrity
│   │   ├── train_isolation_forest.py # Unsupervised anomaly model trainer
│   │   ├── train_random_forest.py    # Supervised root-cause classifier trainer
│   │   ├── train_xgboost.py          # Supervised remediation policy trainer
│   │   └── export_models.py          # Serializes models for Go in-memory runtime
│   ├── tests/
│   │   ├── test_validation.py
│   │   └── test_training.py
│   └── requirements.txt
│
└── inference-engine/                 # ONLINE: Embedded In-Memory Engine (Go)
    ├── predictor.go                  # In-memory decision tree evaluator
    ├── models_embedded.go            # Model weight loader
    └── predictor_test.go             # Unit & latency benchmarks
```

---

## 5. Production Guarantees
* **Zero Network Exposure:** No REST/gRPC ports opened inside the cluster for inference.
* **Sub-Millisecond Latency:** In-memory pointer evaluation executes in $< 0.1$ ms.
* **Determinism & Safety:** XGBoost actions pass through a Go safety gate before executing against the Kubernetes API.
