const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const multer = require('multer');
const fs = require('fs');

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors()); // Allow all origins for demo/dev
app.use(express.json());
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directories exist
const uploadDir = path.join(__dirname, 'uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf, .doc and .docx files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB Limit
});

// --- APIs (Refactored for Supabase) ---

// 1. Get conversations
app.get('/api/messages/conversations', async (req, res) => {
  const { userId } = req.query;
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const partners = new Map();
    messages.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!partners.has(partnerId)) {
        partners.set(partnerId, {
          userId: partnerId,
          lastMessage: msg.text,
          timestamp: msg.created_at,
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
    const { data: chat, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Send message (POST API as backup to Socket)
app.post('/api/messages', async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: senderId, receiver_id: receiverId, text }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Notifications
app.get('/api/notifications', async (req, res) => {
  const { userId } = req.query;
  try {
    const { data: notifs, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read', async (req, res) => {
  const { userId } = req.body;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Resume Management
app.post('/api/resume/upload', (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max limit is 2MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const resumePath = `/uploads/resumes/${req.file.filename}`;
      
      // Update Supabase profile
      const { error } = await supabase
        .from('profiles')
        .update({ resume_url: resumePath, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      res.json({ success: true, resumePath });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

app.get('/api/user/:userId/resume', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('resume_url')
      .eq('id', req.params.userId)
      .single();

    if (error || !data?.resume_url) return res.status(404).json({ error: 'Resume not found' });
    res.json({ resume: data.resume_url });
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
    
    // Save to Supabase
    const { data: newMsg, error: msgError } = await supabase
      .from('messages')
      .insert([{ sender_id: senderId, receiver_id: receiverId, text }])
      .select()
      .single();

    if (msgError) {
      console.error('Supabase Save Error:', msgError);
      return;
    }

    // Send to receiver if online
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', newMsg);
      
      // Also save notification to Supabase
      const { data: newNotif, error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: receiverId,
          type: 'message',
          message: `New message from ${senderId.slice(0, 5)}...`
        }])
        .select()
        .single();

      if (!notifError) {
        io.to(receiverSocket).emit('notification', newNotif);
      }
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
