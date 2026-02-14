import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

print("--- Your Active 2026 Models ---")
for model in client.models.list():
    # In the new SDK, model names are just strings like 'gemini-2.0-flash'
    print(f"AVAILABLE: {model.name}")