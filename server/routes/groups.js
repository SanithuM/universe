const router = require('express').Router();
const Group = require('../models/Group');
const verify = require('../middleware/verifyToken');
const Notification = require('../models/Notification'); 

// Helper to generate a 6-character code
const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Create a new group
router.post('/create', verify, async (req, res) => {
    try {
        const code = generateCode();

        const newGroup = new Group({
                name: req.body.name,
                inviteCode: code,
                creator: req.user.id,
                members: [req.user.id], // Creator is the first member
                profilePic: req.body.profilePic || ''
        });

        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Join a Group using invite code
router.post('/join', verify, async (req, res) => {
    try {
        const { inviteCode } = req.body;

        // Find group by invite code
        const group = await Group.findOne({ inviteCode });
        if (!group) return res.status(404).json({ message: "Invalid Invite Code" });

        // Check if user is already in the group
        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ message: "You are already in this group" });
        }

        // Add user to members array
        group.members.push(req.user.id);
        await group.save();

        res.status(200).json({ message: "Joined group successfully", group });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get my groups
router.get('/', verify, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id })
            .populate('members', 'username email profilePic');
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single group
router.get('/:id', verify, async (req, res) => {
    try {
        
        const group = await Group.findById(req.params.id).populate('members', 'username email profilePic');

        if (!group) return res.status(404).json({ message: "Group not found" });

        // Security Check: Is the requester a member?
        const isMember = group.members.some(member => member._id.toString() === req.user.id);
        if (!isMember) return res.status(403).json({ message: "Access Denied" });

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update group (only creator can update name/profilePic)
router.put('/:id', verify, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only the creator may update
        if (group.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the group creator can update this group.' });
        }

        // Apply updates if provided
        if (req.body.name) group.name = req.body.name;
        if (typeof req.body.profilePic !== 'undefined') group.profilePic = req.body.profilePic;

        await group.save();

        res.json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove a member from the group (Only creator can do this!)
router.delete('/:groupId/members/:memberId', verify, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ error: "Group not found" });

        // SECURITY CHECK: Is the person making the request the creator?
        if (group.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: "Only the group creator can remove members." });
        }

        // LOGIC CHECK: The creator shouldn't be able to kick themselves
        if (req.params.memberId === req.user.id) {
            return res.status(400).json({ error: "You cannot remove yourself." });
        }

        // Filter the user out of the members array
        group.members = group.members.filter(
            memberId => memberId.toString() !== req.params.memberId
        );

        await group.save();

        // Fire a notification so they know they got the boot
        await new Notification({
            recipient: req.params.memberId,
            sender: req.user.id,
            type: 'group',
            title: '🚪 Removed from Group',
            message: `You were removed from the group "${group.name}".`,
        }).save();

        res.json({ message: "Member removed successfully", group });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Shared Task
router.post('/:id/tasks', verify, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        const newTask = {
            title: req.body.title,
            assignedTo: req.user.id,
            status: 'To-Do'
        };

        group.tasks.push(newTask);
        await group.save();

        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Task Status
router.put('/:id/tasks/:taskId', verify, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        // Find the specific task in the array
        const task = group.tasks.id(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Flip status
        task.status = task.status === 'Done' ? 'To-Do' : 'Done';

        await group.save();
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a group (only creator can delete)
router.delete('/:id', verify, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only the creator may delete the group
        if (group.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the group creator can delete this group.' });
        }

        await Group.findByIdAndDelete(req.params.id);

        // Optionally, notify members or cleanup related resources here

        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;