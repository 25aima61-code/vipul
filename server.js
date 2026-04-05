const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // serves index.html

// ── MongoDB Connect ─────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ── Schema ──────────────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ── Routes ──────────────────────────────────────────────────

// POST /api/contact  →  save message to MongoDB
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: 'All fields are required' });

    const doc = await Contact.create({ name, email, message });
    res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages  →  (optional) view all saved messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));