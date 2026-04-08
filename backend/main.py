from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
import pandas as pd
import io

try:
    from database import get_db, DecisionRecord, AnalysisResult
    from ml_engine import ml_engine
    from ai_reasoning import ai_reasoning_engine
except ImportError:
    from .database import get_db, DecisionRecord, AnalysisResult
    from .ml_engine import ml_engine
    from .ai_reasoning import ai_reasoning_engine

app = FastAPI(title="AI Decision Intelligence Platform API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "AI Decision Intelligence API v2 is running.", "version": "2.0.0"}


# ─────────────────────────────────────────────────────────────────────────────
# Create a new decision
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/decision")
async def create_decision(
    title:       str = Form(...),
    options:     str = Form(...),
    constraints: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        options_list      = json.loads(options)
        constraints_list  = json.loads(constraints)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON in options or constraints.")

    record = DecisionRecord(
        title=title,
        options=options_list,
        constraints=constraints_list
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"status": "success", "id": record.id}


# ─────────────────────────────────────────────────────────────────────────────
# Analyse a decision (ML + AI Reasoning)
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/analyze")
async def analyze(
    decision_id: int          = Form(...),
    file:        UploadFile   = File(None),
    db: Session               = Depends(get_db)
):
    decision = db.query(DecisionRecord).filter(DecisionRecord.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")

    options     = decision.options     or []
    constraints = decision.constraints or []

    # ── CSV analysis (optional) ────────────────────────────────────────────
    data_summary = {}
    if file:
        content      = await file.read()
        df           = pd.read_csv(io.BytesIO(content))
        data_summary = ml_engine.process_data(df)

    # ── ML scoring per option ─────────────────────────────────────────────
    ml_output    = ml_engine.predict_outcomes(options, constraints)
    probabilities = ml_output["probabilities"]
    risk_scores   = ml_output["risk_scores"]

    best_option = ml_engine.get_best_option(probabilities)
    confidence  = ml_engine.compute_confidence(probabilities)

    # ── AI Reasoning ──────────────────────────────────────────────────────
    ai_output = ai_reasoning_engine.generate_reasoning(
        ml_results={
            "probabilities": probabilities,
            "risk_scores":   risk_scores,
            "best_option":   best_option,
            "confidence":    confidence,
        },
        user_context={
            "title":       decision.title,
            "options":     options,
            "constraints": constraints,
        }
    )

    # ── Persist result ────────────────────────────────────────────────────
    result = AnalysisResult(
        decision_id    = decision.id,
        probabilities  = probabilities,
        risk_scores    = risk_scores,
        ai_analysis    = ai_output.get("analysis", ""),
        recommendation = ai_output.get("recommendation", ""),
        bias_summary   = ai_output.get("bias_detection", ""),
        trade_offs     = ai_output.get("trade_offs", ""),
        action_steps   = ai_output.get("action_steps", []),
        best_option    = best_option,
        confidence     = confidence,
        used_llm       = int(ai_output.get("used_llm", False)),
        data_summary   = data_summary if data_summary else None,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "id":             result.id,
        "decision_id":    decision_id,
        "probabilities":  probabilities,
        "risk_scores":    risk_scores,
        "best_option":    best_option,
        "confidence":     confidence,
        "ai_analysis":    ai_output.get("analysis", ""),
        "recommendation": ai_output.get("recommendation", ""),
        "bias":           ai_output.get("bias_detection", ""),
        "trade_offs":     ai_output.get("trade_offs", ""),
        "action_steps":   ai_output.get("action_steps", []),
        "used_llm":       ai_output.get("used_llm", False),
        "data_summary":   data_summary,
    }


# ─────────────────────────────────────────────────────────────────────────────
# History
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/history")
async def get_history(db: Session = Depends(get_db)):
    records = db.query(DecisionRecord).order_by(DecisionRecord.created_at.desc()).all()
    return [
        {
            "id":             r.id,
            "title":          r.title,
            "options":        r.options,
            "constraints":    r.constraints,
            "created_at":     r.created_at,
            "actual_outcome": r.actual_outcome,
            "outcome_rating": r.outcome_rating,
        }
        for r in records
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Get result for a specific decision
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/result/{decision_id}")
async def get_result(decision_id: int, db: Session = Depends(get_db)):
    result   = db.query(AnalysisResult).filter(AnalysisResult.decision_id == decision_id).first()
    decision = db.query(DecisionRecord).filter(DecisionRecord.id == decision_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found. Please run analysis first.")

    return {
        "id":             result.id,
        "decision_id":    result.decision_id,
        "probabilities":  result.probabilities,
        "risk_scores":    result.risk_scores,
        "ai_analysis":    result.ai_analysis,
        "recommendation": result.recommendation,
        "bias":           result.bias_summary,
        "trade_offs":     result.trade_offs,
        "action_steps":   result.action_steps or [],
        "best_option":    result.best_option,
        "confidence":     result.confidence,
        "used_llm":       bool(result.used_llm),
        "data_summary":   result.data_summary,
        # decision meta
        "title":          decision.title if decision else "",
        "options":        decision.options if decision else [],
        "constraints":    decision.constraints if decision else [],
        "actual_outcome": decision.actual_outcome if decision else None,
        "outcome_rating": decision.outcome_rating if decision else None,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Mark actual outcome (outcome tracking)
# ─────────────────────────────────────────────────────────────────────────────
class OutcomePayload(BaseModel):
    actual_outcome: str
    outcome_rating: Optional[int] = None   # 1-5

@app.patch("/decision/{decision_id}/outcome")
async def mark_outcome(decision_id: int, payload: OutcomePayload, db: Session = Depends(get_db)):
    record = db.query(DecisionRecord).filter(DecisionRecord.id == decision_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Decision not found.")
    record.actual_outcome = payload.actual_outcome
    if payload.outcome_rating is not None:
        record.outcome_rating = max(1, min(5, payload.outcome_rating))
    db.commit()
    db.refresh(record)
    return {"status": "updated", "id": decision_id}


# ─────────────────────────────────────────────────────────────────────────────
# Templates
# ─────────────────────────────────────────────────────────────────────────────
TEMPLATES = [
    {
        "id": "job_vs_startup",
        "label": "Job Offer vs. Startup",
        "title": "Job Offer vs. Launching My Startup",
        "options": ["Accept Job Offer", "Launch My Startup"],
        "constraints": [
            {"key": "Budget", "value": "Low"},
            {"key": "Time", "value": "High"},
            {"key": "Risk Tolerance", "value": "Medium"},
            {"key": "Skills", "value": "High"},
        ]
    },
    {
        "id": "masters_vs_work",
        "label": "Masters vs. Work",
        "title": "Pursue Masters Degree vs. Enter Industry",
        "options": ["Masters Degree", "Industry Job"],
        "constraints": [
            {"key": "Budget", "value": "Low"},
            {"key": "Time", "value": "Medium"},
            {"key": "Network", "value": "Low"},
            {"key": "Experience", "value": "Low"},
        ]
    },
    {
        "id": "freelance_vs_fulltime",
        "label": "Freelance vs. Full-time",
        "title": "Freelancing vs. Full-time Employment",
        "options": ["Freelance", "Full-time Job"],
        "constraints": [
            {"key": "Budget", "value": "Medium"},
            {"key": "Time", "value": "High"},
            {"key": "Support", "value": "Low"},
            {"key": "Skills", "value": "High"},
        ]
    },
    {
        "id": "relocate_vs_stay",
        "label": "Relocate vs. Stay",
        "title": "Relocate for Better Opportunity vs. Stay Local",
        "options": ["Relocate", "Stay Local"],
        "constraints": [
            {"key": "Budget", "value": "Medium"},
            {"key": "Network", "value": "Low"},
            {"key": "Risk Tolerance", "value": "High"},
            {"key": "Support", "value": "Low"},
        ]
    },
]

@app.get("/templates")
async def get_templates():
    return TEMPLATES


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
