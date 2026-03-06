from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io

from app.database import SessionLocal
from app.models import Transaction

from app.services.feature_engineering import engineer_features
from app.services.rule_engine import compute_rule_score
from app.services.model import compute_ai_score
from app.services.scoring import compute_hybrid_risk
from app.services.context_layer import apply_context_adjustment
from app.services.explanation_engine import generate_explanations

router = APIRouter()


# -------------------------
# DB SESSION
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# GET TRANSACTIONS
# -------------------------
@router.get("/transactions")
def get_transactions(
    risk_level: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):

    query = db.query(Transaction)

    if risk_level:
        query = query.filter(Transaction.risk_level == risk_level)

    transactions = query.offset(offset).limit(limit).all()

    return transactions


# -------------------------
# GET SINGLE TRANSACTION
# -------------------------
@router.get("/transactions/{id}")
def get_transaction(id: int, db: Session = Depends(get_db)):

    tx = db.query(Transaction).filter(Transaction.id == id).first()

    return tx


# -------------------------
# DELETE TRANSACTION
# -------------------------
@router.delete("/transactions/{id}")
def delete_transaction(id: int, db: Session = Depends(get_db)):

    tx = db.query(Transaction).filter(Transaction.id == id).first()

    if not tx:
        return {"error": "Transaction not found"}

    db.delete(tx)
    db.commit()

    return {"message": "Transaction deleted"}


# -------------------------
# MANUAL TRANSACTION
# -------------------------
@router.post("/transactions/manual")
def manual_transaction(data: dict, db: Session = Depends(get_db)):

    # -----------------------------
    # LOAD HISTORICAL TRANSACTIONS
    # -----------------------------
    history = db.query(Transaction).all()

    historical_data = []

    for tx in history:
        historical_data.append({
            "importer": tx.importer,
            "exporter": tx.exporter,
            "origin_country": tx.origin_country,
            "destination_country": tx.destination_country,
            "route": tx.route,
            "hs_code": tx.hs_code,
            "quantity": tx.quantity,
            "unit_price": tx.unit_price,
            "total_value": tx.total_value
        })

    historical_df = pd.DataFrame(historical_data)

    # -----------------------------
    # CREATE NEW TRANSACTION
    # -----------------------------
    new_df = pd.DataFrame([data])

    new_df["route"] = new_df["origin_country"] + "-" + new_df["destination_country"]
    new_df["total_value"] = new_df["quantity"] * new_df["unit_price"]

    # -----------------------------
    # COMBINE HISTORY + NEW DATA
    # -----------------------------
    if not historical_df.empty:
        df = pd.concat([historical_df, new_df], ignore_index=True)
    else:
        df = new_df.copy()

    # -----------------------------
    # RUN PIPELINE
    # -----------------------------
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

    df["risk_level"] = risk_levels

    df = generate_explanations(df)

    # -----------------------------
    # EXTRACT ONLY NEW TRANSACTION
    # -----------------------------
    result = df.iloc[-1]

    transaction = Transaction(
        importer=result["importer"],
        exporter=result["exporter"],
        origin_country=result["origin_country"],
        destination_country=result["destination_country"],
        route=result["route"],
        hs_code=result["hs_code"],
        quantity=result["quantity"],
        unit_price=result["unit_price"],
        total_value=result["total_value"],
        ai_score=result["ai_score"],
        rule_score=result["rule_score"],
        price_zscore=result["price_zscore"],
        volume_zscore=result["volume_zscore"],
        route_frequency=result["route_frequency"],
        counterparty_frequency=result["counterparty_frequency"],
        context_adjustment=result["context_adjustment"],
        raw_risk=result["raw_risk"],
        final_risk=result["final_risk"],
        risk_level=result["risk_level"],
        explanation_text=result["explanation_text"]
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction
# -------------------------
# CSV UPLOAD
# -------------------------
@router.post("/transactions/upload")
async def upload_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    contents = await file.read()

    df = pd.read_csv(io.BytesIO(contents))

    df["route"] = df["origin_country"] + "-" + df["destination_country"]
    df["total_value"] = df["quantity"] * df["unit_price"]

    # PIPELINE
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

    df["risk_level"] = risk_levels

    df = generate_explanations(df)

    # Save to DB
    for _, row in df.iterrows():

        transaction = Transaction(
            importer=row["importer"],
            exporter=row["exporter"],
            origin_country=row["origin_country"],
            destination_country=row["destination_country"],
            route=row["route"],
            hs_code=row["hs_code"],
            quantity=row["quantity"],
            unit_price=row["unit_price"],
            total_value=row["total_value"],
            ai_score=row["ai_score"],
            rule_score=row["rule_score"],
            price_zscore=row["price_zscore"],
            volume_zscore=row["volume_zscore"],
            route_frequency=row["route_frequency"],
            counterparty_frequency=row["counterparty_frequency"],
            context_adjustment=row["context_adjustment"],
            raw_risk=row["raw_risk"],
            final_risk=row["final_risk"],
            risk_level=row["risk_level"],
            explanation_text=row["explanation_text"]
        )

        db.add(transaction)

    db.commit()

    return {
        "message": "Batch processed successfully",
        "transactions_processed": len(df)
    }