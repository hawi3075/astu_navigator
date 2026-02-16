from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from brain import ask_astu_bot

app = FastAPI()

# 🛡️ CORS: Allowing your frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 DATABASE CONNECTION
MONGO_URI = "mongodb+srv://hawig:hawig1234@cluster0.nnfwkhs.mongodb.net/ASTU_Nav?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav
users_collection = db.users

# --- DATA MODELS ---

class ChatRequest(BaseModel):
    text: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"  # Default role for new sign-ups

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LocationRequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    category: str
    description: str

class CampusEvent(BaseModel):
    title: str
    date: str
    description: str

# --- AUTH ROUTES ---

@app.post("/api/register")
async def register_user(user: RegisterRequest):
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Use more than six characters for your password.")
    
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")

    user_data = user.dict()
    # Logic: If this specific email registers, make them admin automatically
    if user.email == "admin@astu.edu.et":
        user_data["role"] = "admin"

    await users_collection.insert_one(user_data)
    return {"message": "Account created successfully!"}

@app.post("/api/login")
async def login_user(user: LoginRequest):
    # Search for user by email
    db_user = await users_collection.find_one({"email": user.email})
    
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Return user details so Frontend knows where to redirect
    return {
        "message": "Login successful",
        "user": {
            "name": db_user["name"],
            "email": db_user["email"],
            "role": db_user.get("role", "user") # Returns "admin" or "user"
        }
    }

# --- ADMIN ROUTES ---

@app.post("/api/admin/locations")
async def add_location(location: LocationRequest):
    await db.locations.insert_one(location.dict())
    return {"message": f"Location '{location.name}' added successfully!"}

@app.delete("/api/admin/locations/{loc_id}")
async def delete_location(loc_id: str):
    result = await db.locations.delete_one({"_id": ObjectId(loc_id)})
    if result.deleted_count == 1:
        return {"message": "Location deleted successfully"}
    raise HTTPException(status_code=404, detail="Location not found")

@app.post("/api/admin/events")
async def create_event(event: CampusEvent):
    await db.events.insert_one(event.dict())
    return {"message": "Event posted to Campus page!"}

# --- USER ROUTES ---

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    answer = ask_astu_bot(request.text)
    return {"reply": answer}