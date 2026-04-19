const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directories exist
const uploadDir = 'uploads/resumes';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gigconnect';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// --- Schemas ---

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  resume: String, // Path to resume file
  updatedAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const MessageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});
const Message = mongoose.model('Message', MessageSchema);

const NotificationSchema = new mongoose.Schema({
  userId: String,
  type: String, // 'message', 'application', 'status'
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', NotificationSchema);

// --- APIs ---

// 1. Get conversations
app.get('/api/messages/conversations', async (req, res) => {
  const { userId } = req.query;
  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: -1 });

    const partners = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!partners.has(partnerId)) {
        partners.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.text,
          timestamp: msg.timestamp,
        });
      }
    });

    res.json(Array.from(partners.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get messages between two users
app.get('/api/messages/:userId', async (req, res) => {
  const { myId } = req.query;
  const { userId } = req.params;
  try {
    const chat = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId }
      ]
    }).sort({ timestamp: 1 });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Send message
app.post('/api/messages', async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  try {
    const newMsg = new Message({ senderId, receiverId, text });
    await newMsg.save();
    res.json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Notifications
app.get('/api/notifications', async (req, res) => {
  const { userId } = req.query;
  try {
    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read', async (req, res) => {
  const { userId } = req.body;
  try {
    await Notification.updateMany({ userId }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Resume Management
app.post('/api/resume/upload', upload.single('resume'), async (req, res) => {
  const { userId } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const resumePath = `/uploads/resumes/${req.file.filename}`;
    let user = await User.findOne({ userId });
    
    if (user) {
      user.resume = resumePath;
      user.updatedAt = Date.now();
      await user.save();
    } else {
      user = new User({ userId, resume: resumePath });
      await user.save();
    }
    
    res.json({ success: true, resumePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:userId/resume', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (!user || !user.resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ resume: user.resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Socket.IO Logic ---

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} joined`);
  });

  socket.on('send_message', async (data) => {
    const { senderId, receiverId, text } = data;
    
    // Save to DB
    const newMsg = new Message({ senderId, receiverId, text });
    await newMsg.save();

    // Send to receiver if online
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', newMsg);
      
      // Also send real-time notification
      const newNotif = new Notification({
        userId: receiverId,
        type: 'message',
        message: `New message from ${senderId.slice(0, 5)}...`
      });
      await newNotif.save();
      io.to(receiverSocket).emit('notification', newNotif);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((sid, uid) => {
      if (sid === socket.id) onlineUsers.delete(uid);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
