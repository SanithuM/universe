const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');
const { sendWelcomeEmail, sendForgotPasswordEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Note = require('../models/Note'); // To create a welcome note for new users
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

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
<p>We're excited to have you here. UniVerse is designed to help you crush your semester using data-driven prioritization.</p>
<h3>Key Features to Explore:</h3>
<ul>
    <li><strong>WSJF Priority Engine:</strong> Add your assignments and let the algorithm tell you exactly what to work on first.</li>
    <li><strong>Group Rooms:</strong> Create a space, invite your friends, and collaborate on tasks in real-time.</li>
    <li><strong>Rich-Text Editor:</strong> You're using it right now! It supports Markdown, task lists, and deep formatting.</li>
    <li><strong>Academic Dashboard:</strong> Check your "Focus Card" daily to stay on track.</li>
</ul>
<p><strong>Pro-Tip:</strong> You can edit this note to test the editor, or simply delete it when you're ready to start fresh!</p>
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

        // Check if 2FA is enabled for this user
        if (user.isTwoFactorEnabled) {
            return res.status(200).json({
                requiresTwoFactor: true,
                userId: user._id,
                message: "Two-factor authentication required."
            });
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

// Verify 2FA for login
router.post('/login/2fa', async (req, res) => {
    try {
        const { userId, token } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify the 6-digit code against their saved secret
        const isVerified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 1 // 30 second buffer
        });

        if (!isVerified) {
            return res.status(400).json({ message: "Invalid 2FA code" });
        }

        // Generate JWT Token
        const jwtToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: "Login successful",
            token: jwtToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic
            }
        });

    } catch (err) {
        console.error("2FA Login Error:", err);
        res.status(500).json({ message: "Server error during 2FA login" });
    }
});

// Frogot Password (Request Reset)
router.post('/forgot-password', async (req, res) => {
    let user; // Declare user in the outer scope so backend can access it in the catch block
    try {
        user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "There is no user with that email" });
        }

        // Generate and hash the token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Create the URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Call the streamlined utility function
        await sendForgotPasswordEmail(user.email, user.username, resetUrl);

        res.status(200).json({ message: 'Email sent successfully' });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        // Clean up the DB if the email fails to send
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(500).json({ message: 'Email could not be sent' });
    }
});

// RESET PASSWORD
router.put('/reset-password/:token', async (req, res) => {
    try {
        // Re-hash the token from the URL to match what is saved in the database
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Find the user with that exact token AND ensure it hasn't expired (10 min limit)
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Hash the new password securely
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        
        // Clear out the reset token fields so they can't be used again
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully!" });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Server error during password reset" });
    }
});

// GENERATE 2FA SECRET & QR CODE
router.post('/2fa/generate', async (req, res) => {
    try {
        // Find the user
        const user = await User.findById(req.body.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate a secure secret specifically for this user
        const secret = speakeasy.generateSecret({
            name: `UniVerse (${user.email})` // This is what shows up in the Google Authenticator app!
        });

        // Convert the secret URL into a QR code image
        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

        // Send both the QR code and the raw text secret back to React
        // Not save the secret to the database yet. we wait until they prove it works.
        res.status(200).json({
            secret: secret.base32,
            qrCode: qrCodeDataUrl
        });
    } catch (err) {
        console.error("2FA Generation Error:", err);
        res.status(500).json({ message: "Failed to generate 2FA secret" });
    }
});

// VERIFY AND ENABLE 2FA
// The user scans the code, types the 6 digits, and submits it here
router.post('/2fa/verify', async (req, res) => {
    try {
        const { userId, secret, token } = req.body; 
        // token = the 6 digit code from their phone
        // secret = the base32 string that generated in the last step

        const user = await User.findById(userId);

        // Mathematically verify the 6-digit code against the secret
        const isVerified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 1 // Allows a 30-second buffer in case their phone clock is slightly off
        });

        if (isVerified) {
            // It worked! Their phone is synced. Now the backend lock it into the database.
            user.twoFactorSecret = secret;
            user.isTwoFactorEnabled = true;
            await user.save();

            res.status(200).json({ message: "Two-Factor Authentication is now enabled!" });
        } else {
            res.status(400).json({ message: "Invalid authentication code. Please try again." });
        }

    } catch (err) {
        console.error("2FA Verification Error:", err);
        res.status(500).json({ message: "Server error during 2FA verification" });
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