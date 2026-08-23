def generate_explanations(df):

    explanations = []

    for _, row in df.iterrows():

        parts = []

        # Safe value extraction
        final_risk = row.get("final_risk", 0)
        risk_level = row.get("final_risk_level", "Unknown")
        ai_score = row.get("ai_score", 0)
        context_adj = row.get("context_adjustment", 0)

        price_z = row.get("price_zscore", 0)
        volume_z = row.get("volume_zscore", 0)

        price_rule = row.get("price_rule_triggered", False)
        volume_rule = row.get("volume_rule_triggered", False)
        route_rule = row.get("route_rule_triggered", False)
        exporter_rule = row.get("exporter_rule_triggered", False)

        # -------------------------------
        # Risk Summary
        # -------------------------------
        parts.append(
            f"{risk_level} risk classification assigned (final score {float(final_risk):.2f})."
        )

        # -------------------------------
        # AI Model Explanation
        # -------------------------------
        if ai_score >= 85:
            parts.append(
                f"AI anomaly detection identified strong statistical deviation (AI score {ai_score:.2f})."
            )

        elif ai_score >= 65:
            parts.append(
                f"AI model detected moderate statistical irregularity (AI score {ai_score:.2f})."
            )

        elif ai_score >= 40:
            parts.append(
                "Minor statistical variance observed by anomaly detection model."
            )

        # -------------------------------
        # Rule Signals
        # -------------------------------
        rule_signals = []

        if price_rule:
            rule_signals.append(
                f"price deviation (z-score {price_z:.2f})"
            )

        if volume_rule:
            rule_signals.append(
                f"volume anomaly (z-score {volume_z:.2f})"
            )

        if route_rule:
            rule_signals.append("rare trade route")

        if exporter_rule:
            rule_signals.append("low-frequency exporter")

        if rule_signals:
            joined = ", ".join(rule_signals)
            parts.append(
                f"Rule engine flagged anomaly indicators: {joined}."
            )

        # -------------------------------
        # Context Layer
        # -------------------------------
        if context_adj < 0:
            parts.append(
                "Context-aware calibration reduced risk due to stable trade patterns."
            )

        elif context_adj > 0:
            parts.append(
                "Context signals increased risk due to unusual trade behavior."
            )

        # -------------------------------
        # Fallback
        # -------------------------------
        if len(parts) <= 2:
            parts.append(
                "Transaction behavior falls within expected operational thresholds."
            )

        explanation_text = " ".join(parts)

        explanations.append(explanation_text)

    df["explanation_text"] = explanations

    return df