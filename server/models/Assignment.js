const mongoose = require('mongoose');

const assignmnetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links this assignment to a specific user
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    academicWeight: {
        type: Number,
        required: true,
        min: 0,
        max: 100 // Represents precentage
    },
    status: {
        type: String,
        enum: ['To-Do', 'In-Progress', 'Done'],
        default: 'To-Do'
    },
    priorityScore: {
        type: Number,
        default: 0 // This will be calculated by your Algorithm later
    }
}, {timestamps: true});

module.exports = mongoose.model('Assignment', assignmnetSchema);