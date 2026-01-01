const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    // "Study", "Lecture", "Break", etc.
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
    // Optional: Link it to a specific course color
    color: {
        type: String,
        default: 'bg-blue-100 text-blue-700'
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);