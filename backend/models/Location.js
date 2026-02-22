const mongoose = require('mongoose');
const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});
module.exports = mongoose.model('Location', LocationSchema);