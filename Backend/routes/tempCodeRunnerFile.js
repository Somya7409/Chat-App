const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { admin } = require('../firebaseAdmin'); // ✅ Correct import
const db = admin.database();                   // ✅ Initialize Realtime DB

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log("✅ /register route hit"); 
  console.log("📥 Incoming registration data:", req.body);

  const { username, email, password, firebaseUid } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firebaseUid // optional
    });

    await newUser.save();
    console.log("✅ User saved to MongoDB:", newUser.email);

    // ✅ Use Firebase UID if present, otherwise fallback to MongoDB _id
    const firebaseUserId = firebaseUid || newUser._id.toString();

    await db.ref(`ChatUsers/${firebaseUserId}`).set({
      email: newUser.email,
      username: newUser.username,
      photo: "",
      status: "offline",
      flag: "chat",
      userId: firebaseUserId
    });

    const token = jwt.sign({ userId: newUser.firebaseUid  }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      token,
      user: {
        username: newUser.username,
        email: newUser.email,
        userId: firebaseUserId
      },
    });

  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log("📨 Received POST /login request");

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.firebaseUid  }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      token,
      user: {
        username: user.username,
        email: user.email,
        userId: user.firebaseUid || user._id.toString()
      },
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
