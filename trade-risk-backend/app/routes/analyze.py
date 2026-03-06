from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd

from ..database import SessionLocal
from ..models import Transaction
from ..schemas import AnalyzeRequest

from ..services.feature_engineering import engineer_features
from ..services.rule_engine import compute_rule_score
from ..services.model import compute_ai_score
from ..services.scoring import compute_hybrid_risk
from ..services.context_layer import apply_context_adjustment
from ..services.explanation_engine import generate_explanations

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/analyze")
def analyze_transaction(data: AnalyzeRequest, db: Session = Depends(get_db)):

    data_dict = data.dict()

    new_df = pd.DataFrame([data_dict])

    new_df["route"] = (
        new_df["origin_country"] + "-" + new_df["destination_country"]
    )

    # -------------------------
    # Load historical dataset
    # -------------------------

    historical = db.query(Transaction).all()

    historical_df = pd.DataFrame([t.__dict__ for t in historical])

    if not historical_df.empty:
        historical_df = historical_df.drop(
            columns=["_sa_instance_state"], errors="ignore"
        )

    # -------------------------
    # Combine historical + new
    # -------------------------

    combined_df = pd.concat([historical_df, new_df], ignore_index=True)

    # -------------------------
    # Feature Engineering
    # -------------------------

    combined_df = engineer_features(combined_df)

    # -------------------------
    # Rule Engine
    # -------------------------

    combined_df = compute_rule_score(combined_df)

    # -------------------------
    # AI Model
    # -------------------------

    combined_df = compute_ai_score(combined_df)

    # -------------------------
    # Hybrid Scoring
    # -------------------------

    combined_df = compute_hybrid_risk(combined_df)

    # -------------------------
    # Context Layer
    # -------------------------

    combined_df = apply_context_adjustment(combined_df)

    # -------------------------
    # Explainability
    # -------------------------

    combined_df = generate_explanations(combined_df)

    # -------------------------
    # Extract result
    # -------------------------

    result = combined_df.iloc[-1].to_dict()

    # -------------------------
    # Save transaction
    # -------------------------

    record = Transaction(**result)

    db.add(record)
    db.commit()
    db.refresh(record)

    return result