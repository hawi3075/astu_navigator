import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# 🔌 DATABASE CONNECTION
MONGO_URI = "mongodb+srv://hawig:hawig1234@cluster0.nnfwkhs.mongodb.net/ASTU_Nav?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav

# 📍 THE CORRECT DATA
# These coordinates point exactly to the ASTU Campus in Adama.
astu_locations = [
    {
        "name": "ASTU New Admin Building",
        "latitude": 8.56117,
        "longitude": 39.29024,
        "category": "Admin",
        "description": "Main administrative office of the university."
    },
    {
        "name": "Oda Nabe Hall",
        "latitude": 8.56450,
        "longitude": 39.29150,
        "category": "Hall",
        "description": "Large auditorium for graduation and events."
    },
    {
        "name": "ASTU Central Library",
        "latitude": 8.56097,
        "longitude": 39.29134,
        "category": "Academic",
        "description": "Main research and study hub."
    },
    {
        "name": "Female Students Library",
        "latitude": 8.56050,
        "longitude": 39.29250,
        "category": "Academic",
        "description": "Library facility dedicated to female students."
    },
    {
        "name": "Block 304",
        "latitude": 8.56200,
        "longitude": 39.29300,
        "category": "Academic Block",
        "description": "Classroom building located in the north-east sector."
    }
]

async def save_correct_data():
    try:
        # 1. Clear the collection first to remove the "Nigerian Desert" coordinates
        print("🧹 Deleting old/wrong data...")
        await db.locations.delete_many({})
        
        # 2. Insert the fresh, correct data
        print("💾 Saving correct campus data to MongoDB...")
        result = await db.locations.insert_many(astu_locations)
        
        print(f"✅ Success! Saved {len(result.inserted_ids)} locations to the database.")
        
    except Exception as e:
        print(f"❌ Error saving data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(save_correct_data())