import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from thefuzz import process  # ✅ Supports misspelling logic for campus locations
import uvicorn

# 1. Load Environment Variables
load_dotenv()

app = FastAPI()

# 🛡️ CORS setup - Critical for fixing the "Connection to Server Failed" error
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    role: str = "Student"  # ✅ Default role to match Hawi's profile

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
    for e in events:
        e["_id"] = str(e["_id"])
    return events

@app.get("/api/clubs")
async def get_all_clubs():
    clubs = await db.clubs.find().to_list(length=100)
    for c in clubs:
        c["_id"] = str(c["_id"])
    return clubs

# --- 📍 Map & Location Routes ---

@app.get("/api/admin/locations_list")
async def get_all_locations():
    locs = await db.locations.find().to_list(length=100)
    for l in locs:
        l["_id"] = str(l["_id"])
    return locs

@app.post("/api/save-location")
async def save_location(request: SaveLocationRequest):
    existing = await db.saved_locations.find_one({
        "user_email": request.user_email, 
        "location_name": request.location_name
    })
    if existing:
        return {"message": "Already saved"}
    await db.saved_locations.insert_one(request.model_dump())
    return {"message": "Saved successfully"}

@app.get("/api/saved-locations/{email}")
async def get_saved_locations(email: str):
    saved_docs = await db.saved_locations.find({"user_email": email}).to_list(length=100)
    names = [doc["location_name"] for doc in saved_docs]
    full_details = await db.locations.find({"name": {"$in": names}}).to_list(length=100)
    for loc in full_details:
        loc["_id"] = str(loc["_id"])
    return full_details

@app.delete("/api/save-location")
async def unsave_location(email: str = Query(...), location_name: str = Query(...)):
    await db.saved_locations.delete_one({"user_email": email, "location_name": location_name})
    return {"message": "Removed"}

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
    
    # ✅ Returns role so Hawi's profile correctly shows 'Student'
    return {
        "full_name": db_user["name"], 
        "email": db_user["email"],
        "role": db_user.get("role", "Student") 
    }

# --- 🤖 AI Navigator Route (Fuzzy & Normal Chat) ---

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip().lower()
    
    locations = await db.locations.find({}).to_list(length=100)
    names = [loc["name"] for loc in locations]
    
    # ✅ STEP 1: Fuzzy Search for misspellings
    best_match, score = process.extractOne(user_msg, names)
    
    if score > 70:
        found = next(l for l in locations if l["name"] == best_match)
        return {
            "reply": f"📍 I think you mean **{found['name']}**. Updating the map!",
            "target": {"lat": found["latitude"], "lng": found["longitude"], "name": found["name"]}
        }

    # ✅ STEP 2: AI Logic via Groq
    try:
        completion = gro_client.chat.completions.create(
            messages=[
                {
                    "role": "system", 
                    "content": f"You are the ASTU Campus Navigator. Locations: {names}. Answer naturally."
                },
                {"role": "user", "content": user_msg}
            ],
            model="llama3-8b-8192",
        )
        ai_reply = completion.choices[0].message.content.strip()
        
        # Check if AI mentioned a building
        ai_match = next((l for l in locations if l["name"].lower() in ai_reply.lower()), None)
        if ai_match:
            return {
                "reply": ai_reply,
                "target": {"lat": ai_match["latitude"], "lng": ai_match["longitude"], "name": ai_match["name"]}
            }
            
        return {"reply": ai_reply, "target": None}
            
    except Exception as e:
        print(f"Groq Error: {e}")
        
    return {"reply": "I'm sorry, I couldn't find that. Try 'Oda Nabe Hall'.", "target": None}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)