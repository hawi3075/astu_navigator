import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
import uvicorn

# 1. Load Environment Variables
load_dotenv()

app = FastAPI()

# 🛡️ CORS setup: Essential for React frontend communication
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

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SaveLocationRequest(BaseModel):
    user_email: EmailStr
    location_name: str

# --- 🚀 Campus Hub Routes ---

@app.get("/api/events")
async def get_all_events():
    """Fetches events for Campus.jsx."""
    events = await db.events.find().to_list(length=100)
    for e in events:
        e["_id"] = str(e["_id"])
    return events

@app.get("/api/clubs")
async def get_all_clubs():
    """Fetches clubs for Campus.jsx."""
    clubs = await db.clubs.find().to_list(length=100)
    for c in clubs:
        c["_id"] = str(c["_id"])
    return clubs

# --- 📍 Map & Location Routes ---

@app.get("/api/admin/locations_list")
async def get_all_locations():
    """Provides all map markers."""
    locs = await db.locations.find().to_list(length=100)
    for l in locs:
        l["_id"] = str(l["_id"])
    return locs

@app.post("/api/save-location")
async def save_location(request: SaveLocationRequest):
    """Saves a building to favorites."""
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
    """Retrieves user's saved buildings."""
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
    
    return {
        "user": {
            "full_name": db_user["name"], 
            "email": db_user["email"]
        }
    }

# --- 🤖 AI Navigator Route (UPDATED & FIXED) ---

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip().lower()
    
    # 1. Handle Greetings (Fixes "hi" error)
    greetings = ["hi", "hello", "hey", "yo", "good morning", "good afternoon"]
    if user_msg in greetings:
        return {
            "reply": "Hello there! I'm your ASTU Campus Assistant. How can I help you navigate today?",
            "target": None
        }

    # 2. Get all locations from MongoDB
    locations = await db.locations.find({}).to_list(length=100)
    names = [loc["name"] for loc in locations]
    
    # 3. Quick Database Search (Fixes "Oda Nabe" error)
    # This checks if the user's message matches or contains any building name in the DB
    found = next((l for l in locations if l["name"].lower() in user_msg or user_msg in l["name"].lower()), None)
    
    if found:
        return {
            "reply": f"📍 I've found **{found['name']}** for you! I'm updating your map now.",
            "target": {"lat": found["latitude"], "lng": found["longitude"], "name": found["name"]}
        }

    # 4. Groq AI Logic (Fallback)
    try:
        completion = gro_client.chat.completions.create(
            messages=[
                {
                    "role": "system", 
                    "content": f"You are the ASTU Navigator. Choose from: {names}. If the user is looking for a place, reply ONLY with the exact name. If it's a general question, answer briefly."
                },
                {"role": "user", "content": user_msg}
            ],
            model="llama3-8b-8192",
        )
        extracted = completion.choices[0].message.content.strip()
        
        # Check if AI's choice exists in our database
        ai_match = next((l for l in locations if l["name"].lower() == extracted.lower()), None)
        
        if ai_match:
            return {
                "reply": f"📍 Finding **{ai_match['name']}**. Marking it on the map.",
                "target": {"lat": ai_match["latitude"], "lng": ai_match["longitude"], "name": ai_match["name"]}
            }
        else:
            # If AI gives a general response that isn't a building name
            return {"reply": extracted, "target": None}
            
    except Exception as e:
        print(f"Groq Error: {e}")
        
    return {"reply": "I'm sorry, I couldn't find that building in the ASTU records. Try typing 'Oda Nabe Hall'.", "target": None}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)