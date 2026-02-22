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

// 2. Add Event
router.post('/events', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ error: "Could not save event." });
    }
});

// 3. ✅ DELETE EVENT (This fixes your 404 & JSON error)
router.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is valid format to prevent server crash
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const deletedEvent = await Event.findByIdAndDelete(id);
        
        if (!deletedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        // We MUST return JSON so the frontend doesn't see a "SyntaxError"
        return res.status(200).json({ success: true, message: "Event deleted" });

    } catch (err) {
        console.error("Delete Error:", err);
        return res.status(500).json({ error: "Server error during deletion" });
    }
});

module.exports = router;