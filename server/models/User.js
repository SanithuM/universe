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
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
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
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
    }

}, {timestamps: true}); // Automatically adds 'createdAt' and 'updatedAt'

module.exports = mongoose.model('User', userSchema);