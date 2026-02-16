from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import uvicorn

app = FastAPI()

# 🛡️ CORS setup for your Vite frontend
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

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str):
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 1:
            return {"message": "User deleted successfully"}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

@app.post("/api/admin/locations")
async def add_location(loc: LocationRequest):
    await db.locations.insert_one(loc.dict())
    return {"message": "Location added successfully!"}

@app.delete("/api/admin/locations/{loc_id}")
async def delete_location(loc_id: str):
    try:
        result = await db.locations.delete_one({"_id": ObjectId(loc_id)})
        if result.deleted_count == 1:
            return {"message": "Location removed from map"}
        raise HTTPException(status_code=404, detail="Location not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Basic logic for ASTUNav AI
    return {"reply": f"ASTU AI: I've received your request about '{request.message}'."}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)