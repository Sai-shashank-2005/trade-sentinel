def compute_rule_score(df):

    rule_scores = []
    price_flags = []
    volume_flags = []
    route_flags = []
    exporter_flags = []

    for _, row in df.iterrows():

        score = 0

        # -------------------------
        # PRICE RULES
        # -------------------------
        price_triggered = False

        if abs(row["price_zscore"]) > 5:
            score += 40
            price_triggered = True
        elif abs(row["price_zscore"]) > 3:
            score += 30
            price_triggered = True


        # -------------------------
        # VOLUME RULES
        # -------------------------
        volume_triggered = False

        if abs(row["volume_zscore"]) > 5:
            score += 30
            volume_triggered = True
        elif abs(row["volume_zscore"]) > 3:
            score += 20
            volume_triggered = True


        # -------------------------
        # ROUTE RARITY RULE
        # -------------------------
        route_triggered = False

        if row["route_frequency"] < 0.01:
            score += 20
            route_triggered = True


        # -------------------------
        # EXPORTER RARITY RULE
        # -------------------------
        exporter_triggered = False

        if row["counterparty_frequency"] < 0.01:
            score += 10
            exporter_triggered = True


        # Cap score at 100
        score = min(score, 100)

        rule_scores.append(score)
        price_flags.append(price_triggered)
        volume_flags.append(volume_triggered)
        route_flags.append(route_triggered)
        exporter_flags.append(exporter_triggered)

    df["rule_score"] = rule_scores
    df["price_rule_triggered"] = price_flags
    df["volume_rule_triggered"] = volume_flags
    df["route_rule_triggered"] = route_flags
    df["exporter_rule_triggered"] = exporter_flags

    return df
