import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from thefuzz import process  # ✅ Vital for typo support
import uvicorn

# 1. Load Environment Variables
load_dotenv()

app = FastAPI()

# 🛡️ FIX: Explicit CORS for your Vite Frontend
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
    role: str = "Student" # ✅ Default role for Hawi's profile

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SaveLocationRequest(BaseModel):
    user_email: EmailStr
    location_name: str

# --- 🚀 Campus Hub Routes (Events & Clubs) ---

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
    
    # ✅ FIX: Explicitly returns "Student" so Hawi's profile works
    return {
        "full_name": db_user.get("name", "ASTU User"), 
        "email": db_user["email"],
        "role": db_user.get("role", "Student") 
    }

# --- 🤖 AI Navigator Route (Fuzzy & Normal Chat) ---

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip().lower()
    
    locations = await db.locations.find({}).to_list(length=100)
    names = [loc["name"] for loc in locations]
    
    # ✅ STEP 1: Fuzzy Search (Handles misspellings like 'noda nabe')
    best_match, score = process.extractOne(user_msg, names)
    
    if score > 75:
        found = next(l for l in locations if l["name"] == best_match)
        return {
            "reply": f"📍 Moving map to **{found['name']}**.",
            "target": {"lat": found["latitude"], "lng": found["longitude"], "name": found["name"]}
        }

    # ✅ STEP 2: AI Logic via Groq
    try:
        completion = gro_client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"You are the ASTU Navigator. Locations: {names}."},
                {"role": "user", "content": user_msg}
            ],
            model="llama3-8b-8192",
        )
        ai_reply = completion.choices[0].message.content.strip()
        
        # Link AI response back to map coordinates if a building is mentioned
        ai_match = next((l for l in locations if l["name"].lower() in ai_reply.lower()), None)
        if ai_match:
            return {
                "reply": ai_reply,
                "target": {"lat": ai_match["latitude"], "lng": ai_match["longitude"], "name": ai_match["name"]}
            }
            
        return {"reply": ai_reply, "target": None}
            
    except Exception as e:
        return {"reply": "Connection to AI lost.", "target": None}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)