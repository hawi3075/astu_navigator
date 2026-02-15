from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from brain import ask_astu_bot

app = FastAPI()

# 🛡️ THE FIX: This tells the browser to allow port 5174 to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    text: str

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    # This calls your Groq 'brain.py' code
    answer = ask_astu_bot(request.text)
    return {"reply": answer}