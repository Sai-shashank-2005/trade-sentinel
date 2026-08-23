import pandas as pd
from app.services.feature_engineering import engineer_features
from app.services.model import compute_ai_score

df = pd.read_csv("synthetic_trade_data.csv")

df = engineer_features(df)
df = compute_ai_score(df)

print("Max AI score:", df["ai_score"].max())
print("Min AI score:", df["ai_score"].min())

print("\nTop 10 highest AI scores:")
print(
    df.sort_values("ai_score", ascending=False)[
        ["price_zscore", "volume_zscore", "route_frequency", "ai_score"]
    ].head(10)
)
