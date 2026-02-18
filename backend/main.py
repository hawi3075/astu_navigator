from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import uvicorn

app = FastAPI()

# 🛡️ CORS setup for Vite frontend
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
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LocationRequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    category: str
    description: str

class EventRequest(BaseModel):
    title: str
    date: str
    location: str
    description: str

class ChatRequest(BaseModel):
    message: str

# --- AUTH ROUTES ---

@app.post("/api/register")
async def register_user(user: RegisterRequest):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email")
    
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": user.password, 
        "role": "user"
    }
    await db.users.insert_one(new_user)
    return {"message": "Registration Successful!"}

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

# --- ADMIN: USER MANAGEMENT ROUTES ---

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

# --- ADMIN: LOCATION/MAP ROUTES ---

@app.post("/api/admin/locations")
async def add_location(loc: LocationRequest):
    await db.locations.insert_one(loc.model_dump())
    return {"message": "Location added successfully!"}

@app.get("/api/admin/locations_list")
async def get_locations():
    locations = []
    async for loc in db.locations.find():
        loc["_id"] = str(loc["_id"])
        locations.append(loc)
    return locations

# --- ADMIN: ANALYTICS & EVENT ROUTES ---

@app.get("/api/admin/stats")
async def get_stats():
    user_count = await db.users.count_documents({})
    location_count = await db.locations.count_documents({})
    event_count = await db.events.count_documents({})
    return {
        "totalUsers": user_count,
        "totalBlocks": location_count,
        "activeEvents": event_count
    }

@app.post("/api/admin/events")
async def add_event(event: EventRequest):
    await db.events.insert_one(event.model_dump())
    return {"message": "Event published to campus!"}

@app.get("/api/admin/events")
async def get_events():
    events = []
    async for event in db.events.find():
        event["_id"] = str(event["_id"])
        events.append(event)
    return events

# --- 🚀 SMART AI CHAT ROUTE (UPDATED) ---

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    query = request.message.lower()
    
    # Search database for a matching building name
    # Using regex for partial matches (e.g., "oda" matches "Oda Nabe Hall")
    location = await db.locations.find_one({"name": {"$regex": query, "$options": "i"}})
    
    if location:
        return {
            "reply": f"I found {location['name']} for you. I've updated the map and drawn the blue navigation line to guide you.",
            "target": {
                "lat": location["latitude"],
                "lng": location["longitude"],
                "name": location["name"]
            }
        }
    
    return {
        "reply": f"I'm sorry, I couldn't find '{request.message}' in the ASTU campus database. Please check the spelling or ask for a specific block number.",
        "target": None
    }

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)