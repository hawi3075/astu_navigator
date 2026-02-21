const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User'); // Ensure your User model exists

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- 🛡️ HELPER: Check if email format is valid ---
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// --- 📝 REGISTRATION ROUTE ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic empty field check
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 2. 🛡️ Real Email Format Check (Must be a valid @gmail, @yahoo, etc.)
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid, existing email address." });
    }

    // 3. Check if email already exists in your database
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already registered." });
    }

    // 4. Create the new user
    const newUser = new User({ 
      name, 
      email: email.toLowerCase(), 
      password, // Note: In a real app, use bcrypt to hash this!
      role: "Student" 
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully!" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// --- 🔑 LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ✅ IMPORTANT: Send all data so the Profile Page updates correctly
    res.status(200).json({
      full_name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed." });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Auth Server on port ${PORT}`)))
  .catch(err => console.log("DB Error: ", err));