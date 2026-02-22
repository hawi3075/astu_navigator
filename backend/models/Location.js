const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Building name is required'],
    trim: true,
    unique: true 
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

// Create an index for faster searching by name
LocationSchema.index({ name: 1 });

module.exports = mongoose.model('Location', LocationSchema);