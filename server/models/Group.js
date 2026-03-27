const mongoose = require('mongoose');
const { Schema } = mongoose; // Destructure Schema to ensure it exists

const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 255
  },
  // This is the "Secret Code" users will share
  inviteCode: {
    type: String,
    required: true,
    unique: true
  },
  // Who is the boss?
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // List of all members (including admin)
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Embed shared tasks directly in the group for simplicity
  tasks: [{
    title: String,
    status: { type: String, default: 'To-Do' }, // To-Do, In-Progress, Done
    assignedTo: { type: String, default: 'Unassigned' }, // User's name
    createdAt: { type: Date, default: Date.now }
  }]
  ,
  // Optional profile image for the group (stored as Cloudinary secure URL)
  profilePic: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);