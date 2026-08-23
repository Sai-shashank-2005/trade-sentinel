import pandas as pd
from app.services.feature_engineering import engineer_features

df = pd.read_csv("synthetic_trade_data.csv")

df = engineer_features(df)

print("Max price z-score:", df["price_zscore"].max())
print("Max volume z-score:", df["volume_zscore"].max())
print(df.head())
