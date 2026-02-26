const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic Validation: Ensure fields aren't empty
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide both email and password" });
        }

        // 2. Find the user (Case-insensitive email handling)
        // We use .toLowerCase() because registration usually stores emails in lowercase
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        // Security Tip: Use a generic "Invalid Credentials" message for both email and password failures
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Verify password (Compare plain text input with hashed DB password)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4. Generate the JWT Token
        // payload includes id, role, and email
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } 
        );

        // 5. Send Response
        // Including 'success: true' helps your React 'if (data.success)' logic
        res.status(200).json({
            success: true,
            message: "Welcome back!",
            token: token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Critical Login Error:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};