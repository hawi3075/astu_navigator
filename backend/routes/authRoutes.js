const express = require('express');
const router = express.Router();
const User = require('../models/User');

// This matches: POST http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
    console.log("📩 Received registration request for:", req.body.email);
    try {
        const { name, email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ detail: "This email is already registered." });
        }

        const newUser = new User({ name, email: cleanEmail, password });
        await newUser.save();
        
        console.log("✅ User saved successfully");
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        console.error("❌ Server Error:", err);
        res.status(500).json({ detail: "Database error during registration." });
    }
});

// This matches: POST http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim(), password });

        if (!user) {
            return res.status(401).json({ detail: "Invalid email or password." });
        }
        res.json({ name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ detail: "Login failed." });
    }
});

module.exports = router; // <--- MUST BE HERE