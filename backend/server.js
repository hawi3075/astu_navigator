const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- 📦 DATABASE SCHEMAS ---
const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({
  title: String, date: String, location: String, description: String
}));

const Location = mongoose.models.Location || mongoose.model('Location', new mongoose.Schema({
  name: String, lat: Number, lng: Number
}));

// --- 📍 LOCATION ROUTES (Fixes "Update Map" & "Delete Location") ---
app.get('/api/admin/locations', async (req, res) => {
  const locs = await Location.find();
  res.json(locs);
});

app.post('/api/admin/locations', async (req, res) => {
  try {
    const newLoc = new Location(req.body);
    await newLoc.save();
    res.status(201).json(newLoc);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/locations/:id', async (req, res) => {
  await Location.findByIdAndDelete(req.params.id);
  res.json({ message: "Location deleted" });
});

// --- 📅 EVENT ROUTES (Fixes "Publish Event") ---
app.get('/api/admin/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.post('/api/admin/events', async (req, res) => {
  const newEvent = new Event(req.body);
  await newEvent.save();
  res.status(201).json(newEvent);
});

// --- 👥 USER ROUTES (Fixes "Delete User") ---
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

app.delete('/api/admin/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// --- 📊 STATS ROUTE (Fixes 0,0,0 display) ---
app.get('/api/admin/stats', async (req, res) => {
  const u = await User.countDocuments();
  const e = await Event.countDocuments();
  const l = await Location.countDocuments();
  res.json({ users: u, events: e, points: l });
});

// --- 🚀 START ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(5000, () => console.log("🚀 Server ready on Port 5000")))
  .catch(err => console.error("DB Error:", err));