const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User'); 

dotenv.config();
const app = express();

// 🛡️ Allow requests from your Vite frontend
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// --- REGISTRATION ROUTE ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Default role is Student for the profile view
    const newUser = new User({ name, email, password, role: "Student" });
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// --- LOGIN ROUTE (The missing piece) ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the email exists in the real MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email not found. Please register." });
    }

    // 2. Check password (Note: In production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // 3. Success! Return user info for the frontend
    res.status(200).json({
      full_name: user.name,
      email: user.email,
      role: user.role || "Student"
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Auth Server running on port ${PORT}`)))
  .catch(err => console.log("DB Connection Error: ", err));