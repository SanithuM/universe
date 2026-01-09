const router = require('express').Router();
const GroupTask = require('../models/GroupTask');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');

// Create Task and Notify Assigned user
router.post('/', verify, async (req, res) => {
    try {
        const { groupId, title, assignedToId, dueDate } = req.body;

        // Create the Task
        const newTask = new GroupTask({
            group: groupId,
            title: title,
            assignedTo: assignedToId,
            assignedBy: req.user.id,
            dueDate: dueDate
        });
        const savedTask = await newTask.save();

        // Send Notification to the Assigned User (if not self-assigned)
        if (assignedToId !== req.user.id) {
            const assigner = await User.findById(req.user.id);
            const group = await Group.findById(groupId);

            await new Notification({
                recipient: assignedToId,
                sender: req.user.id,
                type: 'group',
                title: '📋 New Group Task',
                message: `${assigner.username} assigned you the task "${title}" in group "${group.name}".`,
                link: `/groups/${groupId}`
            }).save();
        }

        // Populate user details for the frontend
        await savedTask.populate('assignedTo', 'username profilePic');
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get tasks for a group
router.get('/:groupId', verify, async (req, res) => {
    try {
        const tasks = await GroupTask.find({ group: req.params.groupId })
            .populate('assignedTo', 'username profilePic')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status and notify group members (if Done)
router.put('/:taskId', verify, async (req, res) => {
    try {
        const { status } = req.body;
        const task = await GroupTask.findByIdAndUpdate(
            req.params.taskId,
            { status },
            { new: true }
        ).populate('assignedTo', 'username').populate('group', 'name members');

        // If task is marked as Done, notify everyone else in the group
        if (status === 'Done') {
            const completerName = task.assignedTo.username;
            const groupName = task.group.name;

            // Filter out the person who completed the task
            const recipient = task.group.members.filter(
                memberId => memberId.toString() !== req.user.id
            );

            // Create notification for all members
            const notifications = recipients.map(recipientId => ({
                recipient: recipientId,
                sender: req.user.id,
                type: 'group',
                title: '✅ Task Completed',
                message: `${completerName} finished the task "${task.title}" in ${groupName}.`,
                link: `/groups/${task.group._id}`
            }));

            await Notification.insertMany(notifications);
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a task
router.delete('/:taskId', verify, async (req, res) => {
  try {
    await GroupTask.findByIdAndDelete(req.params.taskId);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;