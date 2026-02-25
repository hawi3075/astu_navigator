const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');

// ------------------------------------------------------------------
// 📍 1. GET SAVED LOCATIONS
// ------------------------------------------------------------------
// Note: We use authMiddleware here to ensure users only see their own data
router.get('/saved-locations/:email', authMiddleware, async (req, res) => {
    try {
        const email = req.params.email.toLowerCase().trim();
        
        // Security Check: Ensure the logged-in user matches the email being requested
        if (req.user.email && req.user.email !== email) {
            return res.status(403).json({ error: "Unauthorized access to these records" });
        }

        const locations = await mongoose.connection.collection('saved_locations')
            .find({ user_email: email })
            .toArray();

        // Format for Frontend: Mapping DB fields to React component props
        const formattedData = locations.map(loc => ({
            _id: loc._id,
            name: loc.location_name,
            category: loc.category || "Campus Spot",
            savedAt: loc.created_at || loc._id.getTimestamp() 
        }));

        console.log(`✅ Sync: Found ${formattedData.length} spots for ${email}`);
        res.status(200).json(formattedData);
    } catch (err) {
        console.error("❌ Fetch Error:", err);
        res.status(500).json({ error: "Server error fetching locations" });
    }
});

// ------------------------------------------------------------------
// 📍 2. SAVE A NEW LOCATION
// ------------------------------------------------------------------
router.post('/save-location', authMiddleware, async (req, res) => {
    try {
        const { email, location } = req.body;
        
        if (!email || !location?.name) {
            return res.status(400).json({ error: "Email and Location Name required" });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Duplicate Check: Prevent multiple entries for the same spot
        const existing = await mongoose.connection.collection('saved_locations').findOne({
            user_email: cleanEmail,
            location_name: location.name
        });

        if (existing) {
            return res.status(400).json({ error: "You have already saved this location" });
        }

        // Insert Document: Structure matches your screenshot precisely
        const result = await mongoose.connection.collection('saved_locations').insertOne({
            user_email: cleanEmail,
            location_name: location.name,
            category: location.category || "Campus Spot",
            created_at: new Date()
        });

        res.status(201).json({ 
            message: "Location saved successfully", 
            insertedId: result.insertedId 
        });
    } catch (err) {
        console.error("❌ Save Error:", err);
        res.status(500).json({ error: "Failed to save location to database" });
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
            return res.status(404).json({ error: "Point not found or already removed" });
        }

        res.status(200).json({ message: "Location removed successfully" });
    } catch (err) {
        console.error("❌ Delete Error:", err);
        res.status(500).json({ error: "Delete operation failed" });
    }
});

module.exports = router;