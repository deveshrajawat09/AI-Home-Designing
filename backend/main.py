from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database, auth
from database import engine, get_db
import os
import google.generativeai as genai
from typing import List
import json

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Home Planner API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

from dotenv import load_dotenv
import os
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "db": "connected", "ai_configured": bool(GOOGLE_API_KEY)}

@app.post("/api/chat")
def chat(request: schemas.ChatRequest, current_user: models.User = Depends(auth.get_current_active_user)):
    if not GOOGLE_API_KEY:
        return {"reply": "Offline mode: Ensure proper ventilation."}
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = "You are an expert AI Architect Assistant. Provide concise, helpful advice on home layout, design, ventilation, and budget optimization. Reply in Markdown format.\n\n"
        if request.history:
            for msg in request.history[-5:]:
                role = "User" if msg.get("role") == "user" else "Architect"
                prompt += f"{role}: {msg.get('content')}\n"
        prompt += f"User: {request.message}\nArchitect:"
        response = model.generate_content(prompt)
        return {"reply": response.text.strip()}
    except Exception as e:
        print(f"AI Chat Error: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed")

def generate_fallback_plan(length: float, width: float):
    return {
        "meta": {"length": length, "width": width, "unit": "m", "scale": 1},
        "rooms": [
            {"id": "bed1", "type": "Bedroom", "x": 1, "y": 1, "width": 4, "height": 3, "color": "#fcd34d"},
            {"id": "living", "type": "Living Room", "x": 5.2, "y": 4.2, "width": 5, "height": 4, "color": "#bfdbfe"}
        ],
        "legend": [
            {"label": "Bedroom", "color": "#fcd34d"},
            {"label": "Living Room", "color": "#bfdbfe"}
        ]
    }

@app.post("/generate-plan")
def generate_plan(request: schemas.GeneratePlanRequest, current_user: models.User = Depends(auth.get_current_active_user)):
    if not GOOGLE_API_KEY:
        return {"plan": generate_fallback_plan(request.length, request.width), "warning": "Offline mode active."}
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        shape_text = f"irregular polygon with vertices {request.points}" if request.shape == "irregular" and request.points else request.shape
        prompt = f"""Generate a detailed JSON floor plan for a land plot of {request.length}m by {request.width}m, shape: {shape_text}.
STRICT RULES: Return ONLY valid JSON, no markdown.
Schema: {{ "meta":{{"length":{request.length},"width":{request.width},"unit":"m","scale":1}}, "rooms":[{{id,type,x,y,width,height,color}}], "legend":[{{label,color}}] }}
Ensure no two rooms overlap."""
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        return {"plan": json.loads(text)}
    except Exception as e:
        return {"plan": generate_fallback_plan(request.length, request.width), "warning": "AI Generation failed."}

@app.get("/plans", response_model=List[schemas.PlanResponse])
def get_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Plan).filter(models.Plan.owner_id == current_user.id).offset(skip).limit(limit).all()

@app.post("/plans", response_model=schemas.PlanResponse)
def create_plan(plan: schemas.PlanCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_plan = models.Plan(**plan.model_dump(), owner_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@app.delete("/plans/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    plan = db.query(models.Plan).filter(models.Plan.id == plan_id).first()
    if not plan: raise HTTPException(status_code=404, detail="Plan not found")
    if plan.owner_id != current_user.id: raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(plan)
    db.commit()
    return {"ok": True, "message": "Plan deleted"}
