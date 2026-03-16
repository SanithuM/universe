const router = require('express').Router();
const Event = require('../models/Event');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');
const Notification = require('../models/Notification');
const { sendMeetingInviteEmail } = require('../utils/sendEmail');

// CREATE an Event (Study Plan OR Meeting)
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

    // TRIGGER NOTIFICATIONS
    // If there are other participants, send them a notification
    if (participantsList.length > 1) {
        // Get creator details for the message
        const creator = await User.findById(req.user.id);
        
        // Identify who needs to be notified (everyone except the creator)
        const recipients = participantsList.filter(pId => pId.toString() !== req.user.id);
        
        // Create the notification objects for the Inbox
        const notifications = recipients.map(recipientId => ({
            recipient: recipientId,
            sender: req.user.id,
            type: 'meeting',
            title: '📅 New Meeting Invite',
            message: `${creator.username} invited you to '${savedEvent.title}' on ${new Date(savedEvent.startTime).toLocaleDateString()}`,
            link: '/calendar', // Clicking it takes them to calendar
            isRead: false
        }));

        // Save to Database
        await Notification.insertMany(notifications);

        // FIRE LIVE SOCKET NOTIFICATIONS FOR TOASTS
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');

        if (io && onlineUsers) {
            // Loop through the recipients to see if they are currently online
            recipients.forEach(recipientId => {
                const receiverSocketId = onlineUsers.get(recipientId.toString());
                
                if (receiverSocketId) {
                    // Format the time nicely for the toast subtitle
                    const meetingTime = new Date(savedEvent.startTime).toLocaleString([], { 
                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    });

                    // Shoot the toast directly to their screen!
                    io.to(receiverSocketId).emit('receive_notification', {
                        senderName: creator.username,
                        senderPic: creator.profilePic || null,
                        title: `Invited you to a meeting:`,
                        subtitle: `${savedEvent.title} at ${meetingTime}`
                    });
                }
            });
        }

        // Send email invites
        // Format the time to look nice (e.g., "Mon, Mar 16, 10:00 AM")
        const meetingTime = new Date(savedEvent.startTime).toLocaleString([], { 
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });

        // Loop through the recipients and fire off an email to each one
        for (const recipientId of recipients) {
            const inviteeInfo = await User.findById(recipientId);
            
            if (inviteeInfo && inviteeInfo.email) {
                sendMeetingInviteEmail(
                    inviteeInfo.email, 
                    inviteeInfo.username, 
                    {
                        title: savedEvent.title,
                        creatorName: creator.username,
                        time: meetingTime,
                        description: savedEvent.description
                    }
                );
            }
        }
    }

    // Populate participants so frontend gets names immediately
    await savedEvent.populate('participants', 'username email profilePic');
    res.status(201).json(savedEvent);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Events (Where I am a participant)
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

// DELETE Event (Only Creator can delete)
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