const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');

// ------------------------------------------------------------------
// 📍 1. GET SAVED LOCATIONS (Matches your 'saved_locations' collection)
// ------------------------------------------------------------------
router.get('/saved-locations/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        
        // Directly query the collection shown in your screenshot
        const locations = await mongoose.connection.collection('saved_locations')
            .find({ user_email: email })
            .toArray();

        // Format the data so the frontend 'SavedPage' can read it
        const formattedData = locations.map(loc => ({
            _id: loc._id,
            name: loc.location_name,
            category: "Campus Spot", // Default since it's missing in your DB
            savedAt: loc._id.getTimestamp() 
        }));

        console.log(`✅ Found ${formattedData.length} spots for: ${email}`);
        res.status(200).json(formattedData);
    } catch (err) {
        console.error("❌ Fetch Error:", err);
        res.status(500).json({ error: "Server error fetching locations" });
    }
});

// ------------------------------------------------------------------
// 📍 2. SAVE A NEW LOCATION (Inserts into 'saved_locations')
// ------------------------------------------------------------------
router.post('/save-location', authMiddleware, async (req, res) => {
    try {
        const { email, location } = req.body;
        
        if (!email || !location?.name) {
            return res.status(400).json({ error: "Email and Location Name required" });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Prevent duplicate saves for the same building for the same user
        const existing = await mongoose.connection.collection('saved_locations').findOne({
            user_email: cleanEmail,
            location_name: location.name
        });

        if (existing) {
            return res.status(400).json({ error: "Location already saved" });
        }

        // Insert into the collection exactly as seen in your screenshot
        const result = await mongoose.connection.collection('saved_locations').insertOne({
            user_email: cleanEmail,
            location_name: location.name,
            created_at: new Date()
        });

        res.status(201).json({ 
            message: "Saved successfully", 
            insertedId: result.insertedId 
        });
    } catch (err) {
        console.error("❌ Save Error:", err);
        res.status(500).json({ error: "Failed to save location" });
    }
});

// ------------------------------------------------------------------
// 📍 3. REMOVE SAVED POINT
// ------------------------------------------------------------------
router.delete('/saved-points/:id', authMiddleware, async (req, res) => {
    try {
        const result = await mongoose.connection.collection('saved_locations').deleteOne({
            _id: new mongoose.Types.ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Point not found" });
        }

        res.status(200).json({ message: "Removed successfully" });
    } catch (err) {
        console.error("❌ Delete Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

module.exports = router;