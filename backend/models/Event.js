const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    required: true, // Making this required ensures your UI doesn't have empty cards
    trim: true
  }
}, { 
  timestamps: true // 🕒 Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Event', EventSchema);