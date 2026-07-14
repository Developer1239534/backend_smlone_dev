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
const adminGpMonthRoutes = require('./routes/adminGpMonthRoutes');
const adminHouseRankRoutes = require('./routes/adminHouseRankRoutes');
const adminHouseRoutes = require('./routes/adminHouseRoutes');
const adminMybyCoinRoutes = require('./routes/adminMybyCoinRoutes');
const adminQuestionsRoutes = require('./routes/adminQuestionsRoutes');
const adminRegistrationsRoutes = require('./routes/adminRegistrationsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const newsRoutes = require('./routes/newsRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
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

    await db.query(`
      CREATE TABLE IF NOT EXISTS gp_tahunan (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        total_gold INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query('CREATE INDEX IF NOT EXISTS idx_gp_tahunan_trainee ON gp_tahunan(trainee_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_gp_tahunan_trainee_date ON gp_tahunan(trainee_id, date);');

    // Create indexes for dashboard_trainne
    await db.query('CREATE INDEX IF NOT EXISTS idx_trainee_name ON dashboard_trainne(trainee_name);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_trainee_cabang ON dashboard_trainne(cabang);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_trainee_class ON dashboard_trainne(class);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_trainee_junior_youth ON dashboard_trainne(junior_youth);');


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

    // Create news_announcements table
    await db.query(`
      CREATE TABLE IF NOT EXISTS news_announcements (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        date_string VARCHAR(50),
        time_string VARCHAR(50),
        description TEXT,
        contacts TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed data for news_announcements
    const newsCheck = await db.query('SELECT COUNT(*) FROM news_announcements');
    if (parseInt(newsCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding news_announcements table...');
      await db.query(`
        INSERT INTO news_announcements (category, title, date_string, time_string, description, contacts, image_url) VALUES
        ('Umum', 'REAL STAGE: How to Join', '23 Jun 2026', '11:55', 'Trainee dapat mempersiapkan diri dan melakukan pendaftaran setelah menyelesaikan seluruh Speaking & Life Projects serta mempelajari panduan Real Stage yang telah disediakan.', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815', NULL),
        ('Umum', 'Parents Trainer Meeting', '23 Jun 2026', '10:41', 'Papa Mama dapat mendaftar sebelum 5 Juli 2026 melalui link pendaftaran https://smlone.xyz/ptm untuk mengikuti konsultasi one-on-one mengenai perkembangan anak dengan trainer di SMLONE Cabang Cemara Asri (https://g.co/kgs/VZxUctT).', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815\nHubungi Aurel 0851-6355-9331', NULL),
        ('Umum', 'Jumat Produktif Bersama SMLONE', '20 Jun 2026', '09:00', 'Tingkatkan diri Anda bersama SMLONE. Rangkaian program workshop interaktif mingguan untuk pembentukan karakter, kemampuan leadership, teknik presentasi sales, serta peningkatan produktivitas yang dibimbing langsung oleh trainer berpengalaman puluhan tahun di bidangnya.', 'Hubungi Jovita 0811-6785-818', NULL),
        ('Umum', 'Future Leaders Camp 2026', '30 Jun 2026', '10:00', 'Summer camp program pembentukan karakter & kepercayaan diri anak usia sekolah. Tersedia kategori: Apprentice (1-3 SD), Junior (4-6 SD), dan Youth (SMP-SMA).', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815\nHubungi Aurel 0851-6355-9331', NULL),
        ('Umum', 'Lantern & Legends Holiday Camp', '11 Jun 2026', '08:30', 'Belajar budaya & bahasa Mandarin secara interaktif selama 2 hari penuh (Full Mandarin Speaking Experience). Terbuka untuk Explorers (Grade 2-6) dan Legends (Grade 7-12).', 'Hubungi Sophia 081-1620-5815\nHubungi Jovita 0811-6505-815\nHubungi Aurel 0851-6355-9331', NULL),
        ('Umum', 'Open New Class Baca Tulis', '18 Jun 2026', '11:00', 'Kelas membaca dan menulis baru untuk si kecil. Dapatkan promo spesial harga khusus untuk 3 pendaftar pertama beserta free student pack lengkap (tas, kaos, map, progress report, trial sheet).', 'Hubungi Sophia 0811-620-5815', NULL),
        ('Umum', 'Public Speaking Untuk Pemula', '26 Jul 2026', '13:44', 'Pelatihan public speaking intensif dengan praktek langsung, e-sertifikat, dokumentasi video, training handout, makan siang & coffee break. Khusus usia 18 tahun ke atas.', 'Hubungi Jovita 0811-6785-818', NULL)
      `);
      console.log('🌱 Seeding news_announcements completed!');
    }

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

    await db.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_contacts (
        id SERIAL PRIMARY KEY,
        cabang VARCHAR(100) NOT NULL,
        nama_admin VARCHAR(100) NOT NULL,
        nomor_wa VARCHAR(50) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      ALTER TABLE gp_month ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;
    `);

    await db.query(`
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
    `);

    // Create level_1_ca_registrations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_ca_registrations (
        id SERIAL PRIMARY KEY,
        timestamp_str VARCHAR(100),
        email VARCHAR(255),
        full_name VARCHAR(255),
        dob VARCHAR(100),
        gender VARCHAR(50),
        address TEXT,
        phone VARCHAR(100),
        program VARCHAR(100),
        registration_date VARCHAR(100),
        selected_program VARCHAR(100),
        school VARCHAR(255),
        parent_email VARCHAR(255),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(100),
        grade VARCHAR(100),
        source VARCHAR(255),
        ig_mom VARCHAR(100),
        ig_dad VARCHAR(100),
        ig_child VARCHAR(100),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email, full_name)
      );
    `);

    console.log('✅ Database schema updated successfully.');
  } catch (err) {
    console.error('❌ Error checking/updating database schema:', err.message);
  }
})();

const app = express();
const PORT = process.env.PORT || 4000;

const path = require('path');

app.use(helmet({ crossOriginResourcePolicy: false })); // allow static images cross-origin
app.use(cors({
  origin: [
    'https://portal.smlone.com',
    'https://admin.smlone.com',
    'http://localhost:5173',       // local dev
    'http://localhost:5174',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

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


// Apply general rate limiter to /api, EXCEPT for webhook routes
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/webhook')) {
    return next(); // Bypass limiter for n8n webhooks
  }
  return generalLimiter(req, res, next);
});
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

// News Endpoint
app.use('/api/news', newsRoutes);

// WhatsApp Contacts Endpoint
app.use('/api/whatsapp', whatsappRoutes);

app.use('/api/contact', dashboardApiRoutes);
app.use('/contact', dashboardApiRoutes);

// Admin Management Endpoints
app.use('/api/admin/trainees', verifyToken, adminTraineesRoutes);
app.use('/admin/trainees', verifyToken, adminTraineesRoutes);
app.use('/api/admin/awards', verifyToken, adminAwardsRoutes);
app.use('/admin/awards', verifyToken, adminAwardsRoutes);
app.use('/api/admin/quiz-history', verifyToken, adminQuizHistoryRoutes);
app.use('/admin/quiz-history', verifyToken, adminQuizHistoryRoutes);
app.use('/api/admin/questions', verifyToken, adminQuestionsRoutes);
app.use('/admin/questions', verifyToken, adminQuestionsRoutes);
app.use('/api/admin/registrations', verifyToken, adminRegistrationsRoutes);
app.use('/admin/registrations', verifyToken, adminRegistrationsRoutes);

// Khusus untuk Webhook n8n (tanpa verifyToken agar tidak expired)
// Menggunakan API Key statis sederhana
app.use('/api/webhook/registrations', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, adminRegistrationsRoutes);

app.use('/api/chat', verifyToken, chatRoutes);
app.use('/api/admin/gp-month', verifyToken, adminGpMonthRoutes);
app.use('/api/admin/house-rank', verifyToken, adminHouseRankRoutes);
app.use('/api/admin/houses', verifyToken, adminHouseRoutes);
app.use('/api/admin/myby-coin', verifyToken, adminMybyCoinRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/admin', verifyToken, adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
