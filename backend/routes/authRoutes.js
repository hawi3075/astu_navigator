const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- 📍 1. GET ALL LOCATIONS FOR MAP MARKERS ---
// This handles: GET http://localhost:5000/api/auth/locations_list
router.get('/locations_list', async (req, res) => {
    try {
        // Find all users and only retrieve the 'savedPoints' field
        const users = await User.find({}, 'savedPoints'); 
        
        // Flatten all savedPoints from all users into one single array for the map
        const allMarkers = users.flatMap(user => user.savedPoints || []);
        
        console.log(`📡 Sending ${allMarkers.length} markers to the map.`);
        res.json(allMarkers);
    } catch (err) {
        console.error("Marker Fetch Error:", err);
        res.status(500).json({ error: "Server could not load markers" });
    }
});

// --- 🔑 2. LOGIN (Provides Security Token) ---
// Matches: POST http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user and normalize email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // Basic password check (If using bcrypt, use await bcrypt.compare)
        if (!user || user.password !== password) {
            return res.status(401).json({ detail: "Invalid email or password." });
        }

        // Generate the Security Token (JWT)
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // ✅ IMPORTANT: Send the response in the format the frontend expects
        res.json({ 
            token: token, 
            user: { 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });

        console.log(`✅ User logged in: ${user.email}`);
    } catch (err) {
        console.error("Login Server Error:", err);
        res.status(500).json({ detail: "Login failed due to server error." });
    }
});

// --- 📝 3. REGISTER ---
// Matches: POST http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ detail: "This email is already registered." });
        }

        // Create and save new user
        const newUser = new User({ 
            name, 
            email: cleanEmail, 
            password, // Note: Use bcrypt.hash in production
            role: 'student',
            savedPoints: [] 
        });

        await newUser.save();
        
        res.status(201).json({ message: "Registration Successful! You can now log in." });
        console.log(`👤 New user registered: ${cleanEmail}`);
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ detail: "Registration failed." });
    }
});

module.exports = router;