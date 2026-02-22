const express = require('express');
const router = express.Router();
const User = require('../models/User');

// This handles POST to http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("📥 Login attempt:", email); // Verify this appears in your terminal

        const user = await User.findOne({ email });

        if (user && user.password === password) {
            return res.status(200).json({ 
                message: "Login successful", 
                user: { 
                    name: user.name, 
                    email: user.email,
                    role: user.role || 'admin'
                } 
            });
        } 
        
        return res.status(401).json({ error: "Invalid email or password" });
    } catch (err) {
        console.error("❌ Server Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;