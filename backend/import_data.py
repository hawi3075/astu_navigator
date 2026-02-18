import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# 🔌 DATABASE CONNECTION
MONGO_URI = "mongodb+srv://hawig:hawig1234@cluster0.nnfwkhs.mongodb.net/ASTU_Nav?retryWrites=true&w=majority"
client = AsyncIOMotorClient(MONGO_URI)
db = client.ASTU_Nav

astu_data = {
  "type": "FeatureCollection",
  "features": [
    { "properties": { "name": "ASTU Central Library", "category": "Academic" }, "geometry": { "coordinates": [39.2913418, 8.5609704] } },
    { "properties": { "name": "ASTU New Admin Building", "category": "Admin" }, "geometry": { "coordinates": [39.2902447, 8.5611715] } },
    { "properties": { "name": "Female Students Library", "category": "Academic" }, "geometry": { "coordinates": [39.2925, 8.5605] } },
    { "properties": { "name": "Oda Nabe Hall", "category": "Hall" }, "geometry": { "coordinates": [39.2915, 8.5645] } } # Added missing coords
  ]
}

async def seed_db():
    print("🧹 Cleaning old locations...")
    await db.locations.delete_many({})
    
    formatted_docs = []
    for feature in astu_data["features"]:
        props = feature["properties"]
        geom = feature.get("geometry", {}).get("coordinates", [39.2908, 8.5615])
        
        formatted_docs.append({
            "name": props["name"],
            "category": props["category"],
            "latitude": geom[1],  # GeoJSON is [lng, lat]
            "longitude": geom[0],
            "description": props.get("description", "")
        })
    
    if formatted_docs:
        await db.locations.insert_many(formatted_docs)
        print(f"✅ Successfully imported {len(formatted_docs)} locations!")

if __name__ == "__main__":
    asyncio.run(seed_db())