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
const dashboardKeseluruhanRoutes = require('./routes/dashboardKeseluruhanRoutes');
const smlFeedbackRoutes = require('./routes/smlFeedbackRoutes');
const portalTraineeRoutes = require('./routes/portalTraineeRoutes');
const portalAdminRoutes = require('./routes/portalAdminRoutes');
const reportActivityRoutes = require('./routes/reportActivityRoutes');
const linkReportRoutes = require('./routes/linkReportRoutes');
const portalTraineeWebhookRoutes = require('./routes/portalTraineeWebhookRoutes');
const portalAuthRoutes = require('./routes/portalAuthRoutes');
const tabelLoginTraineeRoutes = require('./routes/tabelLoginTraineeRoutes');
const goldpointTraineeRoutes = require('./routes/goldpointTraineeRoutes');
const profileTraineeRoutes = require('./routes/profileTraineeRoutes');
const loginPortalFixRoutes = require('./routes/loginPortalFixRoutes');
const reportTraineeRoutes = require('./routes/reportTraineeRoutes');
const requestRoutes = require('./routes/requestRoutes');
const verifyToken = require('./middleware/authMiddleware');

const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');

const compression = require('compression');
const { cacheMiddleware, invalidateCache, getCacheMetrics } = require('./middleware/cacheMiddleware');
const { getDbMetrics } = require('./db/neonClient');

