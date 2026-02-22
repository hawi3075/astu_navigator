const User = require('../models/User');
const Event = require('../models/Event');
const Location = require('../models/Location');

// --- 📊 GET DASHBOARD STATS ---
exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const events = await Event.countDocuments();
    const points = await Location.countDocuments();
    
    // Ensure keys match what Frontend expects: { users, events, points }
    res.json({ users, events, points }); 
  } catch (err) { 
    res.status(500).json({ error: "Failed to fetch stats" }); 
  }
};

// --- 👥 USER MANAGEMENT ---
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    
    res.json({ message: "User removed successfully" });
  } catch (err) { 
    res.status(500).json({ error: "Delete failed" }); 
  }
};

// --- 📍 LOCATION MANAGEMENT (The "Manage" Part) ---
exports.addLocation = async (req, res) => {
  try {
    const { name, lat, lng, category, description } = req.body;

    // 🛡️ Safety Check: Convert to numbers in case frontend sends strings
    const numericLat = parseFloat(lat);
    const numericLng = parseFloat(lng);

    if (!name || isNaN(numericLat) || isNaN(numericLng)) {
      return res.status(400).json({ error: "Valid Name, Lat, and Lng are required" });
    }

    const newLoc = new Location({
      name,
      lat: numericLat,
      lng: numericLng,
      category: category || "Academic Block",
      description: description || ""
    });

    await newLoc.save();
    res.status(201).json(newLoc);
  } catch (err) {
    console.error("Save Error:", err.message);
    // If name is duplicate, MongoDB throws error code 11000
    if (err.code === 11000) {
      return res.status(400).json({ error: "A location with this name already exists" });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted successfully" });
  } catch (err) { 
    res.status(500).json({ error: "Failed to delete location" }); 
  }
};

// --- 📅 EVENT MANAGEMENT ---
exports.addEvent = async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    if (!title || !date) {
        return res.status(400).json({ error: "Title and Date are required" });
    }
    const newEvent = new Event({ title, date, location, description });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: "Could not publish event" });
  }
};