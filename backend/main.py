import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from thefuzz import process 
import uvicorn

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# 🛡️ CORS setup - Critical for Vite (5173) to communicate with FastAPI (8000)
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

# Validate API Key existence
if not GROQ_API_KEY:
    print("❌ ERROR: GROQ_API_KEY not found in environment variables!")

client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav
gro_client = Groq(api_key=GROQ_API_KEY)

# --- Helper to serialize MongoDB docs ---
def fix_id(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SaveLocationRequest(BaseModel):
    user_email: EmailStr
    location_name: str

# --- 🚀 Routes ---

@app.get("/api/events")
async def get_all_events():
    events = await db.events.find().to_list(length=100)
    return [fix_id(e) for e in events]

@app.get("/api/clubs")
async def get_all_clubs():
    clubs = await db.clubs.find().to_list(length=100)
    return [fix_id(c) for c in clubs]

@app.get("/api/admin/locations_list")
async def get_all_locations():
    locs = await db.locations.find().to_list(length=100)
    return [fix_id(l) for l in locs]

@app.post("/api/save-location")
async def save_location(request: SaveLocationRequest):
    await db.saved_locations.update_one(
        {"user_email": request.user_email, "location_name": request.location_name},
        {"$set": request.model_dump()},
        upsert=True
    )
    return {"message": "Saved successfully"}

@app.delete("/api/save-location")
async def remove_location(email: str, location_name: str):
    result = await db.saved_locations.delete_one({"user_email": email, "location_name": location_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Removed successfully"}

@app.get("/api/saved-locations/{email}")
async def get_saved_locations(email: str):
    saved_docs = await db.saved_locations.find({"user_email": email}).to_list(length=100)
    names = [doc["location_name"] for doc in saved_docs]
    full_details = await db.locations.find({"name": {"$in": names}}).to_list(length=100)
    return [fix_id(loc) for loc in full_details]

@app.post("/api/register")
async def register_user(user: RegisterRequest):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    await db.users.insert_one(user.model_dump())
    return {"message": "Registration Successful"}

@app.post("/api/login")
async def login_user(user: LoginRequest):
    db_user = await db.users.find_one({"email": user.email.lower()})
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "name": db_user.get("name", "ASTU User"), 
        "email": db_user["email"],
        "role": db_user.get("role", "user").lower() 
    }

# --- 🤖 AI Navigator with Enhanced Matching ---

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip().lower()
    locations = await db.locations.find({}).to_list(length=200)
    names = [loc["name"] for loc in locations]
    
    # Helper to safely extract coordinates regardless of naming convention
    def get_coords(loc_obj):
        # Checks for 'latitude' or 'lat' or 'coordinates' array
        lat = loc_obj.get("latitude") or loc_obj.get("lat")
        lng = loc_obj.get("longitude") or loc_obj.get("lng")
        
        if lat is None and "coordinates" in loc_obj:
            lat = loc_obj["coordinates"][0]
            lng = loc_obj["coordinates"][1]
        return lat, lng

    # 1. Fuzzy match check
    if names:
        best_match, score = process.extractOne(user_msg, names)
        if score > 85:
            found = next(l for l in locations if l["name"] == best_match)
            lat, lng = get_coords(found)
            return {
                "reply": f"📍 Moving map to **{found['name']}**.",
                "target": {"lat": lat, "lng": lng, "name": found["name"]}
            }

    # 2. AI completion
    try:
        completion = gro_client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"You are the ASTU Navigator AI. Help students find buildings. Campus buildings available: {', '.join(names)}. Always mention the specific building name if found."},
                {"role": "user", "content": user_msg}
            ],
            model="llama-3.3-70b-versatile",
        )
        ai_reply = completion.choices[0].message.content
        
        # Cross-reference AI reply with DB names
        ai_match = next((l for l in locations if l["name"].lower() in ai_reply.lower()), None)
        
        target_data = None
        if ai_match:
            lat, lng = get_coords(ai_match)
            target_data = {"lat": lat, "lng": lng, "name": ai_match["name"]}

        return {
            "reply": ai_reply,
            "target": target_data
        }
    except Exception as e:
        print(f"Groq API Error: {e}")
        return {"reply": "I'm having a bit of trouble connecting to my AI core, but I can still help you find buildings by name!", "target": None}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)