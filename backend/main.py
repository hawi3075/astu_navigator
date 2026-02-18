import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
import uvicorn

# 1. Load secrets from .env
load_dotenv()

app = FastAPI()

# 🛡️ CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 SECURE CREDENTIALS
MONGO_URI = os.getenv("MONGO_URI")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav
gro_client = Groq(api_key=GROQ_API_KEY)

# --- MODELS ---
class ChatRequest(BaseModel):
    message: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class EventRequest(BaseModel):
    title: str
    date: str
    location: str
    description: str

class ClubRequest(BaseModel):
    name: str
    category: str
    description: str

# --- 🚀 AUTOMATIC DATABASE SEEDING ---
@app.on_event("startup")
async def seed_data():
    """Ensures the database is populated with campus locations on start."""
    count = await db.locations.count_documents({})
    if count < 10:
        print("💾 Seeding database...")
        await db.locations.delete_many({}) 
        all_places = [
            {"name": "ASTU New Admin Building", "latitude": 8.56117, "longitude": 39.29024, "category": "Admin"},
            {"name": "Oda Nabe Hall", "latitude": 8.56450, "longitude": 39.29150, "category": "Hall"},
            {"name": "ASTU Central Library", "latitude": 8.56097, "longitude": 39.29134, "category": "Library"},
            {"name": "Female Students Library", "latitude": 8.56050, "longitude": 39.29250, "category": "Library"},
            {"name": "Block 304", "latitude": 8.56200, "longitude": 39.29300, "category": "Academic Block"},
            {"name": "Red Sea Dormitory", "latitude": 8.56400, "longitude": 39.28850, "category": "Dormitory"},
            {"name": "Kilimanjaro Dormitory", "latitude": 8.56520, "longitude": 39.28900, "category": "Dormitory"},
            {"name": "ASTU Health Center", "latitude": 8.55950, "longitude": 39.29100, "category": "Health"},
            {"name": "Student Cafeteria 1", "latitude": 8.56350, "longitude": 39.28950, "category": "Dining"},
            {"name": "ICT Center", "latitude": 8.56150, "longitude": 39.29180, "category": "Academic"},
            {"name": "Post Office", "latitude": 8.56020, "longitude": 39.29000, "category": "Service"},
            {"name": "School of Applied Natural Sciences", "latitude": 8.56250, "longitude": 39.29050, "category": "Academic"}
        ]
        await db.locations.insert_many(all_places)
        print(f"✅ Saved {len(all_places)} locations.")

# --- AUTH ROUTES ---
@app.post("/api/register")
async def register_user(user: RegisterRequest):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    await db.users.insert_one(user.model_dump())
    return {"message": "Registration Successful!"}

@app.post("/api/login")
async def login_user(user: LoginRequest):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"user": {"name": db_user["name"], "email": db_user["email"]}}

# --- 📅 CAMPUS DATA ROUTES (Events, Clubs, Blocks) ---

@app.get("/api/events")
async def get_events():
    events = await db.events.find().to_list(length=100)
    for e in events: e["_id"] = str(e["_id"])
    return events

@app.post("/api/admin/events")
async def add_event(event: EventRequest):
    await db.events.insert_one(event.model_dump())
    return {"message": "Event created successfully!"}

@app.get("/api/clubs")
async def get_clubs():
    clubs = await db.clubs.find().to_list(length=100)
    for c in clubs: c["_id"] = str(c["_id"])
    return clubs

@app.post("/api/admin/clubs")
async def add_club(club: ClubRequest):
    await db.clubs.insert_one(club.model_dump())
    return {"message": "Club added successfully!"}

@app.get("/api/blocks")
async def get_blocks():
    # Specifically filters for Academic Blocks for the 'Blocks' card
    blocks = await db.locations.find({"category": "Academic Block"}).to_list(length=100)
    for b in blocks: b["_id"] = str(b["_id"])
    return blocks

@app.get("/api/admin/locations_list")
async def get_locations():
    data = []
    async for loc in db.locations.find():
        loc["_id"] = str(loc["_id"])
        data.append(loc)
    return data

# --- 🚀 SMART AI CHAT WITH GROQ ---
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.strip()
    cursor = db.locations.find({})
    locations = await cursor.to_list(length=100)
    location_names = [loc["name"] for loc in locations]
    
    try:
        chat_completion = gro_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are a campus navigator for ASTU. Identify the building. Choose ONLY from: {location_names}. Reply with ONLY the building name. If no match, reply 'NONE'."
                },
                {"role": "user", "content": user_msg}
            ],
            model="llama3-8b-8192",
        )
        extracted_name = chat_completion.choices[0].message.content.strip()
        found_loc = next((loc for loc in locations if loc["name"].lower() == extracted_name.lower()), None)

        if found_loc:
            return {
                "reply": f"📍 I found **{found_loc['name']}**! Updating your map now.",
                "target": {"lat": found_loc["latitude"], "lng": found_loc["longitude"], "name": found_loc["name"]}
            }
    except Exception as e:
        print(f"Groq Error: {e}")

    return {"reply": "I couldn't find that place. Try 'Oda Nabe' or 'Red Sea'.", "target": None}

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)