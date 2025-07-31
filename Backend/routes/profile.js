const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

const router = express.Router();

// ✅ Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: 'uploads/profilePics/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ JWT Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded; // decoded contains { userId, email, ... }
    next();
  });
};

// ✅ GET /api/profile - Fetch profile info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.userId }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      username: user.username,
      email: user.email,
      userId: user.firebaseUid, // important for chat
      photo: user.photo || null
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST /api/profile/upload-profile - Upload + Update profile picture
router.post('/upload-profile', authenticateToken, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const imageUrl = `http://localhost:5000/uploads/profilePics/${req.file.filename}`;

    // Update MongoDB based on firebaseUid (from JWT)
    await User.updateOne(
      { firebaseUid: req.user.userId },
      { photo: imageUrl }
    );

    res.json({ imageUrl });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

module.exports = router;
