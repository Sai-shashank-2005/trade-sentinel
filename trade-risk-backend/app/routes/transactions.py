from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import cast, String

from app.database import SessionLocal
from app.models import Transaction

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------
# GET ALL TRANSACTIONS
# -------------------------------

@router.get("/transactions")
def get_transactions(
    search: str = Query(None),
    risk_level: str = Query(None),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):

    query = db.query(Transaction)

    # Search by transaction ID
    if search:
        query = query.filter(
            cast(Transaction.transaction_id, String).contains(search)
        )

    # Filter by risk level
    if risk_level and risk_level != "All":
        query = query.filter(Transaction.risk_level == risk_level)

    # Newest first
    query = query.order_by(Transaction.id.desc())

    results = query.offset(offset).limit(limit).all()

    return results


# -------------------------------
# GET SINGLE TRANSACTION
# -------------------------------

@router.get("/transactions/{transaction_id}")
def get_transaction_detail(
    transaction_id: int,
    db: Session = Depends(get_db)
):

    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id
    ).first()

    return transaction