from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class PlanCreate(BaseModel):
    name: str = "Untitled"
    plan: Optional[Any] = None
    land: Optional[Any] = None

class PlanResponse(BaseModel):
    id: int
    owner_id: int
    data: Dict[str, Any]
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

class GeneratePlanRequest(BaseModel):
    length: float
    width: float
    shape: str = "rectangle"
    points: Optional[List[Any]] = None
