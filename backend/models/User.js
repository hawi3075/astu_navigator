const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Recommended for security

// 📍 1. Define the Schema for individual saved locations
const savedPointSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        default: 'Campus Spot' 
    },
    coordinates: { 
        type: [Number], 
        required: false // Changed to false to avoid errors if only names are sent
    },
    savedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// 👤 2. Define the main User Schema
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], // Restricts roles to these two values
        default: 'user' 
    },
    savedPoints: [savedPointSchema] 
}, { 
    timestamps: true 
});

// 🔒 3. AUTOMATIC PASSWORD HASHING (Highly Recommended)
// This hashes the password before saving it to MongoDB
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// 🛠️ 4. Ensure IDs are returned correctly for the frontend
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);