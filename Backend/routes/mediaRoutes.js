// backend/routes/mediaRoutes.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Upload image, video, or audio
router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const ext = path.extname(file.originalname).toLowerCase();

  // Generate image thumbnail
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    const thumbPath = `thumbnails/thumb-${file.filename}`;
    await sharp(file.path)
      .resize(300)
      .toFile(thumbPath);
  }

  // TODO: Add video preview generation and audio duration later

  res.json({
    url: `/uploads/${file.filename}`,
    thumbnail: `/thumbnails/thumb-${file.filename}`,
  });
});

module.exports = router;
