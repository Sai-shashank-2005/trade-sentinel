from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.models import Transaction

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

    high = db.query(Transaction).filter(
        Transaction.risk_level == "High"
    ).count()

    medium = db.query(Transaction).filter(
        Transaction.risk_level == "Medium"
    ).count()

    low = db.query(Transaction).filter(
        Transaction.risk_level == "Low"
    ).count()

    avg_final_risk = db.query(func.avg(Transaction.final_risk)).scalar() or 0

    return {
        "total": total,
        "high": high,
        "medium": medium,
        "low": low,
        "avg_final_risk": round(avg_final_risk, 2)
    }
