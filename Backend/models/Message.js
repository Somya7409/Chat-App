const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  status: { type: String, enum: ['SEEN', 'NOT_SEEN'], default: 'NOT_SEEN' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
