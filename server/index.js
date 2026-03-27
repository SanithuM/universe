const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); //  Import native Node http module
const { Server } = require('socket.io'); // Import Socket.io

const authRoute = require('./routes/auth');
const assignmentRoute = require('./routes/assignments');
const groupRoute = require('./routes/groups');
const eventRoute = require('./routes/events');
const noteRoute = require('./routes/notes');
const notificationRoute = require('./routes/notifications');
const groupTaskRoute = require('./routes/groupTasks');


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://universe-nvhg.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); //Allow to parse JSON bodies
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/upload', require('./routes/upload'));

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:5173", "https://universe-nvhg.onrender.com" ],// React frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// The Switchboard for online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Someone connected: ${socket.id}`);

  // When a user logs in to React, they will send this event
  socket.on('addNewUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('👥 Current Online Users:', Array.from(onlineUsers.entries()));
  });

  // When a user closes their browser
  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected.`);
        break;
      }
    }
  });
});

// Expose io and onlineUsers to your route files
app.set('io', io);
app.set('onlineUsers', onlineUsers);

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

// Start Server using server.listen instead of app.listen
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});