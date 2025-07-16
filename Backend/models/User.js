const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firebaseUid: {
      type: String,
      required: true, // optional for now
      unique: true,     // each Firebase UID should be unique
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
