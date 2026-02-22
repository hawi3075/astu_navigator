const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');

// Import Models directly for the inline routes
const Event = require('../models/Event');
const User = require('../models/User');
const Location = require('../models/Location');

// --- 📊 STATS & USERS ---
// Uses the controller function we fixed earlier
router.get('/stats', adminCtrl.getStats); 

// Get all users (excluding passwords for security)
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
// Get all campus points
router.get('/locations', async (req, res) => {
    try {
        const locations = await Location.find().sort({ createdAt: -1 });
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch locations" });
    }
});

// Use the controller for adding/deleting (handles coordinate conversion)
router.post('/locations', adminCtrl.addLocation);
router.delete('/locations/:id', adminCtrl.deleteLocation);

// --- 📅 EVENTS ---
// Get all scheduled events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// Inline POST for events with error handling
router.post('/events', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ error: "Could not save event. Check date format." });
    }
});

// ✅ ADDED: DELETE route for events (This fixes the delete icon not working)
router.delete('/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);
        
        if (!deletedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete event" });
    }
});

module.exports = router;