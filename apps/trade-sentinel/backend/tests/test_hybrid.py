import pandas as pd
from app.services.feature_engineering import engineer_features
from app.services.model import compute_ai_score
from app.services.rule_engine import compute_rule_score
from app.services.scoring import compute_hybrid_risk

df = pd.read_csv("synthetic_trade_data.csv")

df = engineer_features(df)
df = compute_ai_score(df)
df = compute_rule_score(df)
df = compute_hybrid_risk(df)

print("Max Raw Risk:", df["raw_risk"].max())
print("Min Raw Risk:", df["raw_risk"].min())

print("\nRisk Level Distribution:")
print(df["risk_level"].value_counts())

print("\nTop 10 Highest Risks:")
print(
    df.sort_values("raw_risk", ascending=False)[
        ["ai_score", "rule_score", "raw_risk", "risk_level"]
    ].head(10)
)
print("\nAnomaly detection breakdown:")
print(
    df.groupby(["anomaly_flag", "risk_level"]).size()
)
