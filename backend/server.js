const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Routes
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();

// --- 🛠️ MIDDLEWARE ---
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Parses incoming JSON data

// --- 🌐 HEALTH CHECK ROUTE ---
// Open http://localhost:5000 in your browser to check if server is alive
app.get('/', (req, res) => {
    res.send({ status: "Online", message: "ASTU Navigator API is running on Port 5000" });
});

// --- 🔗 ROUTES ---
// All routes in adminRoutes will be prefixed with /api/admin
app.use('/api/admin', adminRoutes);

// --- ⚠️ GLOBAL ERROR HANDLER ---
// Catches any unexpected errors to prevent the server from crashing
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server!" });
});

// --- 📦 DATABASE & SERVER START ---
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
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
        console.log("\n💡 TIP: Make sure your IP address is whitelisted in MongoDB Atlas Network Access.");
    });