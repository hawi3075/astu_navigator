const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

// --- 🛠️ MIDDLEWARE ---
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json()); // Essential for parsing the email/password from your frontend

// --- 🔗 ROUTES ---
// This mounts your authRoutes at http://localhost:5000/api/auth
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send({ status: "Online", message: "ASTU Navigator API on Port 5000" });
});

// ✅ Global Error Handler (MUST stay at the bottom)
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