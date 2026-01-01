const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String, 
    default: ''
  },
  // "Study", "Meeting", "Deadline", etc.
  type: {
    type: String,
    default: 'Study'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  color: {
    type: String,
    default: 'bg-blue-100 text-blue-700'
  },
  // Who created it?
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who is invited? (Includes the creator)
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);