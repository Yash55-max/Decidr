from sqlalchemy import create_engine, Column, Integer, String, Float, JSON, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# For simplicity, using SQLite locally. In production, TRD says PostgreSQL/Supabase.
DATABASE_URL = "sqlite:///./platform.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DecisionRecord(Base):
    __tablename__ = "decisions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    options = Column(JSON) # e.g. ["A", "B"]
    constraints = Column(JSON) # e.g. {"Time": 10, "Budget": 100}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnalysisResult(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"))
    probabilities = Column(JSON) # {"A": 0.6, "B": 0.4}
    risk_scores = Column(JSON) # {"A": 20}
    ai_analysis = Column(String)
    recommendation = Column(String)
    bias_summary = Column(String)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
