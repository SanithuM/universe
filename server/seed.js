const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Assignment = require('./models/Assignment');

// Load environment varibles
dotenv.config();

const testDatabase = async () => {
try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for testing...');

    // Clear existing data
    await User.deleteMany({});
    await Assignment.deleteMany({});
    console.log('old test data cleared.');

    // create a test user
    const testUser = await User.create({
        username: 'sanithu',
        email: 'sanithu@example.com',
        password: 'hashed_secret_password_123',
        settings: { theme: 'dark'}
    });
    console.log('User created:', testUser.username);

    // create a test assignment linked to that user
    const testAssignment = await Assignment.create({
        userId: testUser._id, // this links the assighment to the user above.
        courseName: 'Web Development',
        title: 'Build UniVerse MVP',
        dueDate: new Date('2025-12-31'),
        academicWeight: 50, // 50% grade weight
        status: 'In-Progress'
    });
    console.log('✅ Assignment Created:', testAssignment.title);
    console.log('🔗 Linked to User ID:', testAssignment.userId);

    // Success!
    console.log('Test passed: Models are working correctly.');
    process.exit();

    } catch (error) {
        console.error('Error during test database setup:', error);
        process.exit(1);
    }
};

testDatabase();