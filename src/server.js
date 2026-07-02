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
const verifyToken = require('./middleware/authMiddleware');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');

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
    await db.query('ALTER TABLE dashboard_trainne DROP COLUMN IF EXISTS total_gold_periode CASCADE;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS junior_youth VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_timor VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_timor VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_tritura VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_tritura VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_cemara VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_cemara VARCHAR(50) DEFAULT NULL;');
    await db.query('ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS wa_trainee VARCHAR(50) DEFAULT NULL;');
    
    // Create quarterly_report table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quarterly_report (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        periode VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trainee_id, periode)
      );
    `);

    // Create real_stage table
    await db.query(`
      CREATE TABLE IF NOT EXISTS real_stage (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        periode VARCHAR(100) NOT NULL,
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(trainee_id, periode)
      );
    `);

    // Create gp_month table
    await db.query(`
      CREATE TABLE IF NOT EXISTS gp_month (
        trainee_id VARCHAR(50) PRIMARY KEY REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        periode VARCHAR(50) NOT NULL,
        total_gold_periode VARCHAR(50),
        rank_id_junior VARCHAR(50),
        rank_id_youth VARCHAR(50),
        rank_id_junior_timor VARCHAR(50),
        rank_id_youth_timor VARCHAR(50),
        rank_id_junior_tritura VARCHAR(50),
        rank_id_youth_tritura VARCHAR(50),
        rank_id_junior_cemara VARCHAR(50),
        rank_id_youth_cemara VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create house_rank table
    await db.query(`
      CREATE TABLE IF NOT EXISTS house_rank (
        id SERIAL PRIMARY KEY,
        house_name VARCHAR(100) NOT NULL,
        periode VARCHAR(50) NOT NULL,
        total_gold_house VARCHAR(50),
        rank VARCHAR(50),
        class VARCHAR(100),
        cabang VARCHAR(100),
        program VARCHAR(100),
        rank_junior VARCHAR(50),
        rank_youth VARCHAR(50),
        rank_junior_timor VARCHAR(50),
        rank_youth_timor VARCHAR(50),
        rank_junior_tritura VARCHAR(50),
        rank_youth_tritura VARCHAR(50),
        rank_junior_cemara VARCHAR(50),
        rank_youth_cemara VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (house_name, periode)
      );
    `);

    // Create gp_tahunan table
    await db.query(`
      CREATE TABLE IF NOT EXISTS gp_tahunan (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        total_gold INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_gp_tahunan_trainee ON gp_tahunan(trainee_id);
    `);


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

    // Create myby_coin table
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_coin (
        id VARCHAR(50) PRIMARY KEY,
        trainee_name VARCHAR(255) NOT NULL,
        myby_balance INTEGER DEFAULT 0,
        gp_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Recreate myby_coin_ledger table with new columns
    await db.query('DROP TABLE IF EXISTS myby_coin_ledger CASCADE');
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_coin_ledger (
        ledger_id VARCHAR(50) PRIMARY KEY,
        transaction_id VARCHAR(50) NOT NULL,
        trainer_id VARCHAR(50) NOT NULL,
        trainer_name VARCHAR(255) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        amount_gold_point INTEGER NOT NULL CHECK (amount_gold_point >= 0),
        transaction_direction VARCHAR(20) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create myby_coin_shop table
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_coin_shop (
        product_id VARCHAR(50) PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        product_description TEXT,
        product_image VARCHAR(255),
        gold_point_price INTEGER NOT NULL CHECK (gold_point_price >= 0),
        stock INTEGER DEFAULT 99 CHECK (stock >= 0),
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create myby_coin_shop_transaction table
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_coin_shop_transaction (
        transaction_id VARCHAR(50) PRIMARY KEY,
        trainer_id VARCHAR(50) NOT NULL,
        trainer_name VARCHAR(255) NOT NULL,
        product_id VARCHAR(50) NOT NULL REFERENCES myby_coin_shop(product_id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        amount_gold_point INTEGER NOT NULL CHECK (amount_gold_point >= 0),
        status VARCHAR(20) NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create rewards_shop table (keep for backward compatibility)
    await db.query(`
      CREATE TABLE IF NOT EXISTS rewards_shop (
        id SERIAL PRIMARY KEY,
        reward_name VARCHAR(255) NOT NULL,
        description TEXT,
        cost INTEGER NOT NULL CHECK (cost >= 0),
        currency VARCHAR(10) DEFAULT 'MYBY',
        stock INTEGER DEFAULT 99 CHECK (stock >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create myby_coin_transfer table
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_coin_transfer (
        transfer_id VARCHAR(50) PRIMARY KEY,
        trainer_id VARCHAR(50) NOT NULL,
        trainer_name VARCHAR(255) NOT NULL,
        amount_gold_point INTEGER NOT NULL CHECK (amount_gold_point > 0),
        status VARCHAR(20) NOT NULL,
        transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create myby_coin_deposit table
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_coin_deposit (
        deposit_id VARCHAR(50) PRIMARY KEY,
        trainer_id VARCHAR(50) NOT NULL,
        trainer_name VARCHAR(255) NOT NULL,
        trainee_id VARCHAR(50) NOT NULL REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        amount_gold_point INTEGER NOT NULL CHECK (amount_gold_point > 0),
        deposit_method VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        deposit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed data for rewards_shop
    const shopCheck = await db.query('SELECT COUNT(*) FROM rewards_shop');
    if (parseInt(shopCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding rewards_shop table...');
      await db.query(`
        INSERT INTO rewards_shop (reward_name, description, cost, currency, stock) VALUES
        ('Premium Academy E-Book', 'E-Book pembelajaran akademi premium untuk tingkat lanjut.', 100, 'MYBY', 99),
        ('1-on-1 Mentoring Session (30 mins)', 'Sesi konsultasi & mentoring privat dengan pengajar (30 menit).', 500, 'MYBY', 10),
        ('Exclusive SMLONE T-Shirt', 'Kaos eksklusif edisi terbatas dari SMLONE Academy.', 10, 'GP', 25)
      `);
      console.log('🌱 Seeding completed!');
    }

    // Seed data for myby_coin_shop
    const coinShopCheck = await db.query('SELECT COUNT(*) FROM myby_coin_shop');
    if (parseInt(coinShopCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding myby_coin_shop table...');
      await db.query(`
        INSERT INTO myby_coin_shop (product_id, product_name, product_description, gold_point_price, stock, status) VALUES
        ('P-01', 'Exclusive SMLONE Hoodie', 'Hoodie berkualitas premium dari SMLONE Academy.', 15, 50, 'Active'),
        ('P-02', 'SMLONE Canvas Tote Bag', 'Tote bag ramah lingkungan untuk menemani belajar.', 5, 100, 'Active'),
        ('P-03', 'Professional Certificate Frame', 'Bingkai sertifikat kayu kokoh untuk memajang prestasimu.', 8, 30, 'Active')
      `);
      console.log('🌱 Seeding myby_coin_shop completed!');
    }

    console.log('✅ Database schema verified!');
  } catch (err) {
    console.error('❌ Database migration error:', err.message);
  }
})();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi setelah 15 menit.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan masuk/daftar. Silakan coba lagi setelah 15 menit.'
  }
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
app.use('/api/admin/trainees', verifyToken, adminTraineesRoutes);
app.use('/admin/trainees', verifyToken, adminTraineesRoutes);
app.use('/api/admin/awards', verifyToken, adminAwardsRoutes);
app.use('/admin/awards', verifyToken, adminAwardsRoutes);
app.use('/api/admin/quiz-history', verifyToken, adminQuizHistoryRoutes);
app.use('/admin/quiz-history', verifyToken, adminQuizHistoryRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/admin', verifyToken, adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


