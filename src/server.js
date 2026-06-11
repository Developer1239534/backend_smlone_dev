require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/neonClient');

const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const dashboardApiRoutes = require('./routes/dashboardApiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminTraineesRoutes = require('./routes/adminTraineesRoutes');
const adminAwardsRoutes = require('./routes/adminAwardsRoutes');
const adminQuizHistoryRoutes = require('./routes/adminQuizHistoryRoutes');
const userMyByRoutes = require('./routes/userMyByRoutes');

// Auto DB migration for new columns
(async () => {
  try {
    console.log('🔄 Checking database schema...');
    await db.query('ALTER TABLE dashboard_trainne DROP COLUMN IF EXISTS email CASCADE;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS tanggal_lahir VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS cabang VARCHAR(100) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS house_sml VARCHAR(255) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS total_gold_periode VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS junior_youth VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_timor VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_timor VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_tritura VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_tritura VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_cemara VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_cemara VARCHAR(50) DEFAULT NULL;');
    
    // Create quiz_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        student_id VARCHAR(50) PRIMARY KEY,
        assigned_house VARCHAR(50) NOT NULL,
        scores JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create awards table
    await db.query(`
      CREATE TABLE IF NOT EXISTS awards (
        id SERIAL PRIMARY KEY,
        award_type VARCHAR(20) NOT NULL,
        award_name VARCHAR(100) NOT NULL,
        category VARCHAR(20) NOT NULL,
        medal VARCHAR(10) NOT NULL,
        trainee_id VARCHAR(50) NOT NULL DEFAULT '',
        trainee_name VARCHAR(255) NOT NULL,
        score INTEGER DEFAULT 0,
        threshold INTEGER DEFAULT 0,
        period VARCHAR(20) DEFAULT 'jun-2026',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(award_name, category, trainee_id, period)
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
app.use('/api/user', userMyByRoutes);

// Custom Dashboard & Contact Endpoints
app.use('/api/dashboard', dashboardApiRoutes);
app.use('/dashboard', dashboardApiRoutes);
app.use('/api/contact', dashboardApiRoutes);
app.use('/contact', dashboardApiRoutes);

// Admin Management Endpoints
app.use('/api/admin/trainees', adminTraineesRoutes);
app.use('/admin/trainees', adminTraineesRoutes);
app.use('/api/admin/awards', adminAwardsRoutes);
app.use('/admin/awards', adminAwardsRoutes);
app.use('/api/admin/quiz-history', adminQuizHistoryRoutes);
app.use('/admin/quiz-history', adminQuizHistoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


