const router = require('express').Router();
const Note = require('../models/Note');
const verify = require('../middleware/verifyToken');

// 1. CREATE a new, empty Note
router.post('/', verify, async (req, res) => {
  try {
    const newNote = new Note({
      userId: req.user.id,
      title: 'Untitled' // Start with a default title
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET All Notes for current user (for Sidebar)
router.get('/', verify, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH NOTES
router.get('/search', verify, async (req, res) => {
  try {
    const { query, sort, date } = req.query;
    
    // 1. Build the Search Filter
    let filter = { userId: req.user.id };

    // Text Search (Case insensitive regex)
    if (query) {
      filter.title = { $regex: query, $options: 'i' };
    }

    // Date Filter (Specific Day)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // 2. Define Sorting
    let sortOption = { updatedAt: -1 }; // Default: Newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    // 3. Execute Query
    const notes = await Note.find(filter)
      .sort(sortOption)
      .select('title icon createdAt updatedAt'); // Only fetch what we need

    res.json(notes);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET a single Note by ID
router.get('/:id', verify, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE a Note
router.put('/:id', verify, async (req, res) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body }, // Update whatever fields are sent
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE a Note
router.delete('/:id', verify, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;