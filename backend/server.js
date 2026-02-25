const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables before anything else
dotenv.config();

// --- 🛡️ DEBUG: Check if Secret is Loaded ---
if (!process.env.JWT_SECRET) {
    console.warn("⚠️ WARNING: JWT_SECRET is not defined in .env! Login will fail.");
} else {
    console.log("✅ JWT_SECRET detected successfully.");
}

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); 

const app = express();

// --- 🛠️ MIDDLEWARE ---
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json()); 

// --- 🔗 ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes);
// Matches your MapPage/SavedPage calls to /api/save-location and /api/saved-locations
app.use('/api', userRoutes); 

// Test Route
app.get('/', (req, res) => {
    res.send({ status: "Online", message: "ASTU Navigator API on Port 5000" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ detail: "Something went wrong on the server!" });
});

// --- 📦 DATABASE & START ---
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
        app.listen(PORT, () => console.log(`🚀 Server on: http://localhost:${PORT}`));
    })
    .catch(err => console.error("❌ DB Error:", err.message));