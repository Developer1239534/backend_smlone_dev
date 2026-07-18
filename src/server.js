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
const level1KeseluruhanRoutes = require('./routes/level1KeseluruhanRoutes');
const level1AutomedSmloneStaffRoutes = require('./routes/level1AutomedSmloneStaffRoutes');
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

    // Create level_1_keseluruhan table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_keseluruhan (
        id SERIAL PRIMARY KEY,
        email_address TEXT,
        full_name TEXT,
        dob TEXT,
        gender TEXT,
        address TEXT,
        contact_whatsapp TEXT,
        program TEXT,
        pernah_ikut_program TEXT,
        program_pernah_diikuti TEXT,
        todays_date TEXT,
        i_agree_doc TEXT,
        program_dipilih TEXT,
        nama_sekolah TEXT,
        kelas_peserta TEXT,
        parents_email TEXT,
        emergency_contact_person TEXT,
        emergency_contact_number TEXT,
        tahu_smlone_dari TEXT,
        referensi_teman TEXT,
        ig_mama TEXT,
        ig_papa TEXT,
        ig_anak TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email_address, full_name)
      );
    `);

    // Create level_1_automed_smlone_staff table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_automed_smlone_staff (
        id SERIAL PRIMARY KEY,
        trainee_id TEXT UNIQUE,
        name TEXT,
        gender TEXT,
        dob TEXT,
        nama_sekolah TEXT,
        cleaned_program TEXT,
        membership TEXT,
        expiry_date TEXT,
        cabang_id TEXT,
        first_enroll TEXT,
        class_name TEXT,
        house TEXT,
        level TEXT,
        house_role TEXT,
        cabang_kelas TEXT,
        newest_grade TEXT,
        trainee_homeroom TEXT,
        screening_test TEXT,
        draft_grade TEXT,
        prev_grade TEXT,
        ajy_by_class TEXT,
        last_real_stage TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
app.use('/api/admin/level-1-keseluruhan', verifyToken, level1KeseluruhanRoutes);
app.use('/admin/level-1-keseluruhan', verifyToken, level1KeseluruhanRoutes);
app.use('/api/admin/level-1-automed-smlone-staff', verifyToken, level1AutomedSmloneStaffRoutes);
app.use('/admin/level-1-automed-smlone-staff', verifyToken, level1AutomedSmloneStaffRoutes);

// Khusus untuk Webhook n8n (tanpa verifyToken agar tidak expired)
// Menggunakan API Key statis sederhana
app.use('/api/webhook/level-1-keseluruhan', level1KeseluruhanRoutes);
app.use('/api/webhook/level-1-automed-smlone-staff', level1AutomedSmloneStaffRoutes);

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
