const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');

// 1. REGISTER
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

        // Create the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword, // FIX: Saving as 'password' to be consistent
        });
        const savedUser = await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: savedUser._id },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate Password
        // FIX: Comparing against 'user.password' (not passwordHash)
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
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE USER DETAILS
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

// 4. CHANGE PASSWORD
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

        // Force strings (Fixes "Illegal arguments: number")
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

// 5. DELETE ACCOUNT
router.delete('/delete', verify, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Get Current user (Profile)
router.get('/me', verify, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;