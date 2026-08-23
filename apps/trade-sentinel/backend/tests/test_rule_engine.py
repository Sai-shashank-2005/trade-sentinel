import pandas as pd
from app.services.feature_engineering import engineer_features
from app.services.rule_engine import compute_rule_score

df = pd.read_csv("synthetic_trade_data.csv")

df = engineer_features(df)
df = compute_rule_score(df)

print("Max Rule Score:", df["rule_score"].max())

print("\nTop 10 rule-based risks:")
print(
    df.sort_values("rule_score", ascending=False)[
        ["price_zscore", "volume_zscore", "route_frequency", "rule_score"]
    ].head(10)
)
