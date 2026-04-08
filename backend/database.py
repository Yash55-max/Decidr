from sqlalchemy import create_engine, Column, Integer, String, Float, JSON, ForeignKey, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "sqlite:///./platform.db"

engine      = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base         = declarative_base()


class DecisionRecord(Base):
    __tablename__ = "decisions"
    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String)
    options      = Column(JSON)       # ["Option A", "Option B"]
    constraints  = Column(JSON)       # [{"key": "Budget", "value": "Low"}]
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)
    # outcome tracking
    actual_outcome   = Column(String, nullable=True)
    outcome_rating   = Column(Integer, nullable=True)

class AnalysisResult(Base):
    __tablename__ = "results"
    id              = Column(Integer, primary_key=True, index=True)
    decision_id     = Column(Integer, ForeignKey("decisions.id"))
    probabilities   = Column(JSON)
    risk_scores     = Column(JSON)
    ai_analysis     = Column(Text)
    recommendation  = Column(Text)
    bias_summary    = Column(Text)
    # NEW fields
    trade_offs      = Column(Text, nullable=True)
    action_steps    = Column(JSON, nullable=True)   # list of strings
    best_option     = Column(String, nullable=True)
    confidence      = Column(Integer, nullable=True)
    used_llm        = Column(Integer, default=0)    # 0=False, 1=True
    data_summary    = Column(JSON, nullable=True)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
