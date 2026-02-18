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
    description: str = ""

class ChatRequest(BaseModel):
    message: str

# --- AUTH ROUTES ---

@app.post("/api/register")
async def register_user(user: RegisterRequest):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
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

# --- ADMIN ROUTES ---

@app.get("/api/admin/locations_list")
async def get_locations():
    locations = []
    async for loc in db.locations.find():
        loc["_id"] = str(loc["_id"])
        locations.append(loc)
    return locations

@app.post("/api/admin/locations")
async def add_location(loc: LocationRequest):
    await db.locations.insert_one(loc.model_dump())
    return {"message": "Location added successfully!"}

# --- 🚀 BULLETPROOF AI CHAT ROUTE ---

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.lower().strip()
    
    # 1. Fetch all locations from DB to perform fuzzy matching
    cursor = db.locations.find({})
    locations = await cursor.to_list(length=200)
    
    # 2. Define "Filler" words to ignore
    fillers = {"where", "is", "the", "find", "show", "me", "locate", "search", "for", "a", "an"}
    query_words = [w for w in user_msg.split() if w not in fillers]
    
    found_loc = None

    # 3. Smart Search Logic
    for loc in locations:
        loc_name = loc["name"].lower()
        
        # Scenario A: Exact name is mentioned in the message (Best match)
        # e.g., "Tell me where Oda Nabe Hall is" matches "Oda Nabe Hall"
        if loc_name in user_msg:
            found_loc = loc
            break
        
        # Scenario B: Check if any significant word from the user matches the DB
        # e.g., "oda" or "nabe" matches "Oda Nabe Hall"
        if any(word in loc_name for word in query_words if len(word) > 2):
            found_loc = loc
            break

    if found_loc:
        return {
            "reply": f"📍 I found **{found_loc['name']}**! I've updated your map and drawn the navigation path.",
            "target": {
                "lat": found_loc["latitude"],
                "lng": found_loc["longitude"],
                "name": found_loc["name"]
            }
        }
    
    # 4. Fallback Suggestion
    example = locations[0]["name"] if locations else "Oda Nabe Hall"
    return {
        "reply": f"I'm sorry, I couldn't find a match for '{user_msg}'. Please try using the specific building name like '{example}'.",
        "target": None
    }

if __name__ == "__main__":
    uvicorn.run("main:app", port=8000, reload=True)