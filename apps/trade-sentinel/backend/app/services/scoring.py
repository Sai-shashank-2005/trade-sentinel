def compute_hybrid_risk(df):

    # Weighted combination
    df["raw_risk"] = 0.6 * df["ai_score"] + 0.4 * df["rule_score"]

    # Risk classification (ABSOLUTE thresholds)
    risk_levels = []

    for risk in df["raw_risk"]:

        if risk >= 75:
            risk_levels.append("High")
        elif risk >= 50:
            risk_levels.append("Medium")
        else:
            risk_levels.append("Low")

    df["risk_level"] = risk_levels

    return df
