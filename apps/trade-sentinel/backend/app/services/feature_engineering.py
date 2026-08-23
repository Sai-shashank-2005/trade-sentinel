import pandas as pd
import numpy as np

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:

    # Price Z-Score grouped by HS code
    df["price_mean"] = df.groupby("hs_code")["unit_price"].transform("mean")
    df["price_std"] = df.groupby("hs_code")["unit_price"].transform("std")

    df["price_zscore"] = (
        (df["unit_price"] - df["price_mean"]) / df["price_std"]
    ).fillna(0)

    # Volume Z-Score grouped by HS code
    df["volume_mean"] = df.groupby("hs_code")["quantity"].transform("mean")
    df["volume_std"] = df.groupby("hs_code")["quantity"].transform("std")

    df["volume_zscore"] = (
        (df["quantity"] - df["volume_mean"]) / df["volume_std"]
    ).fillna(0)

    # Route frequency
    route_counts = df["route"].value_counts()
    df["route_frequency"] = df["route"].map(route_counts) / len(df)

    # Counterparty frequency (exporter)
    exporter_counts = df["exporter"].value_counts()
    df["counterparty_frequency"] = df["exporter"].map(exporter_counts) / len(df)

    return df