// Auto DB migration for new columns
(async () => {
  try {
    console.log('🔄 Checking database schema & performance indexes...');
    // Create admin_akun table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_akun (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        role VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        plain_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-seed initial 5 Admin Accounts
    const bcrypt = require('bcryptjs');
    const defaultAccounts = [
      { username: 'super@smlone.id', email: 'super@smlone.id', password: 'super123', role: 'super' },
      { username: 'cro@smlone.id', email: 'cro@smlone.id', password: 'cro123', role: 'cro' },
      { username: 'finance@smlone.id', email: 'finance@smlone.id', password: 'finance123', role: 'finance' },
      { username: 'training@smlone.id', email: 'training@smlone.id', password: 'training123', role: 'training' },
      { username: 'management@smlone.id', email: 'management@smlone.id', password: 'managament123', role: 'management' }
    ];

    for (const acc of defaultAccounts) {
      const hash = await bcrypt.hash(acc.password, 10);
      await db.query(`
        INSERT INTO admin_akun (username, email, role, password, plain_password)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (username) DO UPDATE 
        SET password = EXCLUDED.password, plain_password = EXCLUDED.plain_password, role = EXCLUDED.role, email = EXCLUDED.email
      `, [acc.username, acc.email, acc.role, hash, acc.password]);
    }

    // Drop requested tables to make sure they are removed and not recreated
    await db.query('DROP TABLE IF EXISTS level_1_keseluruhan CASCADE');
    await db.query('DROP TABLE IF EXISTS level_1_automed_smlone_staff CASCADE');
    await db.query('DROP TABLE IF EXISTS dashboard_cemara CASCADE');
    await db.query('DROP TABLE IF EXISTS data_form_lama CASCADE');
    await db.query('DROP TABLE IF EXISTS sml_report CASCADE');

    // Create news_announcements table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS news_announcements (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        date_string VARCHAR(100),
        time_string VARCHAR(100),
        description TEXT,
        contacts VARCHAR(255),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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



    // Create profile_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_trainee (
        trainee_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        program VARCHAR(100),
        class VARCHAR(100),
        level VARCHAR(100),
        membership_expired_date DATE,
        latest_speaking_project VARCHAR(255),
        weekly_report_url TEXT,
        quarterly_report_url TEXT,
        real_stage_report_url TEXT,
        referral_code VARCHAR(100),
        progress_video_url TEXT,
        gender VARCHAR(20),
        date_of_birth DATE,
        school_name VARCHAR(255),
        branch_id VARCHAR(50),
        first_enroll DATE,
        newest_grade VARCHAR(100),
        trainee_homeroom VARCHAR(100),
        screening_test_url TEXT,
        speaking_project_to_next_level VARCHAR(255),
        last_life_project_date DATE,
        last_life_project VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS quarterly_report_url TEXT;
      ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS real_stage_report_url TEXT;
      ALTER TABLE profile_trainee ADD COLUMN IF NOT EXISTS branch_id VARCHAR(50);
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_branch_id ON profile_trainee(branch_id);
    `);

    // Create login_portal_fix table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_portal_fix (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        gender VARCHAR(50),
        date_of_birth DATE,
        nama_sekolah VARCHAR(255),
        cleaned_program VARCHAR(255),
        membership VARCHAR(100),
        expiry_date DATE,
        cabang_id VARCHAR(100),
        first_enroll DATE,
        class VARCHAR(255),
        house VARCHAR(255),
        level VARCHAR(50),
        house_role VARCHAR(100),
        cabang_kelas VARCHAR(100),
        newest_grade VARCHAR(50),
        trainee_homeroom VARCHAR(100),
        screening_test TEXT,
        draft_grade VARCHAR(50),
        prev_grade VARCHAR(50),
        ajy_by_class VARCHAR(50),
        last_real_stage DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE login_portal_fix ADD COLUMN IF NOT EXISTS screening_test TEXT;
      CREATE INDEX IF NOT EXISTS idx_login_portal_fix_membership ON login_portal_fix(membership);
      CREATE INDEX IF NOT EXISTS idx_login_portal_fix_cabang ON login_portal_fix(cabang_id);
    `);

    // Create login_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_trainee (
        id BIGSERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL REFERENCES profile_trainee(trainee_id) ON DELETE CASCADE ON UPDATE CASCADE,
        password VARCHAR(255) NOT NULL,
        plain_password VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_login_trainee_student_id ON login_trainee(student_id);
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_class_name ON profile_trainee(class_name);
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_created_at ON profile_trainee(created_at);
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_updated_at ON profile_trainee(updated_at);
      CREATE INDEX IF NOT EXISTS idx_registrasi_ca_created_at ON registrasi_ca(created_at);
      CREATE INDEX IF NOT EXISTS idx_registrasi_cp_created_at ON registrasi_cp(created_at);
      CREATE INDEX IF NOT EXISTS idx_registrasi_tr_created_at ON registrasi_tr(created_at);
    `);

    // Create profile_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_trainee (
        class_name VARCHAR(100),
        day VARCHAR(50),
        time VARCHAR(50),
        room VARCHAR(100),
        branch VARCHAR(100),
        trainee_id VARCHAR(50),
        name VARCHAR(255),
        level VARCHAR(50),
        newest_grade VARCHAR(50),
        house VARCHAR(100),
        house_role VARCHAR(100),
        trainee_homeroom VARCHAR(100),
        homeroom_kelas VARCHAR(100),
        trainer VARCHAR(100),
        membership_status VARCHAR(50),
        membership_expired_date DATE,
        first_enroll DATE,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_trainee_id ON profile_trainee(trainee_id);
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_branch ON profile_trainee(branch);
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_class_name ON profile_trainee(class_name);

      -- Create report_activity table
      CREATE TABLE IF NOT EXISTS report_activity (
        trainee_id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        branch VARCHAR(100),
        cleaned_program VARCHAR(255),
        cleaned_class VARCHAR(255),
        level VARCHAR(100),
        speaking_project_to_next_level VARCHAR(50),
        life_project_to_next_level VARCHAR(50),
        last_speaking_project VARCHAR(100),
        level_up_sp VARCHAR(100),
        level_up_lp VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_report_activity_branch ON report_activity(branch);
      CREATE INDEX IF NOT EXISTS idx_report_activity_cleaned_class ON report_activity(cleaned_class);

      -- Create link_report table
      CREATE TABLE IF NOT EXISTS link_report (
        trainee_id VARCHAR(50) NOT NULL,
        term VARCHAR(100) NOT NULL,
        link_term TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (trainee_id, term)
      );
      CREATE INDEX IF NOT EXISTS idx_link_report_trainee_id ON link_report(trainee_id);

      -- Create report_trainee table
      CREATE TABLE IF NOT EXISTS report_trainee (
        id VARCHAR(50) PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL,
        report_title TEXT,
        link_yt TEXT,
        report_title_2 TEXT,
        link_term TEXT,
        link_terms JSONB,
        report_title_3 TEXT,
        link_to_report TEXT,
        link_reports_3 JSONB,
        report_title_4 TEXT,
        link_to_report_4 TEXT,
        referral_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_2 TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_term TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_terms JSONB;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_3 TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_reports_3 JSONB;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_4 TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report_4 TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS referral_code TEXT;
      CREATE INDEX IF NOT EXISTS idx_report_trainee_trainee_id ON report_trainee(trainee_id);
    `);

    console.log('✅ Database schema and performance indexes updated successfully.');
  } catch (err) {
    console.error('❌ Error checking/updating database schema:', err.message);
  }
})();

const app = express();
const PORT = process.env.PORT || 4000;

const path = require('path');

app.use(compression());
app.use(helmet({ crossOriginResourcePolicy: false })); // allow static images cross-origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma', 'x-api-key'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);

// Rate limiting disabled by request to prevent 429 (Too Many Requests) errors
app.use('/api', (req, res, next) => {
  return next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMLONE Backend is running!' });
});

// Live Performance & Health Metrics
app.get('/api/metrics', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    cache: getCacheMetrics(),
    database: getDbMetrics(),
  });
});

// Global mutation auto-invalidation middleware
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const parts = req.path.split('/').filter(Boolean);
    if (parts.length > 0) {
      invalidateCache(`/api/${parts[0]}`);
      invalidateCache(`/${parts[0]}`);
    }
  }
  next();
});

