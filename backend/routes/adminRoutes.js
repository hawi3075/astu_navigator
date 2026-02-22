const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const Event = require('../models/Event');
const User = require('../models/User');
const Location = require('../models/Location');

// Stats & Users
router.get('/stats', adminCtrl.getStats);
router.get('/users', async (req, res) => res.json(await User.find({}, '-password')));
router.delete('/users/:id', adminCtrl.deleteUser);

// Locations
router.get('/locations', async (req, res) => res.json(await Location.find()));
router.post('/locations', adminCtrl.addLocation);
router.delete('/locations/:id', adminCtrl.deleteLocation);

// Events
router.get('/events', async (req, res) => res.json(await Event.find()));
router.post('/events', async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.status(201).json(event);
});

module.exports = router;