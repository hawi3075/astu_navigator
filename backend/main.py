import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from thefuzz import process 
import uvicorn

# 1. Load Environment Variables
load_dotenv()

app = FastAPI()

# 2. 🛡️ THE FINAL CORS FIX
# This allows your Vercel site to communicate with this backend.
origins = [
    "http://localhost:5173",
    "https://astu-navigator-ysgh.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. 🔌 Connections
MONGO_URI = os.getenv("MONGO_URI")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav
gro_client = Groq(api_key=GROQ_API_KEY)

def fix_id(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

# 4. --- Pydantic Models ---
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

# 5. --- 🚀 Routes ---

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
        {"user_email": request.user_email.lower(), "location_name": request.location_name},
        {"$set": request.model_dump()},
        upsert=True
    )
    return {"message": "Saved successfully"}

@app.delete("/api/save-location")
async def remove_location(email: str, location_name: str):
    result = await db.saved_locations.delete_one({"user_email": email.lower(), "location_name": location_name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Removed successfully"}

@app.get("/api/saved-locations/{email}")
async def get_saved_locations(email: str):
    saved_docs = await db.saved_locations.find({"user_email": email.lower()}).to_list(length=100)
    names = [doc["location_name"] for doc in saved_docs]
    full_details = await db.locations.find({"name": {"$in": names}}).to_list(length=100)
    return [fix_id(loc) for loc in full_details]

@app.post("/api/register")
async def register_user(user: RegisterRequest):
    user_data = user.model_dump()
    user_data["email"] = user.email.lower()
    if await db.users.find_one({"email": user_data["email"]}):
        raise HTTPException(status_code=400, detail="User already exists")
    await db.users.insert_one(user_data)
    return {"message": "Registration Successful"}

@app.post("/api/login")
async def login_user(user: LoginRequest):
    db_user = await db.users.find_one({"email": user.email.lower()})
    if not db_user or str(db_user["password"]) != str(user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "name": db_user.get("name", "ASTU User"), 
        "email": db_user["email"],
        "role": db_user.get("role", "user").lower() 
    }

# 6. --- 🤖 AI Navigator ---
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip().lower()
    try:
        locations = await db.locations.find({}).to_list(length=200)
        names = [loc["name"] for loc in locations]
        
        # 1. Fuzzy Match
        if names:
            best_match, score = process.extractOne(user_msg, names)
            if score > 85:
                found = next(l for l in locations if l["name"] == best_match)
                return {
                    "reply": f"📍 Moving map to **{found['name']}**.",
                    "target": {"lat": found.get("latitude"), "lng": found.get("longitude"), "name": found["name"]}
                }

        # 2. AI Fallback
        completion = gro_client.chat.completions.create(
            messages=[
                {"role": "system", "content": f"You are the ASTU Navigator AI. Campus buildings: {', '.join(names)}."},
                {"role": "user", "content": user_msg}
            ],
            model="llama-3.3-70b-versatile",
        )
        ai_reply = completion.choices[0].message.content
        ai_match = next((l for l in locations if l["name"].lower() in ai_reply.lower()), None)
        
        target_data = None
        if ai_match:
            target_data = {"lat": ai_match.get("latitude"), "lng": ai_match.get("longitude"), "name": ai_match["name"]}

        return {"reply": ai_reply, "target": target_data}
    except Exception:
        return {"reply": "AI Navigator is offline. Please try again later.", "target": None}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)