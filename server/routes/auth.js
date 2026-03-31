const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');
const { sendWelcomeEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a random 32-character hex token
        const crypto = require('crypto'); // Make sure this is imported at the top of your file!
        const emailToken = crypto.randomBytes(32).toString('hex');

        // Create the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken: emailToken
            // Note: Make sure 'isVerified: false' is in your User model default!
        });
        const savedUser = await newUser.save();

        // create the verification link
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verificationLink = `${clientUrl}/verify-email?token=${emailToken}`;

        // Pass the verification link to welcome email template function
        sendWelcomeEmail(savedUser.email, savedUser.username, verificationLink);

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.'
        });

        // Create a default welcome note for the new user
        try {
            const welcomeNoteContent = `
                # Welcome to UniVerse, ${savedUser.username}! 🚀

                We're excited to have you here. UniVerse is designed to help you crush your semester using data-driven prioritization. 

                ### Key Features to Explore:
                * **WSJF Priority Engine:** Add your assignments and let the algorithm tell you exactly what to work on first.
                * **Group Rooms:** Create a space, invite your friends, and collaborate on tasks in real-time.
                * **Rich-Text Editor:** You're using it right now! It supports Markdown, task lists, and deep formatting.
                * **Academic Dashboard:** Check your "Focus Card" daily to stay on track.

                **Pro-Tip:** You can edit this note to test the editor, or simply delete it when you're ready to start fresh!
                    `;

            const welcomeNote = new Note({
                title: "Welcome to UniVerse! 👋",
                content: welcomeNoteContent,
                userId: savedUser._id, // Links the note to the new user
                isFavorite: true       // Pin it so they see it first
            });

            await welcomeNote.save();
            console.log(`Welcome note created for ${savedUser.username}`);

        } catch (noteError) {
            // log the error but don't fail the registration if the note fails
            console.error("Failed to create welcome note:", noteError);
        }

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Email Verification Endpoint
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        // find the user with this exact token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }

        // verify the user and clear the token so it can't be used again
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully! You can now log in." });
    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ message: "Server error during email verification. Please try again later." });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please check your inbox and verify your email before logging in!' });
        }

        // Validate Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER DETAILS
router.put('/update', verify, async (req, res) => {
    try {
        const updates = {};

        // Only update fields if they are sent and NOT empty
        if (req.body.username) updates.username = req.body.username;
        if (req.body.profilePic) updates.profilePic = req.body.profilePic;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        // Log the actual error to your terminal so you can see what's wrong
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// CHANGE PASSWORD
router.put('/change-password', verify, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user
        const user = await User.findById(req.user.id);

        // Safety Check: Does user exist?
        if (!user) return res.status(404).json({ error: "User not found" });

        // Safety Check: Does this user actually have a password?
        if (!user.password) {
            return res.status(400).json({ error: "This account does not have a password set" });
        }

        // Force strings
        const currentPassStr = String(currentPassword);
        const newPassStr = String(newPassword);

        // Compare using the stringified variable
        const validPass = await bcrypt.compare(currentPassStr, user.password);
        if (!validPass) return res.status(400).send('Invalid current password');

        // Hash the New password
        // FIX: corrected 'getSalt' to 'genSalt'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassStr, salt);

        // Update in DB
        user.password = hashedPassword;
        await user.save();

        res.send('Password changed successfully');
    } catch (err) {
        console.error("Change Password Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE ACCOUNT
router.delete('/delete', verify, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Current user (Profile)
router.get('/me', verify, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Google SSO token swap
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body; // The Google Token sent from React

        // Verify the token with Google's servers
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // Extract the user's secure data from Google
        const payload = ticket.getPayload();
        const { email, name, sub: googleId, } = payload;

        // Check if this user already exists in our database
        let user = await User.findOne({ email });

        if (!user) {
            // If not, create a new user with the Google info
            const randomPassword = crypto.randomBytes(32).toString('hex'); // Generate a random password for this user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                username: name, // use the name from Google as the username
                email,
                password: hashedPassword,
                isVerified: true, // Google accounts are already verified
            });
            await user.save();
        } else {
            // If the user exists but isn't verified (should be rare with Google SSO), verify them
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
        }

        // Generate the standard UniVerse JWT
        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        // Sent the user into the app
        res.status(200).json({
            message: 'Google Login successful',
            token: jwtToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (err) {
        console.error("Google SSO Error:", err);
        res.status(401).json({ message: "Invalid Google Token" });
    }
});

module.exports = router;