const User = require('../models/User');
const Event = require('../models/Event');
const Location = require('../models/Location');

exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const events = await Event.countDocuments();
    const points = await Location.countDocuments();
    res.json({ users, events, points }); // Fixes the 0,0,0 status
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
};

exports.addLocation = async (req, res) => {
  try {
    const newLoc = new Location(req.body);
    await newLoc.save();
    res.status(201).json(newLoc);
  } catch (err) { res.status(400).json({ error: "Could not save location" }); }
};

exports.deleteLocation = async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
};