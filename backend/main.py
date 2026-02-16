from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from brain import ask_astu_bot

app = FastAPI()

# 🛡️ CORS FIX: Matches the port 5173 seen in your browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔌 DATABASE CONNECTION
# Using the credentials from your Culture Nest project
MONGO_URI = "mongodb+srv://hawig:hawig1234@cluster0.nnfwkhs.mongodb.net/ASTU_Nav?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav
users_collection = db.users

# DATA MODELS
class ChatRequest(BaseModel):
    text: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr # Automates "if it invalid email the email is incorect"
    password: str

# --- ROUTES ---

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    answer = ask_astu_bot(request.text)
    return {"reply": answer}

@app.post("/api/register")
async def register_user(user: RegisterRequest):
    # 1. Password Length Check
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Use more than six characters for your password.")

    # 2. Duplicate Check
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")

    # 3. Save to MongoDB
    user_data = user.dict()
    await users_collection.insert_one(user_data)
    
    return {"message": "Account created successfully!"}