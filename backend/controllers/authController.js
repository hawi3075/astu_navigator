const User = require('../models/User'); // Ensure this path to your model is correct
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Needed to compare hashed passwords

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 2. Verify password logic (CRITICAL STEP)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 3. Generate the Token
        // This ensures process.env.JWT_SECRET is used from your .env file
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // 4. Send it back in the response
        // This structure allows App.jsx to see 'data.token'
        res.status(200).json({
            message: "Login successful",
            token: token, 
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};