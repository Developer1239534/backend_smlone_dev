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
const houseAllegianceRoutes = require('./routes/houseAllegianceRoutes');
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
const loginPortalllllRoutes = require('./routes/loginPortalllllRoutes');
const reportTraineeRoutes = require('./routes/reportTraineeRoutes');
const goldPointRankingRoutes = require('./routes/goldPointRankingRoutes');
const rankingHouseRoutes = require('./routes/rankingHouseRoutes');
const goldPoinSetahunRoutes = require('./routes/goldPoinSetahunRoutes');
const reportTraineeDataRoutes = require('./routes/reportTraineeDataRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const requestRoutes = require('./routes/requestRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const monthlyGoldPointRoutes = require('./routes/monthlyGoldPointRoutes');
const reportProgresRoutes = require('./routes/reportProgresRoutes');
const historyHouseRoutes = require('./routes/historyHouseRoutes');
const award2025Routes = require('./routes/award2025Routes');
const weeklyReportRoutes = require('./routes/weeklyReportRoutes');
const idGoldPointRoutes = require('./routes/idGoldPointRoutes');
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
    await db.query('DROP TABLE IF EXISTS gold_point_ranking CASCADE');
    await db.query('DROP TABLE IF EXISTS gold_point_rankings CASCADE');
    await db.query('DROP TABLE IF EXISTS ranking_houses CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_ca CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_cp CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_tr CASCADE');
    await db.query('DROP TABLE IF EXISTS news_announcements CASCADE');
    await db.query('DROP TABLE IF EXISTS request_fitur CASCADE');



    // Auto-create profile_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_trainee (
        trainee_id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        personal_email VARCHAR(255),
        school VARCHAR(255),
        birthday VARCHAR(100),
        trainee_wa_number VARCHAR(100),
        parent_wa_number VARCHAR(100),
        house VARCHAR(100),
        house_role VARCHAR(100),
        membership_status VARCHAR(100),
        first_enroll VARCHAR(100),
        membership_expired_date VARCHAR(100),
        class_name VARCHAR(255),
        level VARCHAR(100),
        newest_grade VARCHAR(100),
        branch VARCHAR(100),
        room VARCHAR(100),
        day VARCHAR(100),
        time VARCHAR(100),
        trainer VARCHAR(100),
        trainee_homeroom VARCHAR(255),
        homeroom_kelas VARCHAR(255),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_name ON profile_trainee(name);
      CREATE INDEX IF NOT EXISTS idx_profile_trainee_branch ON profile_trainee(branch);
    `);



    await db.query(`
      -- Create house_rank table
      CREATE TABLE IF NOT EXISTS house_rank (
        "Nama House" VARCHAR(255),
        "Total Gold" INT DEFAULT 0,
        "Class" VARCHAR(255),
        "Cabang" VARCHAR(255),
        "Program" VARCHAR(255),
        "Rank" INT
      );

      -- Create house_allegiance table
      CREATE TABLE IF NOT EXISTS house_allegiance (
        "id" SERIAL PRIMARY KEY,
        "question" TEXT NOT NULL,
        "options" JSONB
      );
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
    invalidateCache(); // Clear all memory cache on any data mutation
  }
  next();
});

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/sml-feedback', feedbackRoutes);
app.use('/api/sml_feedback', feedbackRoutes);
app.use('/api/trainee-feedback', feedbackRoutes);
app.use('/api/student-feedback', feedbackRoutes);
app.use('/api/coach-feedback', feedbackRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/feedbacks', feedbackRoutes);

app.use('/api/ranking-house', rankingHouseRoutes);
app.use('/api/ranking_house', rankingHouseRoutes);
app.use('/api/ranking-houses', rankingHouseRoutes);
app.use('/api/ranking_houses', rankingHouseRoutes);
app.use('/api/house-rankings', rankingHouseRoutes);
app.use('/api/house-ranking', rankingHouseRoutes);
app.use('/api/house_rankings', rankingHouseRoutes);
app.use('/api/house_ranking', rankingHouseRoutes);
app.use('/api/admin/ranking-house', rankingHouseRoutes);
app.use('/api/admin/ranking_house', rankingHouseRoutes);
app.use('/ranking-house', rankingHouseRoutes);
app.use('/ranking_house', rankingHouseRoutes);
app.use('/ranking-houses', rankingHouseRoutes);
app.use('/ranking_houses', rankingHouseRoutes);

app.use('/api/gold-poin-setahun', goldPoinSetahunRoutes);
app.use('/api/gold_poin_setahun', goldPoinSetahunRoutes);
app.use('/api/gold-point-setahun', goldPoinSetahunRoutes);
app.use('/api/gold_point_setahun', goldPoinSetahunRoutes);
app.use('/api/gold-points-tahunan', goldPoinSetahunRoutes);
app.use('/api/gold_points_tahunan', goldPoinSetahunRoutes);
app.use('/api/gold-point-yearly', goldPoinSetahunRoutes);
app.use('/api/gold_point_yearly', goldPoinSetahunRoutes);
app.use('/gold-poin-setahun', goldPoinSetahunRoutes);
app.use('/gold-point-setahun', goldPoinSetahunRoutes);
app.use('/gold-points-tahunan', goldPoinSetahunRoutes);

app.use('/api/report-trainee-data', reportTraineeDataRoutes);
app.use('/api/report_trainee_data', reportTraineeDataRoutes);
app.use('/report-trainee-data', reportTraineeDataRoutes);
app.use('/report_trainee_data', reportTraineeDataRoutes);

app.use('/api/goldpoint-trainee', monthlyGoldPointRoutes);
app.use('/api/goldpoint_trainee', monthlyGoldPointRoutes);
app.use('/api/admin/goldpoint-trainee', monthlyGoldPointRoutes);
app.use('/api/admin/goldpoint_trainee', monthlyGoldPointRoutes);
app.use('/api/dashboard/goldpoint-trainee', monthlyGoldPointRoutes);
app.use('/api/dashboard/goldpoint_trainee', monthlyGoldPointRoutes);
app.use('/api/gold-point-rankings', monthlyGoldPointRoutes);
app.use('/api/gold_point_rankings', monthlyGoldPointRoutes);
app.use('/api/gold-point-ranking', monthlyGoldPointRoutes);
app.use('/api/gold_point_ranking', monthlyGoldPointRoutes);
app.use('/api/admin/gold-point-ranking', monthlyGoldPointRoutes);
app.use('/api/admin/gold-point-rankings', monthlyGoldPointRoutes);
app.use('/api/portal-trainee/gold-point-rankings', monthlyGoldPointRoutes);
app.use('/api/portal-admin/gold-point-rankings', monthlyGoldPointRoutes);
app.use('/gold-point-ranking', monthlyGoldPointRoutes);
app.use('/gold-point-rankings', monthlyGoldPointRoutes);

// Public Feedback Routes (Table feedback - 20 columns, id primary key)
app.use('/api/feedback', feedbackRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/sml-feedback', feedbackRoutes);
app.use('/api/sml_feedback', feedbackRoutes);
app.use('/api/trainee-feedback', feedbackRoutes);
app.use('/api/feedback-trainee', feedbackRoutes);
app.use('/api/trainee/feedback', feedbackRoutes);
app.use('/api/dashboard-feedback', feedbackRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/sml-feedback', feedbackRoutes);
app.use('/trainee-feedback', feedbackRoutes);
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
app.use('/api/login-portalllll', loginPortalllllRoutes);
app.use('/api/login_portalllll', loginPortalllllRoutes);
app.use('/login-portalllll', loginPortalllllRoutes);
app.use('/api/admin/login-portalllll', loginPortalllllRoutes);
app.use('/api/report-trainee', reportTraineeRoutes);
app.use('/api/report_trainee', reportTraineeRoutes);
app.use('/report-trainee', reportTraineeRoutes);
app.use('/report_trainee', reportTraineeRoutes);
app.use('/api/admin/report-trainee', reportTraineeRoutes);

app.use('/api/report-progres', reportProgresRoutes);
app.use('/api/report_progres', reportProgresRoutes);
app.use('/api/report-progress', reportProgresRoutes);
app.use('/api/report_progress', reportProgresRoutes);
app.use('/report-progres', reportProgresRoutes);
app.use('/report_progres', reportProgresRoutes);
app.use('/report-progress', reportProgresRoutes);
app.use('/report_progress', reportProgresRoutes);
app.use('/api/admin/report-progres', reportProgresRoutes);
app.use('/api/admin/report-progress', reportProgresRoutes);

app.use('/api/history-house', historyHouseRoutes);
app.use('/api/history_house', historyHouseRoutes);
app.use('/history-house', historyHouseRoutes);
app.use('/history_house', historyHouseRoutes);
app.use('/api/admin/history-house', historyHouseRoutes);

app.use('/api/award-2025', award2025Routes);
app.use('/api/award_2025', award2025Routes);
app.use('/award-2025', award2025Routes);
app.use('/award_2025', award2025Routes);
app.use('/api/admin/award-2025', award2025Routes);

app.use('/api/weekly-report', weeklyReportRoutes);
app.use('/api/weekly_report', weeklyReportRoutes);
app.use('/weekly-report', weeklyReportRoutes);
app.use('/weekly_report', weeklyReportRoutes);
app.use('/api/admin/weekly-report', weeklyReportRoutes);

app.use('/api/credential-portal', credentialRoutes);
app.use('/api/credential_portal', credentialRoutes);
app.use('/credential-portal', credentialRoutes);
app.use('/credential_portal', credentialRoutes);
app.use('/api/admin/credential-portal', credentialRoutes);

app.use('/api/monthly-gold-point', monthlyGoldPointRoutes);
app.use('/api/monthly_gold_point', monthlyGoldPointRoutes);
app.use('/api/monthly-gold-points', monthlyGoldPointRoutes);
app.use('/api/monthly_gold_points', monthlyGoldPointRoutes);
app.use('/monthly-gold-point', monthlyGoldPointRoutes);
app.use('/monthly_gold_point', monthlyGoldPointRoutes);
app.use('/monthly-gold-points', monthlyGoldPointRoutes);
app.use('/monthly_gold_points', monthlyGoldPointRoutes);
app.use('/api/admin/monthly-gold-point', monthlyGoldPointRoutes);
app.use('/api/admin/monthly-gold-points', monthlyGoldPointRoutes);
app.use('/api/gp-month', monthlyGoldPointRoutes);
app.use('/api/gp_month', monthlyGoldPointRoutes);
app.use('/api/goldpoint-trainee', monthlyGoldPointRoutes);
app.use('/api/goldpoint_trainee', monthlyGoldPointRoutes);
app.use('/goldpoint-trainee', monthlyGoldPointRoutes);
app.use('/goldpoint_trainee', monthlyGoldPointRoutes);

app.use('/api/id-gold-point', idGoldPointRoutes);
app.use('/api/id_gold_point', idGoldPointRoutes);
app.use('/id-gold-point', idGoldPointRoutes);
app.use('/id_gold_point', idGoldPointRoutes);
app.use('/id-gold-points', idGoldPointRoutes);
app.use('/id_gold_points', idGoldPointRoutes);
app.use('/api/id-gold-points', idGoldPointRoutes);
app.use('/api/id_gold_points', idGoldPointRoutes);
app.use('/api/admin/id-gold-point', idGoldPointRoutes);
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
app.use('/api/house-rank', adminHouseRankRoutes);
app.use('/api/house_rank', adminHouseRankRoutes);
app.use('/house-rank', adminHouseRankRoutes);
app.use('/house_rank', adminHouseRankRoutes);
app.use('/api/admin/house-rank', adminHouseRankRoutes);
app.use('/api/admin/house_rank', adminHouseRankRoutes);

app.use('/api/house-allegiance', houseAllegianceRoutes);
app.use('/api/house_allegiance', houseAllegianceRoutes);
app.use('/house-allegiance', houseAllegianceRoutes);
app.use('/house_allegiance', houseAllegianceRoutes);
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

