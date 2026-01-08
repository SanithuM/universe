const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' //Optional: who triggered the notification
    },
    type: {
        type: String,
        enum: ['meeting', 'group', 'system', 'deadline'],
        default: 'system'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    link: {
        type: String //Optional: link to related content
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);