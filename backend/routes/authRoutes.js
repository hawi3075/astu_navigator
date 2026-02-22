const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Simple check for now - you should use bcrypt to compare hashed passwords later
        if (user && user.password === password) {
            res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error during login" });
    }
});

module.exports = router;