// Routes
app.use('/api/goldpoint-trainee', goldpointTraineeRoutes);
app.use('/api/goldpoint_trainee', goldpointTraineeRoutes);
app.use('/api/admin/goldpoint-trainee', goldpointTraineeRoutes);
app.use('/api/admin/goldpoint_trainee', goldpointTraineeRoutes);
app.use('/api/dashboard/goldpoint-trainee', goldpointTraineeRoutes);
app.use('/api/dashboard/goldpoint_trainee', goldpointTraineeRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/portal-trainee', portalTraineeRoutes);
app.use('/api/portal-admin', portalAdminRoutes);
app.use('/api/admin/portal-admin', portalAdminRoutes);
app.use('/portal-admin', portalAdminRoutes);
app.use('/admin/portal-admin', portalAdminRoutes);
app.use('/api/profile-trainee', profileTraineeRoutes);
app.use('/api/profile-trainee-full', profileTraineeRoutes);
app.use('/api/trainee-complete-data', profileTraineeRoutes);
app.use('/api/admin/profile-trainee', profileTraineeRoutes);
app.use('/profile-trainee', profileTraineeRoutes);
app.use('/admin/profile-trainee', profileTraineeRoutes);
app.use('/api/report-activity', reportActivityRoutes);
app.use('/api/admin/report-activity', reportActivityRoutes);
app.use('/report-activity', reportActivityRoutes);
app.use('/admin/report-activity', reportActivityRoutes);
app.use('/api/link-report', linkReportRoutes);
app.use('/api/admin/link-report', linkReportRoutes);
app.use('/link-report', linkReportRoutes);
app.use('/admin/link-report', linkReportRoutes);
app.use('/api/auth/trainee', portalAuthRoutes);
app.use('/api/tabel-login-trainee', tabelLoginTraineeRoutes);
app.use('/api/tabel_login_trainee', tabelLoginTraineeRoutes);
app.use('/tabel-login-trainee', tabelLoginTraineeRoutes);
app.use('/api/admin/tabel-login-trainee', tabelLoginTraineeRoutes);
app.use('/api/login-portal-fix', loginPortalFixRoutes);
app.use('/api/login_portal_fix', loginPortalFixRoutes);
app.use('/login-portal-fix', loginPortalFixRoutes);
app.use('/api/admin/login-portal-fix', loginPortalFixRoutes);
app.use('/api/report-trainee', reportTraineeRoutes);
app.use('/api/report_trainee', reportTraineeRoutes);
app.use('/report-trainee', reportTraineeRoutes);
app.use('/report_trainee', reportTraineeRoutes);
app.use('/api/admin/report-trainee', reportTraineeRoutes);
app.use('/api/dashboard-trainee', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/login', authRoutes);
app.use('/admin/login', authRoutes);
app.use('/api/admin/auth/login', authRoutes);
app.use('/api/students', studentRoutes);
// Custom Dashboard & Contact Endpoints
app.use('/api/dashboard', cacheMiddleware(300), dashboardApiRoutes);
app.use('/dashboard', cacheMiddleware(300), dashboardApiRoutes);

// News Endpoint
app.use('/api/news', cacheMiddleware(300), newsRoutes);

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
app.use('/api/admin/registrasi-new-seluruh-cabang', verifyToken, registrasiNewRoutes);
app.use('/admin/registrasi-new-seluruh-cabang', verifyToken, registrasiNewRoutes);



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

app.use('/api/webhook/portal-trainee', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, portalTraineeWebhookRoutes);






app.use('/api/registrasi-ca', registrasiCaRoutes);
app.use('/api/registrasi-cp', registrasiCpRoutes);
app.use('/api/registrasi-tr', registrasiTrRoutes);
app.use('/api/registrasi-new', registrasiNewRoutes);
app.use('/api/registrasi-new/push', registrasiNewRoutes);
app.use('/api_gistrasi-new', registrasiNewRoutes);
app.use('/api_gistrasi-new/push', registrasiNewRoutes);
app.use('/api/dashboard-keseluruhan', verifyToken, dashboardKeseluruhanRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin/gp-month', verifyToken, adminGpMonthRoutes);
app.use('/api/admin/house-rank', verifyToken, adminHouseRankRoutes);
app.use('/api/admin/houses', verifyToken, adminHouseRoutes);
app.use('/api/admin/myby-coin', verifyToken, adminMybyCoinRoutes);
app.use('/api/admin/sml-feedback', verifyToken, smlFeedbackRoutes);
app.use('/admin/sml-feedback', verifyToken, smlFeedbackRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/admin', verifyToken, adminRoutes);

// Request Fitur Endpoints
app.use('/api/request', requestRoutes);
app.use('/api/admin/request', verifyToken, requestRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;

