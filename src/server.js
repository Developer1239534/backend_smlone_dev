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
const chatRoutes = require('./routes/chatRoutes');
const newsRoutes = require('./routes/newsRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const registrasiCaRoutes = require('./routes/registrasiCaRoutes');
const registrasiCpRoutes = require('./routes/registrasiCpRoutes');
const registrasiTrRoutes = require('./routes/registrasiTrRoutes');
const registrasiNewRoutes = require('./routes/registrasiNewRoutes');
const verifyToken = require('./middleware/authMiddleware');

const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');

// Auto DB migration for new columns
(async () => {
  try {
    console.log('🔄 Checking database schema...');
    // Create admin_akun table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_akun (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        plain_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Drop requested tables to make sure they are removed and not recreated
    await db.query('DROP TABLE IF EXISTS level_1_keseluruhan CASCADE');
    await db.query('DROP TABLE IF EXISTS level_1_automed_smlone_staff CASCADE');
    await db.query('DROP TABLE IF EXISTS dashboard_cemara CASCADE');
    await db.query('DROP TABLE IF EXISTS data_form_lama CASCADE');
    await db.query('DROP TABLE IF EXISTS sml_report CASCADE');

    // Create registrasi_new table
    await db.query(`
      CREATE TABLE IF NOT EXISTS registrasi_new (
        id SERIAL PRIMARY KEY,
        email_address VARCHAR(255),
        full_name VARCHAR(255),
        dob VARCHAR(100),
        gender VARCHAR(50),
        address TEXT,
        contact_whatsapp VARCHAR(100),
        program VARCHAR(100),
        pernah_ikut_program VARCHAR(255),
        program_pernah_diikuti VARCHAR(255),
        todays_date VARCHAR(100),
        i_agree_doc TEXT,
        program_dipilih VARCHAR(100),
        nama_sekolah VARCHAR(255),
        kelas_peserta VARCHAR(100),
        parents_email VARCHAR(255),
        emergency_contact_person VARCHAR(255),
        emergency_contact_number VARCHAR(100),
        tahu_smlone_dari VARCHAR(255),
        referensi_teman VARCHAR(255),
        ig_mama VARCHAR(100),
        ig_papa VARCHAR(100),
        ig_anak VARCHAR(100),
        cabang VARCHAR(100),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email_address, full_name)
      );
    `);

    // Create registrasi_ca table
    await db.query(`
      CREATE TABLE IF NOT EXISTS registrasi_ca (
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
        agreement TEXT,
        selected_program VARCHAR(100),
        school VARCHAR(255),
        parent_email VARCHAR(255),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(100),
        grade VARCHAR(100),
        source VARCHAR(255),
        referral_name VARCHAR(255),
        ig_mom VARCHAR(100),
        ig_dad VARCHAR(100),
        ig_child VARCHAR(100),
        training_goal TEXT,
        training_expectation TEXT,
        event_source VARCHAR(255),
        previous_program VARCHAR(255),
        previous_program_name VARCHAR(255),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email, full_name)
      );
    `);

    // Create registrasi_cp table
    await db.query(`
      CREATE TABLE IF NOT EXISTS registrasi_cp (
        id SERIAL PRIMARY KEY,
        timestamp_str TEXT,
        email_address TEXT,
        full_name TEXT,
        last_name TEXT,
        dob TEXT,
        gender TEXT,
        address TEXT,
        contact_whatsapp TEXT,
        email_account TEXT,
        program TEXT,
        todays_date TEXT,
        i_agree_doc TEXT,
        program_dipilih TEXT,
        nama_sekolah TEXT,
        emergency_contact_person TEXT,
        emergency_contact_number TEXT,
        kelas_peserta TEXT,
        latest_self_portrait TEXT,
        shirt_size TEXT,
        tujuan_pelatihan TEXT,
        harapan_pelatihan TEXT,
        tahu_event_dari TEXT,
        parents_email TEXT,
        tahu_program_dari TEXT,
        tahu_smlone_dari TEXT,
        referensi_teman TEXT,
        referensi_teman_2 TEXT,
        ig_mama TEXT,
        ig_papa TEXT,
        ig_anak TEXT,
        pernah_ikut_program TEXT,
        program_pernah_diikuti TEXT,
        ig_account_anda TEXT,
        ig_account_anak_anda TEXT,
        ig_account_anda_2 TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email_address, full_name)
      );
    `);

    // Create registrasi_tr table
    await db.query(`
      CREATE TABLE IF NOT EXISTS registrasi_tr (
        id SERIAL PRIMARY KEY,
        timestamp_str TEXT,
        email_address TEXT,
        full_name TEXT,
        dob TEXT,
        gender TEXT,
        address TEXT,
        contact_whatsapp TEXT,
        program TEXT,
        todays_date TEXT,
        i_agree_doc TEXT,
        program_dipilih TEXT,
        nama_sekolah TEXT,
        parents_email TEXT,
        emergency_contact_person TEXT,
        emergency_contact_number TEXT,
        kelas_peserta TEXT,
        tahu_smlone_dari TEXT,
        latest_self_portrait TEXT,
        tujuan_pelatihan TEXT,
        harapan_pelatihan TEXT,
        tahu_event_dari TEXT,
        referensi_teman TEXT,
        program_dipilih_2 TEXT,
        nama_sekolah_2 TEXT,
        parents_email_2 TEXT,
        emergency_contact_person_2 TEXT,
        emergency_contact_number_2 TEXT,
        kelas_peserta_2 TEXT,
        tahu_smlone_dari_2 TEXT,
        referensi_teman_2 TEXT,
        latest_self_portrait_2 TEXT,
        referensi_teman_3 TEXT,
        ig_mama TEXT,
        ig_papa TEXT,
        ig_anak TEXT,
        ig_mama_2 TEXT,
        ig_papa_2 TEXT,
        ig_anak_2 TEXT,
        pernah_ikut_program TEXT,
        program_pernah_diikuti TEXT,
        terhubung_ig TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email_address, full_name)
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
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const isSmlone = origin.endsWith('.smlone.com') || origin === 'https://smlone.com' || origin.endsWith('.smlone.cloud') || origin === 'https://smlone.cloud';
    
    if (isLocalhost || isSmlone) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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


app.use('/api/admin/registrasi-ca', verifyToken, registrasiCaRoutes);
app.use('/admin/registrasi-ca', verifyToken, registrasiCaRoutes);
app.use('/api/admin/registrasi-cp', verifyToken, registrasiCpRoutes);
app.use('/admin/registrasi-cp', verifyToken, registrasiCpRoutes);
app.use('/api/admin/registrasi-tr', verifyToken, registrasiTrRoutes);
app.use('/admin/registrasi-tr', verifyToken, registrasiTrRoutes);

app.use('/api/admin/registrasi-new', verifyToken, registrasiNewRoutes);
app.use('/admin/registrasi-new', verifyToken, registrasiNewRoutes);
app.use('/api/registrasi-new', verifyToken, registrasiNewRoutes);
app.use('/registrasi-new', verifyToken, registrasiNewRoutes);

// Khusus untuk Webhook n8n (tanpa verifyToken agar tidak expired)
// Menggunakan API Key statis sederhana
app.use('/api/webhook/registrasi-ca', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, registrasiCaRoutes);

app.use('/api/webhook/registrasi-cp', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, registrasiCpRoutes);

app.use('/api/webhook/registrasi-tr', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, registrasiTrRoutes);

app.use('/api/webhook/registrasi-new', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, registrasiNewRoutes);




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
