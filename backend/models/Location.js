const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Building name is required'],
    trim: true,
    unique: true // ✅ This automatically creates the index for you
  },
  lat: { 
    type: Number, 
    required: [true, 'Latitude is required'] 
  },
  lng: { 
    type: Number, 
    required: [true, 'Longitude is required'] 
  },
  category: {
    type: String,
    default: 'Academic Block'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🗑️ REMOVED: LocationSchema.index({ name: 1 }); 
// (Removing this stops the "Duplicate schema index" warning)

module.exports = mongoose.model('Location', LocationSchema);