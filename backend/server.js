const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); 

const app = express();

// ✅ UPDATED: Allowed both local testing and your live Vercel site
app.use(cors({ 
    origin: [
        "http://localhost:5173", 
        "https://astu-navigator-ysgh.vercel.app"
    ], 
    credentials: true 
}));

app.use(express.json()); 

app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes); 

// Global Error Handler to catch 500s
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ detail: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;

// Clean connection for Mongoose 7/8
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas Successfully");
        app.listen(PORT, () => console.log(`🚀 Server running on: http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error("❌ DB ERROR:", err.message);
        process.exit(1); 
    });