from sqlalchemy import Column, Integer, Float, String, Boolean, Text, DateTime
from app.database import Base
from datetime import datetime

class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer)

    # ================= RAW TRADE DATA =================
    date = Column(String)
    importer = Column(String)
    exporter = Column(String)
    hs_code = Column(String)

    quantity = Column(Float)
    unit_price = Column(Float)
    total_value = Column(Float)

    origin_country = Column(String)
    destination_country = Column(String)
    route = Column(String)

    dataset_name = Column(String)
    source = Column(String)

    # ================= RISK SYSTEM =================
    raw_risk = Column(Float)
    final_risk = Column(Float)
    ai_score = Column(Float)
    rule_score = Column(Float)

    risk_level = Column(String)

    context_adjustment = Column(Float)

    price_zscore = Column(Float)
    volume_zscore = Column(Float)
    route_frequency = Column(Float)
    counterparty_frequency = Column(Float)

    price_rule_triggered = Column(Boolean)
    volume_rule_triggered = Column(Boolean)
    route_rule_triggered = Column(Boolean)
    exporter_rule_triggered = Column(Boolean)

    explanation_text = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)