const router = require('express').Router();
const Event = require('../models/Event');
const verify = require('../middleware/verifyToken');

// Create an Event (Study Plan)
router.post('/', verify, async (req, res) => {
    try {
        const newEvent = new Event({
            userId: req.user.id,
            title: req.body.title,
            type: req.body.type,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            color: req.body.color
        });
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Events (For the logged-in user)
router.get('/', verify, async (req, res) => {
    try {
        const events = await Event.find({ userId: req.user.id });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Event
router.delete('/:id', verify, async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: "Event deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;