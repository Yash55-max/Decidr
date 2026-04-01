@echo off
echo Starting AI Decision Intelligence Platform...

:: Start Backend in separate window
start cmd /k "cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

:: Start Frontend
cd frontend
npm install && npm run dev
