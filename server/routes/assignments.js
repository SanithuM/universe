const router = require('express').Router();
const Assignment = require('../models/Assignment');
const verify = require('../middleware/verifyToken');

// CREATE Assignment
router.post('/', verify, async (req, res) => {
  try {
    const newAssignment = new Assignment({
      userId: req.user.id,
      courseName: req.body.courseName,
      title: req.body.title,
      dueDate: req.body.dueDate,
      academicWeight: req.body.academicWeight,
      status: req.body.status || 'To-Do'
    });
    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Assignments (Sorted by Priority Engine)
router.get('/', verify, async (req, res) => {
  try {
    // Fetch assignments from DB
    const assignments = await Assignment.find({ userId: req.user.id });

    // The Priority Engine Algorithm
    const scoredAssignments = assignments.map((task) => {
      // convert the Mongoose object to a plain JS object first
      let taskObj = task.toObject();

      // If the assignment is completed, give it a zero priority score
      if (taskObj.isCompleted === true) {
        taskObj.priorityScore = (0).toFixed(2);
        return taskObj;
      }

      // Calculate Days Remaining
      const now = new Date();
      const due = new Date(task.dueDate);
      const diffTime = due - now;
      let daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Handle "Overdue" or "Due Today" (Avoid division by zero)
      if (daysRemaining <= 0) daysRemaining = 0.1; // Treated as "Due in moments"

      // Apply Formula: Weight / Days
      taskObj.priorityScore = (task.academicWeight / daysRemaining).toFixed(2);

      return taskObj;
    });

    // Sort by Score (Highest First)
    scoredAssignments.sort((a, b) => b.priorityScore - a.priorityScore);

    res.status(200).json(scoredAssignments);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Assignment
router.put('/:id', verify, async (req, res) => {
  try {
    // Check if the assignment belongs to this user before updating
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // Return the updated version
    );
    res.status(200).json(updatedAssignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Assignment
router.delete('/:id', verify, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    res.status(200).json({ message: "Assignment has been deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;