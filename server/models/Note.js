const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled'
  },
  // Stor the editor content as an HTML string for simplicity
  content: {
    type: String,
    default: ''
  },
  icon: {
    type: String, // e.g., an emoji "📝"
    default: null
  },
  coverImage: {
    type: String, // URL to an image
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    access: { type: String, enum: ['editor', 'viewer'], default: 'editor' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);