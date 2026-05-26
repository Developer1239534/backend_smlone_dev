require('dotenv').config();
const express = require('express');
const cors = require('cors');

const quizRoutes = require('./routes/quizRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMLONE Backend is running!' });
});

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', studentRoutes);      // POST /api/auth/login
app.use('/api/students', studentRoutes);  // GET/PUT /api/students/:id

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
