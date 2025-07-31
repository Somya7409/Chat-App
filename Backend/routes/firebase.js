// routes/firebaseRoutes.js
const express = require('express');
const router = express.Router();
const { ref, set, push } = require('firebase-admin/database'); // ✅ Use firebase-admin
const { db } = require('../firebaseAdmin'); // ✅ Your firebaseAdmin.js exports db from admin

// ✅ Route to add user to ChatUsers
router.post('/addUser', async (req, res) => {
  const { userId, email, username, photo } = req.body;

  const userData = {
    email,
    username,
    photo: photo || '',
    status: 'online',
    flag: 'chat',
    userId
  };

  try {
    await set(ref(db, `ChatUsers/${userId}`), userData); // ✅ set() with ref()
    res.status(200).json({ message: 'User added to ChatUsers in Firebase' });
  } catch (error) {
    console.error("❌ Firebase ChatUser error:", error);
    res.status(500).json({ message: 'Failed to add user', error });
  }
});

// ✅ Route to send a message
router.post('/sendMessage', async (req, res) => {
  const { sender, receiver, message, date, time } = req.body;

  const messageData = {
    message,
    sender,
    receiver,
    date,
    time,
    status: 'NOT_SEEN',
    img_message: ''
  };
  // ✅ Route to send a call request
router.post('/sendCallRequest', async (req, res) => {
  const { callerId, receiverId } = req.body;

  if (!callerId || !receiverId) {
    return res.status(400).json({ message: "Missing callerId or receiverId" });
  }

  const roomId = `${callerId}-${receiverId}-${Date.now()}`;

  const callData = {
    receiverId,
    from, 
    fromName,  
    status: "incoming",
    roomId
  };

  try {
    await set(ref(db, `Calls/${callerId}`), callData);
    res.status(200).json({ message: 'Call request sent', roomId });
  } catch (error) {
    console.error("❌ Firebase call request error:", error);
    res.status(500).json({ message: 'Failed to send call request', error });
  }
});


  try {
    await push(ref(db, 'Chats'), messageData); // ✅ push() with ref()

    // ✅ Update Chatlist for both sender and receiver using set (not push)
    await set(ref(db, `Chatlist/${sender}/${receiver}`), { id: receiver });
    await set(ref(db, `Chatlist/${receiver}/${sender}`), { id: sender });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error("❌ Firebase sendMessage error:", error);
    res.status(500).json({ message: 'Failed to send message', error });
  }
});

module.exports = router;
