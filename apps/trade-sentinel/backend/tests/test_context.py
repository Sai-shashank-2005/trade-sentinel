import pandas as pd
from app.services.feature_engineering import engineer_features
from app.services.model import compute_ai_score
from app.services.rule_engine import compute_rule_score
from app.services.scoring import compute_hybrid_risk
from app.services.context_layer import apply_context_adjustment

df = pd.read_csv("synthetic_trade_data.csv")

df = engineer_features(df)
df = compute_ai_score(df)
df = compute_rule_score(df)
df = compute_hybrid_risk(df)
df = apply_context_adjustment(df)

print("Max Raw Risk:", df["raw_risk"].max())
print("Max Final Risk:", df["final_risk"].max())

print("\nContext Adjustment Summary:")
print(df["context_adjustment"].describe())

print("\nTop 10 After Context:")
print(
    df.sort_values("final_risk", ascending=False)[
        ["raw_risk", "final_risk", "context_adjustment"]
    ].head(10)
)
# Reclassify based on final risk
risk_levels = []

for risk in df["final_risk"]:
    if risk >= 75:
        risk_levels.append("High")
    elif risk >= 50:
        risk_levels.append("Medium")
    else:
        risk_levels.append("Low")

df["final_risk_level"] = risk_levels

print("\nFinal Risk Distribution:")
print(df["final_risk_level"].value_counts())

print("\nFinal Breakdown:")
print(df.groupby(["anomaly_flag", "final_risk_level"]).size())
