const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator'); // For easy email validation
const User = require('./models/User'); // Import your User model
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// REGISTRATION ROUTE
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Validate Email Format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "The email is incorrect. Please use a valid email format." });
    }

    // 2. Validate Password Length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password is too short. Use more than six characters." });
    }

    // 3. Check if User Already Exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please log in instead." });
    }

    // 4. Hash the password (Security First!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Save to Database
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "Account created successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));