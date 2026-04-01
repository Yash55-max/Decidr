from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import pandas as pd
import io

# Direct imports for standalone execution
try:
    from database import get_db, DecisionRecord, AnalysisResult
    from ml_engine import ml_engine
    from ai_reasoning import ai_reasoning_engine
except ImportError:
    from .database import get_db, DecisionRecord, AnalysisResult
    from .ml_engine import ml_engine
    from .ai_reasoning import ai_reasoning_engine

app = FastAPI(title="AI Decision Intelligence Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Decision Intelligence API is running."}

@app.post("/decision")
async def create_decision(
    title: str = Form(...),
    options: str = Form(...),
    constraints: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        options_list = json.loads(options)
        constraints_dict = json.loads(constraints)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format.")

    new_decision = DecisionRecord(
        title=title,
        options=options_list,
        constraints=constraints_dict
    )
    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)
    return {"status": "success", "id": new_decision.id}

@app.post("/analyze")
async def analyze(
    decision_id: int = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    decision = db.query(DecisionRecord).filter(DecisionRecord.id == decision_id).first()
    if not decision: raise HTTPException(status_code=404, detail="Decision not found.")
    
    data_summary = {}
    if file:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        data_summary = ml_engine.process_data(df)

    probs = ml_engine.predict_outcomes([], [])
    risk = {"A": 0.25, "B": 0.45}

    ai_output = ai_reasoning_engine.generate_reasoning({"probabilities": probs}, {"title": decision.title})

    result = AnalysisResult(
        decision_id=decision.id,
        probabilities=probs,
        risk_scores=risk,
        ai_analysis=ai_output["analysis"],
        recommendation=ai_output["recommendation"],
        bias_summary=ai_output["bias_detection"]
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "id": result.id,
        "decision_id": decision_id,
        "probabilities": probs,
        "risk_scores": risk,
        "ai_analysis": ai_output["analysis"],
        "recommendation": ai_output["recommendation"],
        "bias": ai_output["bias_detection"],
        "data_summary": data_summary
    }

@app.get("/history")
async def get_history(db: Session = Depends(get_db)):
    return db.query(DecisionRecord).order_by(DecisionRecord.created_at.desc()).all()

@app.get("/result/{id}")
async def get_result(id: int, db: Session = Depends(get_db)):
    result = db.query(AnalysisResult).filter(AnalysisResult.decision_id == id).first()
    return result if result else {"error": "not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
