const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // ✅ import mongoose

dotenv.config();

// ✅ Allow multiple origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

const app = express();
app.use('/api/firebase', require('./routes/firebase'));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
console.log("✅ /api/auth routes registered");

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);
console.log("✅ /api/profile routes registered");

app.use('/api/messages', require('./routes/messages'));


// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // stop the app if DB fails
  });

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

