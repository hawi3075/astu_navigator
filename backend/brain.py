import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Initialize Groq Client (Free & Fast!)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_astu_bot(user_question):
    # Load your ASTU data
    try:
        with open('astu_data.json', 'r', encoding='utf-8') as file:
            campus_data = json.load(file)
    except FileNotFoundError:
        return "Error: astu_data.json not found."

    context = json.dumps(campus_data)
    
    try:
        # Use Llama 3 - powerful and completely free on Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"You are the ASTU Navigator. Use this data ONLY: {context}"
                },
                {
                    "role": "user",
                    "content": user_question,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Groq Error: {e}"

if __name__ == "__main__":
    print(ask_astu_bot("Where is the registrar office?"))