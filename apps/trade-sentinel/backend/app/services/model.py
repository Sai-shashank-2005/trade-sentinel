import numpy as np
from sklearn.ensemble import IsolationForest

def compute_ai_score(df):

    # Select only numerical anomaly-related features
    features = df[[
        "price_zscore",
        "volume_zscore",
        "route_frequency",
        "counterparty_frequency"
    ]]

    # Initialize model
    model = IsolationForest(
        n_estimators=100,
        contamination="auto",
        random_state=42
    )

    # Train model
    model.fit(features)

    # Isolation Forest gives anomaly score (lower = more abnormal)
    raw_scores = -model.decision_function(features)

    # Convert to percentile rank (0–100 scale)
    ranks = raw_scores.argsort().argsort()
    ai_score = 100 * ranks / len(ranks)

    df["ai_score"] = ai_score

    return df
