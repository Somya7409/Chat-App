const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../routes/auth');
const admin = require('../firebaseAdmin'); // 🔹 Import Firebase Admin

// 🔹 POST: Send a new message (save to MongoDB + Firebase)
router.post('/', auth, async (req, res) => {
  const { receiver, message } = req.body;

  try {
    // 1. Save message to MongoDB
    const newMsg = new Message({
      sender: req.user.userId,
      receiver,
      message
    });
    await newMsg.save();

    // 2. Push message to Firebase Realtime Database
    await admin.database().ref('ChatApp/Chats').push({
      message,
      sender: req.user.userId,
      receiver,
      timestamp: Date.now()
    });

    res.status(201).json({ message: 'Message sent', data: newMsg });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

// 🔹 GET: Get all messages between logged in user and partner
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages', error: err.message });
  }
});

module.exports = router;
 