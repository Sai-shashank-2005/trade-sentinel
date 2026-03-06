from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from .database import Base


class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    importer = Column(String)
    exporter = Column(String)

    origin_country = Column(String)
    destination_country = Column(String)

    route = Column(String)

    hs_code = Column(String)

    quantity = Column(Float)
    unit_price = Column(Float)
    total_value = Column(Float)

    ai_score = Column(Float)
    rule_score = Column(Float)

    price_zscore = Column(Float)
    volume_zscore = Column(Float)

    route_frequency = Column(Float)
    counterparty_frequency = Column(Float)

    context_adjustment = Column(Float)

    raw_risk = Column(Float)
    final_risk = Column(Float)

    risk_level = Column(String)

    explanation_text = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)