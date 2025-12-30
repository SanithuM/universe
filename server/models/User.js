const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users have the same email
        trim: true,
        lowercase:true
    },
    password: {
        type: String,
        required: true 
    },
    profilePic: {
        type: String,
        default: '' // Default to empty string if no profile picture is provided
    },
    settings: {
        theme: {
            type: String,
            enum: ['light', 'dark'], // Restricts value to 'light' or 'dark'
            default: 'light'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
    }
}, {timestamps: true}); // Automatically adds 'createdAt' and 'updatedAt'

module.exports = mongoose.model('User', userSchema);