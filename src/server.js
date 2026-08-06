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
const goldPointRankingRoutes = require('./routes/goldPointRankingRoutes');
const rankingHouseRoutes = require('./routes/rankingHouseRoutes');
const goldPoinSetahunRoutes = require('./routes/goldPoinSetahunRoutes');
const reportTraineeDataRoutes = require('./routes/reportTraineeDataRoutes');
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
    await db.query('DROP TABLE IF EXISTS gold_point_ranking CASCADE');
    await db.query('DROP TABLE IF EXISTS ranking_houses CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_ca CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_cp CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_tr CASCADE');
    await db.query('DROP TABLE IF EXISTS news_announcements CASCADE');
    await db.query('DROP TABLE IF EXISTS request_fitur CASCADE');



    await db.query('DROP TABLE IF EXISTS profile_trainee CASCADE');

    await db.query('DROP TABLE IF EXISTS login_portal_fix CASCADE');

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
        name TEXT,
        report_title TEXT,
        link_yt TEXT,
        report_title_2 TEXT,
        link_term TEXT,
        link_terms JSONB,
        report_title_3 TEXT,
        link_to_report TEXT,
        link_reports_3 JSONB,
        report_title_4 TEXT,
        referral_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS name TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_2 TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_term TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_terms JSONB;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_3 TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_to_report TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS link_reports_3 JSONB;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS report_title_4 TEXT;
      ALTER TABLE report_trainee ADD COLUMN IF NOT EXISTS referral_code TEXT;
      ALTER TABLE report_trainee DROP COLUMN IF EXISTS link_to_report_4 CASCADE;
      CREATE INDEX IF NOT EXISTS idx_report_trainee_trainee_id ON report_trainee(trainee_id);

      -- Create gold_point_rankings table
      CREATE TABLE IF NOT EXISTS gold_point_rankings (
        id SERIAL PRIMARY KEY,
        period VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        program VARCHAR(100) NOT NULL,
        trainee_id VARCHAR(255) NOT NULL,
        trainee_name VARCHAR(255),
        membership_status VARCHAR(100),
        level VARCHAR(100),
        house VARCHAR(100),
        class_name VARCHAR(255),
        branch VARCHAR(100),
        total_gold INT DEFAULT 0,
        ranking INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_period_category_program_trainee UNIQUE (period, category, program, trainee_id)
      );
      CREATE INDEX IF NOT EXISTS idx_gold_point_rankings_trainee_id ON gold_point_rankings(trainee_id);
      CREATE INDEX IF NOT EXISTS idx_gold_point_rankings_period ON gold_point_rankings(period);

      -- Create ranking_house table
      CREATE TABLE IF NOT EXISTS ranking_house (
        id SERIAL PRIMARY KEY,
        house VARCHAR(255) NOT NULL,
        total_gold_house INT DEFAULT 0,
        rank INT,
        class_name VARCHAR(255),
        cabang VARCHAR(255),
        program VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create gold_poin_setahun table
      CREATE TABLE IF NOT EXISTS gold_poin_setahun (
        id SERIAL PRIMARY KEY,
        period_start VARCHAR(100) DEFAULT '1 Jan 2026',
        period_end VARCHAR(100) DEFAULT '31 Dec 2026',
        trainee_id VARCHAR(100) NOT NULL,
        student_name VARCHAR(255),
        date_string VARCHAR(100) NOT NULL,
        total_gold INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_gold_poin_setahun_trainee_id ON gold_poin_setahun(trainee_id);
      CREATE INDEX IF NOT EXISTS idx_gold_poin_setahun_date_string ON gold_poin_setahun(date_string);

      -- Create report_trainee_data table
      CREATE TABLE IF NOT EXISTS report_trainee_data (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        latest_speaking_project VARCHAR(255),
        speaking_project_to_next_level VARCHAR(50),
        last_speaker_date VARCHAR(100),
        last_life_project_date VARCHAR(100),
        last_life_project TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_report_trainee_data_trainee_id ON report_trainee_data(trainee_id);
      CREATE INDEX IF NOT EXISTS idx_report_trainee_data_name ON report_trainee_data(name);
    `);

    console.log('✅ Database schema and performance indexes updated successfully.');

    // Auto-populate report_trainee if table is empty
    const checkCount = await db.query('SELECT COUNT(*) FROM report_trainee');
    if (parseInt(checkCount.rows[0].count, 10) === 0) {
      console.log('⚡ report_trainee table is empty. Auto-populating data...');
      try {
        const repopulateScript = path.join(__dirname, '..', 'scripts', 'repopulate_all_report_trainee.js');
        if (require('fs').existsSync(repopulateScript)) {
          require(repopulateScript);
        }
      } catch (popErr) {
        console.error('⚠️ Auto-population failed:', popErr.message);
      }
    }

    // Auto-populate gold_point_rankings if table is empty
    const checkGpCount = await db.query('SELECT COUNT(*) FROM gold_point_rankings');
    if (parseInt(checkGpCount.rows[0].count, 10) === 0) {
      console.log('⚡ gold_point_rankings table is empty. Auto-populating data...');
      try {
        let seedRows = [];
        const seedPath1 = path.join(__dirname, 'routes', 'seed_gold_point_rankings.json');
        const seedPath2 = path.join(__dirname, '..', 'scripts', 'seed_gold_point_rankings.json');
        
        if (fs.existsSync(seedPath1)) {
          seedRows = JSON.parse(fs.readFileSync(seedPath1, 'utf8'));
        } else if (fs.existsSync(seedPath2)) {
          seedRows = JSON.parse(fs.readFileSync(seedPath2, 'utf8'));
        }

        if (Array.isArray(seedRows) && seedRows.length > 0) {
          const valueRows = [];
          const queryParams = [];
          let paramIdx = 1;

          for (const r of seedRows) {
            valueRows.push(`(
              $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
              $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
              $${paramIdx++}, $${paramIdx++}, NOW(), NOW()
            )`);
            queryParams.push(
              r.period, r.category, r.program, r.trainee_id, r.trainee_name,
              r.membership_status, r.level, r.house, r.class_name, r.branch,
              r.total_gold, r.ranking
            );
          }

          if (valueRows.length > 0) {
            await db.query(`
              INSERT INTO gold_point_rankings (
                period, category, program, trainee_id, trainee_name,
                membership_status, level, house, class_name, branch,
                total_gold, ranking, created_at, updated_at
              )
              VALUES ${valueRows.join(',')}
              ON CONFLICT (period, category, program, trainee_id) DO NOTHING;
            `, queryParams);
            console.log(`✅ Auto-populated ${seedRows.length} seed rows into gold_point_rankings!`);
          }
        }
      } catch (popErr) {
        console.error('⚠️ Auto-population gold_point_rankings failed:', popErr.message);
      }
    }
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

app.use('/api/goldpoint-trainee', goldPointRankingRoutes);
app.use('/api/goldpoint_trainee', goldPointRankingRoutes);
app.use('/api/admin/goldpoint-trainee', goldPointRankingRoutes);
app.use('/api/admin/goldpoint_trainee', goldPointRankingRoutes);
app.use('/api/dashboard/goldpoint-trainee', goldPointRankingRoutes);
app.use('/api/dashboard/goldpoint_trainee', goldPointRankingRoutes);
app.use('/api/gold-point-rankings', goldPointRankingRoutes);
app.use('/api/gold_point_rankings', goldPointRankingRoutes);
app.use('/api/gold-point-ranking', goldPointRankingRoutes);
app.use('/api/gold_point_ranking', goldPointRankingRoutes);
app.use('/api/admin/gold-point-ranking', goldPointRankingRoutes);
app.use('/api/admin/gold-point-rankings', goldPointRankingRoutes);
app.use('/api/portal-trainee/gold-point-rankings', goldPointRankingRoutes);
app.use('/api/portal-admin/gold-point-rankings', goldPointRankingRoutes);
app.use('/gold-point-ranking', goldPointRankingRoutes);
app.use('/gold-point-rankings', goldPointRankingRoutes);
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

