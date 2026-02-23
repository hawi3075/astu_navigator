const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');

// Import Models
const Event = require('../models/Event');
const User = require('../models/User');
const Location = require('../models/Location');

// --- 📊 STATS & USERS ---
router.get('/stats', adminCtrl.getStats); 

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.delete('/users/:id', adminCtrl.deleteUser);

// --- 📍 LOCATIONS ---
router.get('/locations', async (req, res) => {
    try {
        const locations = await Location.find().sort({ createdAt: -1 });
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch locations" });
    }
});

router.post('/locations', adminCtrl.addLocation);
router.delete('/locations/:id', adminCtrl.deleteLocation);

// --- 📅 EVENTS ---

// 1. Get Events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// 2. ✅ FIXED: Add Event (Publish Event)
router.post('/events', async (req, res) => {
    console.log("📥 Incoming Event Data:", req.body); // Check your terminal to see if data arrives
    try {
        const { title, date, location, description } = req.body;

        // Validation: Ensure all fields from your UI are present
        if (!title || !date || !location || !description) {
            return res.status(400).json({ error: "All fields (title, date, location, description) are required." });
        }

        const event = new Event({
            title,
            date,
            location,
            description
        });

        await event.save();
        console.log("✅ Event saved to DB");
        res.status(201).json({ success: true, message: "Event published successfully!", event });
    } catch (err) {
        console.error("❌ Publish Error:", err);
        res.status(400).json({ error: "Could not save event. Check if your Event model matches these fields." });
    }
});

// 3. ✅ DELETE EVENT
router.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const deletedEvent = await Event.findByIdAndDelete(id);
        
        if (!deletedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        return res.status(200).json({ success: true, message: "Event deleted" });

    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ error: "Server error during deletion" });
    }
});

module.exports = router;