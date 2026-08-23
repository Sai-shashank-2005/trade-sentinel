from fastapi import APIRouter, UploadFile, File, Depends
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


@router.post("/analyze")
async def analyze(file: UploadFile = File(...), db: Session = Depends(get_db)):

    # Read CSV
    df = pd.read_csv(file.file)

    # Run intelligence pipeline
    df = engineer_features(df)
    df = compute_ai_score(df)
    df = compute_rule_score(df)
    df = compute_hybrid_risk(df)
    df = apply_context_adjustment(df)

    # Risk classification
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

    # Store into database (NO deletion anymore → persistent DB)
    for _, row in df.iterrows():

        transaction = Transaction(
            transaction_id=int(row["transaction_id"]),
            date=str(row["date"]),
            importer=str(row["importer"]),
            exporter=str(row["exporter"]),
            hs_code=str(row["hs_code"]),
            quantity=float(row["quantity"]),
            unit_price=float(row["unit_price"]),
            total_value=float(row["total_value"]),
            origin_country=str(row["origin_country"]),
            destination_country=str(row["destination_country"]),
            route=str(row["route"]),
            dataset_name=file.filename,
            source="csv_upload",
            raw_risk=float(row["raw_risk"]),
            final_risk=float(row["final_risk"]),
            ai_score=float(row["ai_score"]),
            rule_score=float(row["rule_score"]),
            risk_level=str(row["final_risk_level"]),
            context_adjustment=float(row["context_adjustment"]),
            price_zscore=float(row["price_zscore"]),
            volume_zscore=float(row["volume_zscore"]),
            route_frequency=float(row["route_frequency"]),
            counterparty_frequency=float(row["counterparty_frequency"]),
            price_rule_triggered=bool(row["price_rule_triggered"]),
            volume_rule_triggered=bool(row["volume_rule_triggered"]),
            route_rule_triggered=bool(row["route_rule_triggered"]),
            exporter_rule_triggered=bool(row["exporter_rule_triggered"]),
            explanation_text=str(row["explanation_text"])
        )

        db.add(transaction)

    db.commit()

    # Summary response
    summary = {
        "total": len(df),
        "high": len(df[df["final_risk_level"] == "High"]),
        "medium": len(df[df["final_risk_level"] == "Medium"]),
        "low": len(df[df["final_risk_level"] == "Low"]),
    }

    return summary