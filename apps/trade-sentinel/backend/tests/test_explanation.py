import pandas as pd
from app.services.feature_engineering import engineer_features
from app.services.model import compute_ai_score
from app.services.rule_engine import compute_rule_score
from app.services.scoring import compute_hybrid_risk
from app.services.context_layer import apply_context_adjustment
from app.services.explanation_engine import generate_explanations

df = pd.read_csv("synthetic_trade_data.csv")

df = engineer_features(df)
df = compute_ai_score(df)
df = compute_rule_score(df)
df = compute_hybrid_risk(df)
df = apply_context_adjustment(df)

# Reclassify
risk_levels = []
for risk in df["final_risk"]:
    if risk >= 75:
        risk_levels.append("High")
    elif risk >= 50:
        risk_levels.append("Medium")
    else:
        risk_levels.append("Low")

df["final_risk_level"] = risk_levels

df = generate_explanations(df)

print("\nSample High Risk Explanation:")
print(df[df["final_risk_level"] == "High"]["explanation_text"].head(3))

print("\nSample Medium Risk Explanation:")
print(df[df["final_risk_level"] == "Medium"]["explanation_text"].head(3))

print("\nSample Low Risk Explanation:")
print(df[df["final_risk_level"] == "Low"]["explanation_text"].head(3))
