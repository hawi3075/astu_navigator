const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

// --- 🛠️ MIDDLEWARE (Order Matters!) ---
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json()); 

// --- 🔗 ROUTES ---
app.use('/api/auth', authRoutes);   // Logic: /api/auth/login
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send({ status: "Online", message: "ASTU Navigator API on Port 5000" });
});

// --- 📦 DATABASE & START ---
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
        app.listen(PORT, () => console.log(`🚀 Server on: http://localhost:${PORT}`));
    })
    .catch(err => console.error("❌ DB Error:", err.message));