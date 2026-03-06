def generate_explanations(df):

    explanations = []

    for _, row in df.iterrows():

        parts = []

        # Risk level
        parts.append(f"Final risk classification: {row['risk_level']}.")

        # AI signal
        if row["ai_score"] > 80:
            parts.append(
                f"Strong statistical anomaly detected (AI score {row['ai_score']:.2f})."
            )
        elif row["ai_score"] > 60:
            parts.append(
                f"Moderate statistical deviation observed (AI score {row['ai_score']:.2f})."
            )

        # Price anomaly
        if abs(row["price_zscore"]) > 5:
            parts.append(
                f"Extreme price deviation (z-score {row['price_zscore']:.2f})."
            )
        elif abs(row["price_zscore"]) > 3:
            parts.append(
                f"Price deviation detected (z-score {row['price_zscore']:.2f})."
            )

        # Volume anomaly
        if abs(row["volume_zscore"]) > 5:
            parts.append(
                f"Extreme volume anomaly (z-score {row['volume_zscore']:.2f})."
            )
        elif abs(row["volume_zscore"]) > 3:
            parts.append(
                f"Volume deviation detected (z-score {row['volume_zscore']:.2f})."
            )

        # Route rarity
        if row["route_frequency"] < 0.01:
            parts.append("Rare trade route observed.")

        # Exporter rarity
        if row["counterparty_frequency"] < 0.01:
            parts.append("Low-frequency exporter involved.")

        # Context adjustment
        if row["context_adjustment"] < 0:
            parts.append(
                "Risk reduced due to stable historical trade behavior."
            )

        # Fallback
        if len(parts) == 1:
            parts.append(
                "Transaction falls within expected behavioral thresholds."
            )

        explanation = " ".join(parts)

        explanations.append(explanation)

    df["explanation_text"] = explanations

    return df