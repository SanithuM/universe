const router = require('express').Router();
const mongoose = require('mongoose');
const Note = require('../models/Note');
const verify = require('../middleware/verifyToken');
const User = require('../models/User');

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
    const stringId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(stringId);

    // 🔥 FIXED: Changed sharedWith to sharedWith.user
    const notes = await Note.find({
      $or: [
        { userId: stringId },
        { userId: objectId },
        { "sharedWith.user": stringId },
        { "sharedWith.user": objectId }
      ]
    }).sort({ updatedAt: -1 });

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH NOTES
router.get('/search', verify, async (req, res) => {
  try {
    const { query, sort, date } = req.query;

    const stringId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(stringId);

    // 🔥 FIXED: Now includes shared notes in your search!
    let filter = {
      $or: [
        { userId: stringId },
        { userId: objectId },
        { "sharedWith.user": stringId },
        { "sharedWith.user": objectId }
      ]
    };

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

    // Define Sorting
    let sortOption = { updatedAt: -1 }; // Default: Newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    // Execute Query
    const notes = await Note.find(filter)
      .sort(sortOption)
      .select('title icon createdAt updatedAt sharedWith userId'); 

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET a single Note by ID
router.get('/:id', verify, async (req, res) => {
  try {
    const stringId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(stringId);

    // 🔥 FIXED: Changed sharedWith to sharedWith.user
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { userId: stringId },
        { userId: objectId },
        { "sharedWith.user": stringId },
        { "sharedWith.user": objectId }
      ]
    })
      .populate('userId', 'username email profilePic') 
      .populate('sharedWith.user', 'username email profilePic'); 

    if (!note) return res.status(404).json({ message: "Note not found or you don't have access" });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE a Note
router.put('/:id', verify, async (req, res) => {
  try {
    const stringId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(stringId);

    // 🔥 FIXED: Changed sharedWith to sharedWith.user
    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { userId: stringId },
          { userId: objectId },
          { "sharedWith.user": stringId },
          { "sharedWith.user": objectId }
        ]
      },
      { $set: req.body },
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: "Note not found or you don't have edit access" });
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

// Share a Note with users
router.post('/:id/share', verify, async (req, res) => {
  try {
    const { email } = req.body;

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can share this note." });
    }

    const userToShareWith = await User.findOne({ email });
    if (!userToShareWith) {
      return res.status(404).json({ message: "No user found with that email." });
    }

    if (userToShareWith._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You already own this note." });
    }

    // 🔥 FIXED: Use .some() instead of .includes() for array of objects
    const isAlreadyShared = note.sharedWith.some(
      (shareItem) => shareItem.user.toString() === userToShareWith._id.toString()
    );

    if (isAlreadyShared) {
      return res.status(400).json({ message: "Already shared with this user." });
    }

    note.sharedWith.push({ user: userToShareWith._id, access: 'editor' });
    await note.save();

    res.status(200).json({
      message: "Note shared successfully!",
      sharedUser: { username: userToShareWith.username, email: userToShareWith.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGE USER ACCESS (Editor/Viewer)
router.put('/:id/share/:userId', verify, async (req, res) => {
  try {
    const { access } = req.body;
    
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, "sharedWith.user": req.params.userId },
      { $set: { "sharedWith.$.access": access } },
      { new: true }
    ).populate('sharedWith.user', 'username email profilePic');

    if (!note) return res.status(404).json({ message: "Note not found or unauthorized." });
    
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a user from shared list
router.delete('/:id/share/:userId', verify, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userIdToRemove = req.params.userId;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can remove users " });
    }
    
    // Safely filter the array instead of using .pull() which can fail on subdocs
    note.sharedWith = note.sharedWith.filter(
        (shareItem) => shareItem.user.toString() !== userIdToRemove
    );
    await note.save();

    res.status(200).json({ message: "User removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;