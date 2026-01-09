const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');
const assignmentRoute = require('./routes/assignments');
const groupRoute = require('./routes/groups');
const eventRoute = require('./routes/events');
const noteRoute = require('./routes/notes');
const notificationRoute = require('./routes/notifications');
const groupTaskRoute = require('./routes/groupTasks');

// Load environment variales
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); //Allow me to parse JSON bodies
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// Routes
app.use('/api/auth', authRoute);
app.use('/api/assignments', assignmentRoute);
app.use('/api/groups', groupRoute);
app.use('/api/events', eventRoute);
app.use('/api/notes', noteRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/group-tasks', groupTaskRoute);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

// Basic Route to Test Server
app.get('/', (req, res) => {
    res.send('UniVerse API is Running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})