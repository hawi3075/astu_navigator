from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import uvicorn

app = FastAPI()

# 🛡️ CORS setup for Vite (Port 5173/5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 DATABASE CONNECTION
MONGO_URI = "mongodb+srv://hawig:hawig1234@cluster0.nnfwkhs.mongodb.net/ASTU_Nav?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav

# --- MODELS ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LocationRequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    category: str
    description: str

class ChatRequest(BaseModel):
    message: str

# --- ROUTES ---

@app.post("/api/login")
async def login_user(user: LoginRequest):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "user": {
            "name": db_user["name"],
            "email": db_user["email"],
            "role": db_user.get("role", "user") 
        }
    }

@app.get("/api/admin/users")
async def get_users():
    users = []
    async for user in db.users.find({}, {"password": 0}):
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

@app.post("/api/admin/locations")
async def add_location(loc: LocationRequest):
    await db.locations.insert_one(loc.dict())
    return {"message": "Location added successfully!"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Basic logic - you can connect your 'brain.py' here
    return {"reply": f"I received your message: {request.message}. How can I help with ASTU directions?"}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)