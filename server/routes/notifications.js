const router = require('express').Router();
const Notification = require('../models/Notification');
const verify = require('../middleware/verifyToken');

// Get all notifications for the current user
router.get('/', verify, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 }) // Newest first
            .populate('sender', 'username profilePic');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Make as read (single)
router.put('/:id/read', verify, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: "Marked as read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Make all as read
router.put('/read-all', verify, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
        res.json({ message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Notification
router.delete('/:id', verify, async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Internal Route to create a notification
router.post('/test', verify, async (req, res) => {
    try {
        const newNotif = new Notification({
            recipient: req.user.id, // Send to self for testing
            title: req.body.title,
            message: req.body.message,
            type: req.body.type
        });
        await newNotif.save();
        res.json(newNotif);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;