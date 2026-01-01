const router = require('express').Router();
const Event = require('../models/Event');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');

// 1. CREATE an Event (Study Plan OR Meeting)
router.post('/', verify, async (req, res) => {
  try {
    let participantsList = [req.user.id]; // Creator is always a participant

    // If inviting someone else (by email)
    if (req.body.participantEmail) {
        const invitee = await User.findOne({ email: req.body.participantEmail });
        if (!invitee) {
            return res.status(404).json({ message: "Invited user email not found" });
        }
        participantsList.push(invitee._id);
    }

    const newEvent = new Event({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      color: req.body.color,
      creator: req.user.id,
      participants: participantsList
    });

    const savedEvent = await newEvent.save();
    // Populate participants so frontend gets names immediately
    await savedEvent.populate('participants', 'username email profilePic');
    res.status(201).json(savedEvent);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET All Events (Where I am a participant)
router.get('/', verify, async (req, res) => {
  try {
    // Find events where my ID is in the participants array
    const events = await Event.find({ participants: req.user.id })
      .populate('participants', 'username email profilePic')
      .populate('creator', 'username');
      
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE Event (Only Creator can delete)
router.delete('/:id', verify, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if(!event) return res.status(404).json({message: "Event not found"});

    if(event.creator.toString() !== req.user.id) {
        return res.status(403).json({message: "Only the creator can delete this event"});
    }

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;