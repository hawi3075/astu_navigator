const User = require('../models/User');
const Event = require('../models/Event');
const Location = require('../models/Location');

// --- 📊 GET DASHBOARD STATS ---
exports.getStats = async (req, res) => {
    try {
        // Run counts in parallel for better performance
        const [totalUsers, activeEvents, totalBlocks] = await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            Location.countDocuments()
        ]);

        // These keys MUST match your AdminStats.jsx state
        res.json({ 
            totalUsers: totalUsers || 0, 
            totalBlocks: totalBlocks || 0, 
            activeEvents: activeEvents || 0 
        }); 
    } catch (err) { 
        console.error("Stats Fetch Error:", err);
        // Ensure we send JSON even on error so the frontend doesn't crash
        res.status(500).json({ 
            totalUsers: 0, 
            totalBlocks: 0, 
            activeEvents: 0,
            error: "Internal Server Error" 
        }); 
    }
};

// --- 👥 USER MANAGEMENT ---
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User removed successfully" });
    } catch (err) { 
        res.status(500).json({ error: "Delete failed" }); 
    }
};

// --- 📍 LOCATION MANAGEMENT ---
exports.addLocation = async (req, res) => {
    try {
        const { name, lat, lng, category, description } = req.body;

        // Force numeric conversion to prevent Mongoose validation errors
        const numericLat = Number(lat);
        const numericLng = Number(lng);

        if (!name || isNaN(numericLat) || isNaN(numericLng)) {
            return res.status(400).json({ error: "Name, Latitude, and Longitude are required" });
        }

        const newLoc = new Location({
            name: name.trim(),
            lat: numericLat,
            lng: numericLng,
            category: category || "Academic Block",
            description: description || ""
        });

        await newLoc.save();
        res.status(201).json(newLoc);
    } catch (err) {
        console.error("Save Error:", err.message);
        if (err.code === 11000) {
            return res.status(400).json({ error: "A building with this name already exists" });
        }
        res.status(400).json({ error: err.message });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Location.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: "Point not found" });
        }
        res.json({ message: "Location deleted successfully" });
    } catch (err) { 
        res.status(500).json({ error: "Failed to delete location" }); 
    }
};

// --- 📅 EVENT MANAGEMENT ---
exports.addEvent = async (req, res) => {
    try {
        const { title, date, location, description } = req.body;
        
        if (!title || !date || !location) {
            return res.status(400).json({ error: "Title, Date, and Location are required" });
        }

        const newEvent = new Event({ 
            title: title.trim(), 
            date, 
            location: location.trim(), 
            description: description || "Campus Event" 
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) {
        console.error("Event Save Error:", err.message);
        res.status(400).json({ error: "Could not publish event. Check the date format." });
    }
};