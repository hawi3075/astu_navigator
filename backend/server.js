const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User'); // Ensure this path is correct

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- REGISTRATION ROUTE ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic check
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3. Create user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error); // This shows in your terminal
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.log("DB Connection Error: ", err));