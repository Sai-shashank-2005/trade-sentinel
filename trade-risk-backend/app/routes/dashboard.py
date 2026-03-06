from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Transaction

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard-summary")
def dashboard_summary(db: Session = Depends(get_db)):

    total = db.query(Transaction).count()

    high = db.query(Transaction).filter(Transaction.risk_level == "High").count()

    medium = db.query(Transaction).filter(Transaction.risk_level == "Medium").count()

    low = db.query(Transaction).filter(Transaction.risk_level == "Low").count()

    return {
        "total": total,
        "high": high,
        "medium": medium,
        "low": low
    }