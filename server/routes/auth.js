const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password} = req.body;

        // 👇 ADD THESE LINES TO DEBUG:
        console.log("Received Password:", password);
        console.log("Type of Password:", typeof password);

        // check if user already exists
        const existingUser = await User.findOne({ email});
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists'});
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the new user
        const newUser = new User({
            username,
            email,
            passwordHash: hashedPassword, // Store the hash, NOT the plain text
        });
        const savedUser = await newUser.save();

        // generate a JWT token
        const token = jwt.sign(
            { id: savedUser._id},
            process.env.JWT_SECRET || 'fallback_secret_key', // use a fallback for development
            { expiresIn: '1d'}
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
                res.status(500).json({ error: err.message});
            }
        });

        // Login Route
        router.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body;

                // check if user exists
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(400). json({ message: 'Invalid credentials' });
                }

                // Validate Password
                const isMatch = await bcrypt.compare(password, user.passwordHash);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }

                // Generate JWT Token
                const token = jwt.sign(
                    { id: user._id},
                    process.env.JWT_SECRET,
                    { expiresIn: '1d'}
                );
                res.status(200).json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    }
                });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Update user details (username & Profile pic)
        router.put('/update', verify, async (req, res) => {
            try {
                const updatedUser = await User.findByIdAndUpdate(
                    req.user.id,
                    {
                        $set: {
                            username: req.body.username,
                            profilePic: req.body.profilePic // Expecting a Base64 string
                        }
                    },
                    { new: true } // Return the update document
                ).select('-passwordHash'); // Don't return the password hash

                res.json(updatedUser);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Change Password
        router.put('/change-password', verify, async (req, res) => {
            try {
                const { currentPassword, newPassword } = req.body;

                // Find user to get the current hashed password
                const user = await User.findById(req.user.id);

                // Check if current password is correct
                const validPass = await bcrypt.compare(currentPassword, user.passwordHash);
                if (!validPass) return res.status(400).send('Invalid current password');

                // Hash the New password
                const salt = await bcrypt.getSalt(10);
                const hashedPassword = await bcrypt.hash(newPassword, salt);

                // Update in DB
                user.passwordHash = hashedPassword;
                await user.save();

                res.send( 'Password changed successfully' );
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Delete Account
        router.delete('/delete', verify, async (req, res) => {
            try {
                await User.findByIdAndDelete(req.user.id);
                res.json({ message: "Account deleted successfully" });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        module.exports = router;