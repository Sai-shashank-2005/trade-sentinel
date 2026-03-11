from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd

from app.database import SessionLocal
from app.models import Transaction

from app.services.feature_engineering import engineer_features
from app.services.model import compute_ai_score
from app.services.rule_engine import compute_rule_score
from app.services.scoring import compute_hybrid_risk
from app.services.context_layer import apply_context_adjustment
from app.services.explanation_engine import generate_explanations

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/live-trade")
def live_trade(trade: dict, db: Session = Depends(get_db)):

    # ----------------------------------
    # LOAD EXISTING DATA FROM DATABASE
    # ----------------------------------

    existing_transactions = db.query(Transaction).all()

    rows = []

    for t in existing_transactions:
        rows.append({
            "transaction_id": t.transaction_id,
            "date": t.date,
            "importer": t.importer,
            "exporter": t.exporter,
            "hs_code": t.hs_code,
            "quantity": t.quantity,
            "unit_price": t.unit_price,
            "total_value": t.total_value,
            "origin_country": t.origin_country,
            "destination_country": t.destination_country,
            "route": t.route,
        })

    df_existing = pd.DataFrame(rows)

    # ----------------------------------
    # ADD LIVE TRADE TO DATASET
    # ----------------------------------

    trade_df = pd.DataFrame([trade])

    trade_df["quantity"] = trade_df["quantity"].astype(float)
    trade_df["unit_price"] = trade_df["unit_price"].astype(float)

    trade_df["total_value"] = trade_df["quantity"] * trade_df["unit_price"]

    df = pd.concat([df_existing, trade_df], ignore_index=True)

    # ----------------------------------
    # RUN FULL PIPELINE
    # ----------------------------------

    df = engineer_features(df)
    df = compute_ai_score(df)
    df = compute_rule_score(df)
    df = compute_hybrid_risk(df)
    df = apply_context_adjustment(df)

    # ----------------------------------
    # RISK CLASSIFICATION
    # ----------------------------------

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

    # ----------------------------------
    # GET LAST ROW (LIVE TRADE)
    # ----------------------------------

    row = df.iloc[-1]

    # ----------------------------------
    # STORE IN DATABASE
    # ----------------------------------

    transaction = Transaction(

        transaction_id=row["transaction_id"],

        date=row["date"],
        importer=row["importer"],
        exporter=row["exporter"],
        hs_code=row["hs_code"],

        quantity=row["quantity"],
        unit_price=row["unit_price"],
        total_value=row["total_value"],

        origin_country=row["origin_country"],
        destination_country=row["destination_country"],
        route=row["route"],

        dataset_name="live_trade",
        source="live",

        raw_risk=row["raw_risk"],
        final_risk=row["final_risk"],
        ai_score=row["ai_score"],
        rule_score=row["rule_score"],

        risk_level=row["final_risk_level"],

        context_adjustment=row["context_adjustment"],

        price_zscore=row["price_zscore"],
        volume_zscore=row["volume_zscore"],
        route_frequency=row["route_frequency"],
        counterparty_frequency=row["counterparty_frequency"],

        price_rule_triggered=row["price_rule_triggered"],
        volume_rule_triggered=row["volume_rule_triggered"],
        route_rule_triggered=row["route_rule_triggered"],
        exporter_rule_triggered=row["exporter_rule_triggered"],

        explanation_text=row["explanation_text"]
    )

    db.add(transaction)
    db.commit()

    return {
        "risk": row["final_risk_level"],
        "score": float(row["final_risk"])
    }