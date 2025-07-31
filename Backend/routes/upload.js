// routes/upload.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { bucket } = require('../firebase'); // path to your firebaseAdmin.js

const router = express.Router();

// Store file locally before upload to Firebase
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const ext = path.extname(file.originalname);
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const isAudio = file.mimetype.startsWith('audio/');

    let filePathToUpload = file.path;

    // 🖼️ Create thumbnail if image
    if (isImage) {
      const thumbnailPath = `uploads/thumb-${file.filename}.jpg`;
      await sharp(file.path).resize(300).toFile(thumbnailPath);
      await bucket.upload(thumbnailPath, {
        destination: `thumbnails/thumb-${file.originalname}`,
      });
      fs.unlinkSync(thumbnailPath); // delete local
    }

    // 📤 Upload original file to Firebase
    await bucket.upload(filePathToUpload, {
      destination: `media/${file.originalname}`,
    });

    // 🧹 Clean up local file
    fs.unlinkSync(filePathToUpload);

    return res.json({ message: 'Uploaded successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
