const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const authMiddleware = require('../middleware/authMiddleware');

// ------------------------------------------------------------------
// 📍 1. GET SAVED LOCATIONS (The Fix for your 404 Console Error)
// ------------------------------------------------------------------
router.get('/saved-locations/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // Search using case-insensitive email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`User not found for email: ${email}`);
            return res.status(404).json({ error: "User not found" });
        }

        // Send back the savedPoints array
        res.status(200).json(user.savedPoints || []);
    } catch (err) {
        console.error("Fetch Saved Locations Error:", err);
        res.status(500).json({ error: "Server error fetching locations" });
    }
});

// ------------------------------------------------------------------
// 📍 2. SAVE A NEW LOCATION
// ------------------------------------------------------------------
router.post('/save-location', authMiddleware, async (req, res) => {
    try {
        const { email, location } = req.body;
        
        // Use findOneAndUpdate with $addToSet to avoid duplicates in the array
        const updatedUser = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { 
                $addToSet: { 
                    savedPoints: {
                        name: location.name,
                        category: location.category || "Campus Spot",
                        coordinates: location.coordinates,
                        savedAt: new Date() 
                    } 
                } 
            },
            { new: true } 
        );

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.status(201).json({ 
            message: "Saved successfully", 
            count: updatedUser.savedPoints.length 
        });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ error: "Failed to save location" });
    }
});

// ------------------------------------------------------------------
// 📍 3. REMOVE SAVED POINT
// ------------------------------------------------------------------
router.delete('/saved-points/:id', authMiddleware, async (req, res) => {
    try {
        // req.user.id comes from your authMiddleware JWT decode
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ error: "User not found" });

        const initialLength = user.savedPoints.length;
        
        // Remove the specific point by ID
        user.savedPoints = user.savedPoints.filter(point => 
            point._id.toString() !== req.params.id
        );

        if (user.savedPoints.length === initialLength) {
            return res.status(404).json({ error: "Point not found" });
        }

        await user.save();
        res.status(200).json({ message: "Removed successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

module.exports = router;