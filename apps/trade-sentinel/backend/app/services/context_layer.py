def apply_context_adjustment(df):

    final_risks = []
    context_adjustments = []

    for _, row in df.iterrows():

        raw_risk = row["raw_risk"]
        final_risk = raw_risk  # default: no change

        # 🔒 Preserve HIGH risk completely
        # High threshold is 75
        if raw_risk < 75:

            context_factor = 1.0

            # Stable route reduces risk
            if row["route_frequency"] > 0.03:
                context_factor -= 0.10  # 10% reduction

            # Stable exporter reduces risk
            if row["counterparty_frequency"] > 0.02:
                context_factor -= 0.10  # additional 10%

            # Cap maximum suppression to 20%
            context_factor = max(context_factor, 0.80)

            final_risk = raw_risk * context_factor

        final_risks.append(final_risk)
        context_adjustments.append(final_risk - raw_risk)

    df["final_risk"] = final_risks
    df["context_adjustment"] = context_adjustments

    return df
