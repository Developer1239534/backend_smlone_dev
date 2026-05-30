require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/neonClient');

const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const dashboardApiRoutes = require('./routes/dashboardApiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Auto DB migration for new columns
(async () => {
  try {
    console.log('🔄 Checking database schema...');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT NULL;');
    
    // Create quiz_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        student_id VARCHAR(50) PRIMARY KEY,
        assigned_house VARCHAR(50) NOT NULL,
        scores JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database schema verified!');
  } catch (err) {
    console.error('❌ Database migration error:', err.message);
  }
})();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMLONE Backend is running!' });
});

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/dashboard-trainee', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Custom Dashboard & Contact Endpoints
app.use('/api/dashboard', dashboardApiRoutes);
app.use('/dashboard', dashboardApiRoutes);
app.use('/api/contact', dashboardApiRoutes);
app.use('/contact', dashboardApiRoutes);

// Admin Management Endpoints
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Webhook Endpoints
app.use('/api/webhook', webhookRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


