const mongoose = require('mongoose');

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
        required: true // Expects [latitude, longitude]
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
        lowercase: true // Automatically saves emails in lowercase for consistency
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'user' 
    },
    // ✅ The savedPoints array using the sub-schema above
    savedPoints: [savedPointSchema] 
}, { 
    timestamps: true // Automatically creates createdAt and updatedAt fields
});

// 🛠️ 3. Ensure IDs are returned correctly for the frontend
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);