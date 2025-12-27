const router = require('express').Router();
const Assignment = require('../models/Assignment');
const verify = require('../middleware/verifyToken');

// create Assignment
router.post('/', verify, async (req, res) => {
    try {
        // create the new assignment object
        const newAssignment = new Assignment({
            userID: req.user.id, // Taken securely from the Token!
            courseName: req.body.courseName,
            title: req.body.title,
            dueDate: req.body.dueDate,
            academicWeight: req.body.academicWeight,
            status: req.body.status || 'To-Do'
            // note: priotityScore will be 0 for now. we will add the Engine Later
        });

        // Save to DB
        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;