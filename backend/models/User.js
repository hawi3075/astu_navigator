const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 📍 1. Define the Schema for individual saved locations
const savedPointSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'Campus Spot' },
    coordinates: { type: [Number], required: false },
    savedAt: { type: Date, default: Date.now }
});

// 👤 2. Define the main User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'student'], // 🛡️ 'student' added to match your frontend
        default: 'student' 
    },
    savedPoints: [savedPointSchema] 
}, { 
    timestamps: true 
});

// 🔒 3. AUTOMATIC PASSWORD HASHING (Fixed for Mongoose 7/8)
userSchema.pre('save', async function () {
    // Only hash if password is new or changed
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // ✅ No next() here. Async functions handle completion automatically.
    } catch (err) {
        throw new Error(err); 
    }
});

// 🛠️ 4. Ensure IDs are returned correctly
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);