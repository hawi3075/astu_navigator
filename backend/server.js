const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Routes
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes'); // 🔑 Added Auth Routes

// Load environment variables
dotenv.config();

const app = express();

// --- 🛠️ MIDDLEWARE ---
// Explicitly allow your frontend port to prevent "Connection Failed" errors
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
})); 

app.use(express.json());

// --- 🌐 HEALTH CHECK ROUTE ---
app.get('/', (req, res) => {
    res.send({ status: "Online", message: "ASTU Navigator API is running on Port 5000" });
});

// --- 🔗 ROUTES ---
app.use('/api/auth', authRoutes);   // 🔑 Login/Register endpoints
app.use('/api/admin', adminRoutes); // Admin management endpoints

// --- ⚠️ GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server!" });
});

// --- 📦 DATABASE & SERVER START ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas successfully");
        app.listen(PORT, () => {
            console.log(`🚀 Server fully active on: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Database connection failed!");
        console.error("Reason:", err.message);
    });