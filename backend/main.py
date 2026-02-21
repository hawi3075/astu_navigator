import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from thefuzz import process 
import uvicorn

load_dotenv()

app = FastAPI()

# 🛡️ CORS setup - Critical for Vite (5173) to communicate with FastAPI (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 Connections
MONGO_URI = os.getenv("MONGO_URI")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav
gro_client = Groq(api_key=GROQ_API_KEY)

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "Student"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SaveLocationRequest(BaseModel):
    user_email: EmailStr
    location_name: str

# --- 🚀 Campus Hub Routes ---

@app.get("/api/events")
async def get_all_events():
    events = await db.events.find().to_list(length=100)
    for e in events: e["_id"] = str(e["_id"])
    return events

@app.get("/api/clubs")
async def get_all_clubs():
    clubs = await db.clubs.find().to_list(length=100)
    for c in clubs: c["_id"] = str(c["_id"])
    return clubs

# --- 📍 Map & Location Routes ---

@app.get("/api/admin/locations_list")
async def get_all_locations():
    locs = await db.locations.find().to_list(length=100)
    for l in locs: l["_id"] = str(l["_id"])
    return locs

@app.post("/api/save-location")
async def save_location(request: SaveLocationRequest):
    await db.saved_locations.update_one(
        {"user_email": request.user_email, "location_name": request.location_name},
        {"$set": request.model_dump()},
        upsert=True
    )
    return {"message": "Saved successfully"}

@app.get("/api/saved-locations/{email}")
async def get_saved_locations(email: str):
    saved_docs = await db.saved_locations.find({"user_email": email}).to_list(length=100)
    names = [doc["location_name"] for doc in saved_docs]
    full_details = await db.locations.find({"name": {"$in": names}}).to_list(length=100)
    for loc in full_details: loc["_id"] = str(loc["_id"])
    return full_details

# --- 🔑 Authentication Routes ---

@app.post("/api/register")
async def register_user(user: RegisterRequest):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    await db.users.insert_one(user.model_dump())
    return {"message": "Registration Successful"}

@app.post("/api/login")
async def login_user(user: LoginRequest):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "full_name": db_user.get("name", "ASTU User"), 
        "email": db_user["email"],
        "role": db_user.get("role", "Student") 
    }

# --- 🤖 AI Navigator ---

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip().lower()
    locations = await db.locations.find({}).to_list(length=100)
    names = [loc["name"] for loc in locations]
    
    best_match, score = process.extractOne(user_msg, names)
    if score > 75:
        found = next(l for l in locations if l["name"] == best_match)
        return {
            "reply": f"📍 Moving map to **{found['name']}**.",
            "target": {"lat": found["latitude"], "lng": found["longitude"], "name": found["name"]}
        }

    try:
        completion = gro_client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"You are the ASTU Navigator. Locations: {names}."},
                {"role": "user", "content": user_msg}
            ],
            model="llama3-8b-8192",
        )
        ai_reply = completion.choices[0].message.content.strip()
        ai_match = next((l for l in locations if l["name"].lower() in ai_reply.lower()), None)
        if ai_match:
            return {
                "reply": ai_reply,
                "target": {"lat": ai_match["latitude"], "lng": ai_match["longitude"], "name": ai_match["name"]}
            }
        return {"reply": ai_reply, "target": None}
    except Exception:
        return {"reply": "Connection to AI lost.", "target": None}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)