const mongoose = require('mongoose');

const groupTaskSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The user who must do the work
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The creator/admin who assigned it
    required: true
  },
  status: {
    type: String,
    enum: ['To-Do', 'In Progress', 'Done'],
    default: 'To-Do'
  },
  dueDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('GroupTask', groupTaskSchema);