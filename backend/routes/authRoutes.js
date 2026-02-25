const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const User = require('../models/User');

// --- 📝 REGISTER ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ detail: "This email is already registered." });
        }

        const newUser = new User({ 
            name, 
            email: cleanEmail, 
            password, // Sent as plain text; hashed automatically by User.js
            role: 'student' 
        });

        await newUser.save();
        res.status(201).json({ message: "Registration Successful!" });
        console.log(`✅ Registered: ${cleanEmail}`);
    } catch (err) {
        console.error("🔥 Registration Crash:", err);
        res.status(500).json({ detail: "Database rejected the data." });
    }
});

// --- 🔑 LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // 🛡️ Use bcrypt.compare to check the hashed password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ detail: "Invalid email or password." });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'dev_secret_key',
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { name: user.name, email: user.email, role: user.role } 
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ detail: "Login server error." });
    }
});

module.exports = router;