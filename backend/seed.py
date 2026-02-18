import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# 🔌 DATABASE CONNECTION
MONGO_URI = "mongodb+srv://hawig:hawig1234@cluster0.nnfwkhs.mongodb.net/ASTU_Nav?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav

astu_data = [
    {"name": "ASTU Central Library", "latitude": 8.5609704, "longitude": 39.2913418, "category": "Academic"},
    {"name": "ASTU New Admin Building", "latitude": 8.5611715, "longitude": 39.2902447, "category": "Admin"},
    {"name": "Material Science and Engineering School", "latitude": 8.5613998, "longitude": 39.2890518, "category": "Academic"},
    {"name": "Female Students Library", "latitude": 8.5605, "longitude": 39.2925, "category": "Academic"},
    {"name": "Oda Nabe Hall", "latitude": 8.5645, "longitude": 39.2915, "category": "Hall"},
    {"name": "Freshman Block", "latitude": 8.5631, "longitude": 39.2905, "category": "Academic"},
    {"name": "Block 304", "latitude": 8.5620, "longitude": 39.2930, "category": "Academic Block"}
]

async def seed_database():
    print("🧹 Cleaning existing locations...")
    await db.locations.delete_many({}) # Clears out the wrong 'block 304' entry
    
    print("🚀 Inserting campus data...")
    result = await db.locations.insert_many(astu_data)
    print(f"✅ Successfully inserted {len(result.inserted_ids)} locations!")

if __name__ == "__main__":
    asyncio.run(seed_database())