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
const level1CaCleanedTraineeRoutes = require('./routes/level1CaCleanedTraineeRoutes');
const level1CpCleanedTraineeRoutes = require('./routes/level1CpCleanedTraineeRoutes');
const level1TrCleanedTraineeRoutes = require('./routes/level1TrCleanedTraineeRoutes');
const level2ReportSeluruhCabangRoutes = require('./routes/level2ReportSeluruhCabangRoutes');
const level2FeedbackStudentsRoutes = require('./routes/level2FeedbackStudentsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const newsRoutes = require('./routes/newsRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const level1CpRegistrationsRoutes = require('./routes/level1CpRegistrationsRoutes');
const level1TrRegistrationsRoutes = require('./routes/level1TrRegistrationsRoutes');
const level1KeseluruhanRoutes = require('./routes/level1KeseluruhanRoutes');
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

    // Create level_1_cp_registrations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_cp_registrations (
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

    // Create level_1_tr_registrations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_tr_registrations (
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

    // Create level_1_ca_cleaned_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_ca_cleaned_trainee (
        id SERIAL PRIMARY KEY,
        name TEXT,
        trainee_id TEXT,
        first_name TEXT,
        last_name TEXT,
        gender TEXT,
        dob TEXT,
        school TEXT,
        grade TEXT,
        phone TEXT,
        profession TEXT,
        email_account TEXT,
        location TEXT,
        profile_picture TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        allow_sharing TEXT,
        program_registered TEXT,
        parents_email TEXT,
        date_created TEXT,
        shirt_size TEXT,
        date_record_created TEXT,
        start_date TEXT,
        membership_duration_days TEXT,
        membership_expiry_date TEXT,
        days_left TEXT,
        status_active_expired TEXT,
        class_status TEXT,
        cleaned_program TEXT,
        membership_status TEXT,
        clean_membership_status TEXT,
        check_ac_ad TEXT,
        cabang TEXT,
        clean_parents_email TEXT,
        new_parent_email TEXT,
        class_name TEXT,
        house TEXT,
        level TEXT,
        house_role TEXT,
        nomor_trainee TEXT,
        email_trainee TEXT,
        check_double_id TEXT,
        new_profile_picture TEXT,
        less_than_2022_students_grade_helper TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email_account, first_name)
      );
    `);

    // Create level_1_cp_cleaned_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_cp_cleaned_trainee (
        id SERIAL PRIMARY KEY,
        trainee_id TEXT UNIQUE,
        name TEXT,
        gender TEXT,
        dob TEXT,
        school TEXT,
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
        contact_whatsapp_parent TEXT,
        contact_whatsapp_anak TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create level_2_feedback_students table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_2_feedback_students (
        id SERIAL PRIMARY KEY,
        row_hash TEXT UNIQUE,
        student_name TEXT,
        trainee_id TEXT,
        house_1 TEXT,
        class_trainers TEXT,
        date_text TEXT,
        coach_feedback TEXT,
        challenge TEXT,
        speaking_project TEXT,
        role_2 TEXT,
        role_3 TEXT,
        role_4 TEXT,
        life_project TEXT,
        win TEXT,
        fav TEXT,
        total_gold TEXT,
        house_2 TEXT,
        level TEXT,
        latest_speaking_project TEXT,
        last_time_speaking TEXT,
        class_name TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create level_2_report_seluruh_cabang table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_2_report_seluruh_cabang (
        id SERIAL PRIMARY KEY,
        trainee_id TEXT UNIQUE,
        name TEXT,
        branch TEXT,
        membership_expiry_date TEXT,
        active_expired TEXT,
        cleaned_program TEXT,
        cleaned_class TEXT,
        house TEXT,
        students_report_link TEXT,
        id_vs_student_report_link TEXT,
        total_gold TEXT,
        level TEXT,
        l1_sproject_1 TEXT,
        l1_sproject_2 TEXT,
        l1_sproject_3 TEXT,
        l1_sproject_4 TEXT,
        l1_sproject_5 TEXT,
        l1_sproject_6 TEXT,
        l1_sproject_7 TEXT,
        l1_sproject_8 TEXT,
        l2_sproject_1 TEXT,
        l2_sproject_2 TEXT,
        l2_sproject_3 TEXT,
        l2_sproject_4 TEXT,
        l2_sproject_5 TEXT,
        l2_sproject_6 TEXT,
        l2_sproject_7 TEXT,
        l2_sproject_8 TEXT,
        l2_sproject_9 TEXT,
        l2_sproject_10 TEXT,
        l3_sproject_1 TEXT,
        l3_sproject_2 TEXT,
        l3_sproject_3 TEXT,
        l3_sproject_4 TEXT,
        l3_sproject_5 TEXT,
        l3_sproject_6 TEXT,
        l3_sproject_7 TEXT,
        l3_sproject_8 TEXT,
        l3_sproject_9 TEXT,
        l3_sproject_10 TEXT,
        l4_sproject_1 TEXT,
        l4_sproject_2 TEXT,
        l4_sproject_3 TEXT,
        l4_sproject_4 TEXT,
        l4_sproject_5 TEXT,
        l4_sproject_6 TEXT,
        l4_sproject_7 TEXT,
        l4_sproject_8 TEXT,
        l4_sproject_9 TEXT,
        l4_sproject_10 TEXT,
        l5_sproject_1 TEXT,
        l5_sproject_2 TEXT,
        l5_sproject_3 TEXT,
        l5_sproject_4 TEXT,
        l5_sproject_5 TEXT,
        l5_sproject_6 TEXT,
        l5_sproject_7 TEXT,
        l5_sproject_8 TEXT,
        l5_sproject_9 TEXT,
        l5_sproject_10 TEXT,
        l6_sproject_1 TEXT,
        l6_sproject_2 TEXT,
        l6_sproject_3 TEXT,
        l6_sproject_4 TEXT,
        l6_sproject_5 TEXT,
        l6_sproject_6 TEXT,
        l6_sproject_7 TEXT,
        l6_sproject_8 TEXT,
        l6_sproject_9 TEXT,
        l6_sproject_10 TEXT,
        latest_speaking_project TEXT,
        speaking_project_to_next_level TEXT,
        level_6_link TEXT,
        last_speaker_date TEXT,
        last_life_project_date TEXT,
        last_life_project TEXT,
        last_attendance TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create level_1_tr_cleaned_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS level_1_tr_cleaned_trainee (
        id SERIAL PRIMARY KEY,
        name TEXT,
        trainee_id TEXT,
        first_name TEXT,
        last_name TEXT,
        gender TEXT,
        dob TEXT,
        school TEXT,
        grade TEXT,
        phone TEXT,
        profession TEXT,
        email_account TEXT,
        location TEXT,
        profile_picture TEXT,
        admin_and_invoice TEXT,
        emergency_contact_phone TEXT,
        allow_sharing TEXT,
        program_registered TEXT,
        parents_email TEXT,
        date_created TEXT,
        shirt_size TEXT,
        date_record_created TEXT,
        start_date TEXT,
        membership_duration_days TEXT,
        membership_expiry_date TEXT,
        days_left TEXT,
        status_active_expired TEXT,
        class_status TEXT,
        cleaned_program TEXT,
        membership_status TEXT,
        clean_membership_status TEXT,
        check_ac_ad TEXT,
        cabang TEXT,
        clean_parents_email TEXT,
        new_parent_email TEXT,
        class_name TEXT,
        house TEXT,
        level TEXT,
        house_role TEXT,
        nomor_trainee TEXT,
        email_trainee TEXT,
        check_double_id TEXT,
        new_profile_picture TEXT,
        raw_data JSONB,
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

    // Clean up old tables as requested by user
    await db.query(`DROP TABLE IF EXISTS level_1_ca_class CASCADE;`);
    await db.query(`DROP TABLE IF EXISTS newest_grade CASCADE;`);
    await db.query(`DROP TABLE IF EXISTS level_1_ca_class_newest_grade CASCADE;`);
    await db.query(`DROP TABLE IF EXISTS cleaned_trainee CASCADE;`);



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
    'https://registrasi.smlone.com',
    'http://localhost:5173',       // local dev
    'http://localhost:5174',
    'http://localhost:8000',
    'http://localhost:3000',
  ],
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
app.use('/api/admin/registrations', verifyToken, adminRegistrationsRoutes);
app.use('/admin/registrations', verifyToken, adminRegistrationsRoutes);
app.use('/api/admin/level-1-cp-registrations', verifyToken, level1CpRegistrationsRoutes);
app.use('/admin/level-1-cp-registrations', verifyToken, level1CpRegistrationsRoutes);
app.use('/api/admin/level-1-tr-registrations', verifyToken, level1TrRegistrationsRoutes);
app.use('/admin/level-1-tr-registrations', verifyToken, level1TrRegistrationsRoutes);
app.use('/api/admin/level-1-keseluruhan', verifyToken, level1KeseluruhanRoutes);
app.use('/admin/level-1-keseluruhan', verifyToken, level1KeseluruhanRoutes);
app.use('/api/admin/level-1-ca-cleaned-trainee', verifyToken, level1CaCleanedTraineeRoutes);
app.use('/admin/level-1-ca-cleaned-trainee', verifyToken, level1CaCleanedTraineeRoutes);
app.use('/api/admin/level-1-cp-cleaned-trainee', verifyToken, level1CpCleanedTraineeRoutes);
app.use('/admin/level-1-cp-cleaned-trainee', verifyToken, level1CpCleanedTraineeRoutes);
app.use('/api/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);
app.use('/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);
app.use('/api/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);
app.use('/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);
app.use('/api/admin/level-2-feedback-students', verifyToken, level2FeedbackStudentsRoutes);
app.use('/admin/level-2-feedback-students', verifyToken, level2FeedbackStudentsRoutes);
// Alias untuk Dashboard frontend lama
app.use('/api/admin/cleaned-trainees', verifyToken, level1CaCleanedTraineeRoutes);
app.use('/admin/cleaned-trainees', verifyToken, level1CaCleanedTraineeRoutes);

// Khusus untuk Webhook n8n (tanpa verifyToken agar tidak expired)
// Menggunakan API Key statis sederhana
app.use('/api/webhook/registrations', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, adminRegistrationsRoutes);

app.use('/api/webhook/level-1-cp-registrations', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, level1CpRegistrationsRoutes);

app.use('/api/webhook/level-1-tr-registrations', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, level1TrRegistrationsRoutes);

app.use('/api/webhook/level-1-keseluruhan', level1KeseluruhanRoutes);

// Khusus untuk Webhook n8n (tanpa verifyToken agar tidak expired)
// Menggunakan API Key statis sederhana
app.use('/api/webhook/level-1-ca-cleaned-trainee', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, level1CaCleanedTraineeRoutes);

app.use('/api/webhook/level-1-cp-cleaned-trainee', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, level1CpCleanedTraineeRoutes);

app.use('/api/webhook/level-1-tr-cleaned-trainee', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, level1TrCleanedTraineeRoutes);

app.use('/api/webhook/level-2-report-seluruh-cabang', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, level2ReportSeluruhCabangRoutes);

app.use('/api/webhook/level-2-feedback-students', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, level2FeedbackStudentsRoutes);

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
