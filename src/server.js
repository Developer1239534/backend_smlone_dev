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
const portalTraineeWebhookRoutes = require('./routes/portalTraineeWebhookRoutes');
const portalAuthRoutes = require('./routes/portalAuthRoutes');
const goldpointTraineeRoutes = require('./routes/goldpointTraineeRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const profileTraineeRoutes = require('./routes/profileTraineeRoutes');
const monthlyGoldPointRoutes = require('./routes/monthlyGoldPointRoutes');
const realStageRoutes = require('./routes/realStageRoutes');
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
    await db.query('DROP TABLE IF EXISTS registrasi_ca CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_cp CASCADE');
    await db.query('DROP TABLE IF EXISTS registrasi_tr CASCADE');



    // Create portal_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS portal_trainee (
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
      ALTER TABLE portal_trainee ADD COLUMN IF NOT EXISTS quarterly_report_url TEXT;
      ALTER TABLE portal_trainee ADD COLUMN IF NOT EXISTS real_stage_report_url TEXT;
      CREATE INDEX IF NOT EXISTS idx_portal_trainee_branch_id ON portal_trainee(branch_id);
    `);

    // Create login_trainee table
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_trainee (
        id BIGSERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL REFERENCES portal_trainee(trainee_id) ON DELETE CASCADE ON UPDATE CASCADE,
        password VARCHAR(255) NOT NULL,
        plain_password VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_login_trainee_student_id ON login_trainee(student_id);
    `);

    // Ensure credential_portal schema and drop Processing Status / Processing Data column
    await db.query(`
      CREATE TABLE IF NOT EXISTS credential_portal (
        "ID"                VARCHAR(255) PRIMARY KEY,
        "Name"              VARCHAR(255),
        "MEMBERSHIP STATUS" VARCHAR(255),
        "Password"          VARCHAR(255)
      );
      ALTER TABLE credential_portal DROP COLUMN IF EXISTS "Processing Status";
      ALTER TABLE credential_portal DROP COLUMN IF EXISTS "Processing Data";
      ALTER TABLE credential_portal DROP COLUMN IF EXISTS "processing_status";
      ALTER TABLE credential_portal DROP COLUMN IF EXISTS "processing_data";
    `).catch(() => null);

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
  origin: true, // Dynamically reflect request origin, allowing portal.smlone.com and any client
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma', 'x-api-key'],
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


app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/webhook') || req.path.startsWith('/dashboard-keseluruhan')) {
    return next(); // Bypass limiter for n8n webhooks and bulk syncs
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
app.use('/api/goldpoint-trainee', goldpointTraineeRoutes);
app.use('/api/goldpoint_trainee', goldpointTraineeRoutes);
app.use('/api/admin/goldpoint-trainee', goldpointTraineeRoutes);
app.use('/api/admin/goldpoint_trainee', goldpointTraineeRoutes);
app.use('/api/dashboard/goldpoint-trainee', goldpointTraineeRoutes);
app.use('/api/dashboard/goldpoint_trainee', goldpointTraineeRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/portal-trainee', portalTraineeRoutes);
app.use('/api/auth/trainee', portalAuthRoutes);
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

app.use('/api/webhook/credential', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, credentialRoutes);

app.use('/api/webhook/credential-portal', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, credentialRoutes);

app.use('/api/webhook/profile-trainee', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, profileTraineeRoutes);

app.use('/api/webhook/monthly-gold-point', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, monthlyGoldPointRoutes);

app.use('/api/webhook/real-stage', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== 'smlone-n8n-secret-key-2026') {
    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });
  }
  next();
}, realStageRoutes);

// Credential & Trainee Data Routes (Public GET for Frontend, Auth for Admin Mutations)
app.use('/api/credential', credentialRoutes);
app.use('/api/credential-portal', credentialRoutes);
app.use('/api/profile-trainee', profileTraineeRoutes);
app.use('/api/monthly-gold-point', monthlyGoldPointRoutes);
app.use('/api/real-stage', realStageRoutes);

// House Rank endpoint
app.use('/api/house-rank', adminHouseRankRoutes);

// id-gold-point endpoint
app.get('/api/id-gold-point', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM monthly_gold_point');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// award-2025 endpoint
app.get('/api/award-2025', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM award_2025 ORDER BY "No"::int ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    try {
      const result = await db.query('SELECT * FROM award_2025');
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (e) {
      res.json({ success: true, count: 0, data: [] });
    }
  }
});

// report-trainee SSE & GET endpoints
app.get('/api/report-trainee/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);
  const send = async () => {
    try {
      const result = await db.query('SELECT * FROM portal_trainee LIMIT 100');
      res.write(`data: ${JSON.stringify(result.rows)}\n\n`);
    } catch (e) {}
  };
  send();
  const interval = setInterval(send, 30000);
  req.on('close', () => clearInterval(interval));
});

app.get('/api/report-trainee', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM portal_trainee');
    res.json({ success: true, count: result.rows.length, total: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/report-trainee/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM portal_trainee WHERE trainee_id = $1 OR trainee_id ILIKE $1 LIMIT 1', [id]);
    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0], ...result.rows[0] });
    }
    const defaultData = {
      trainee_id: id,
      name: '',
      weekly_report_url: null,
      quarterly_report_url: null,
      real_stage_report_url: null,
      progress_video_url: null,
      screening_test_url: null
    };
    return res.json({ success: true, data: defaultData, ...defaultData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// report-progres GET endpoints
app.get('/api/report-progres', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM portal_trainee');
    res.json({ success: true, count: result.rows.length, total: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/report-progres/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM portal_trainee WHERE trainee_id = $1 OR trainee_id ILIKE $1 LIMIT 1', [id]);
    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0], ...result.rows[0] });
    }
    const defaultData = {
      trainee_id: id,
      name: '',
      weekly_report_url: null,
      quarterly_report_url: null,
      real_stage_report_url: null,
      progress_video_url: null,
      screening_test_url: null
    };
    return res.json({ success: true, data: defaultData, ...defaultData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// weekly-report SSE & GET endpoints
app.get('/api/weekly-report/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);
  const send = async () => {
    try {
      const result = await db.query('SELECT trainee_id, name, weekly_report_url FROM portal_trainee WHERE weekly_report_url IS NOT NULL LIMIT 100');
      res.write(`data: ${JSON.stringify(result.rows)}\n\n`);
    } catch (e) {}
  };
  send();
  const interval = setInterval(send, 30000);
  req.on('close', () => clearInterval(interval));
});

app.get('/api/weekly-report', async (req, res) => {
  try {
    const result = await db.query('SELECT trainee_id, name, weekly_report_url FROM portal_trainee');
    res.json({ success: true, count: result.rows.length, total: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/weekly-report/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM portal_trainee WHERE trainee_id = $1 OR trainee_id ILIKE $1 LIMIT 1', [id]);
    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0], ...result.rows[0] });
    }
    const defaultData = {
      trainee_id: id,
      name: '',
      weekly_report_url: null
    };
    return res.json({ success: true, data: defaultData, ...defaultData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});






app.use('/api/registrasi-ca', registrasiCaRoutes);
app.use('/api/registrasi-cp', registrasiCpRoutes);
app.use('/api/registrasi-tr', registrasiTrRoutes);
app.use('/api/registrasi-new', registrasiNewRoutes);
app.use('/api/registrasi-new/push', registrasiNewRoutes);
app.use('/api_gistrasi-new', registrasiNewRoutes);
app.use('/api_gistrasi-new/push', registrasiNewRoutes);
app.use('/api/dashboard-keseluruhan', verifyToken, dashboardKeseluruhanRoutes);
app.use('/api/chat', verifyToken, chatRoutes);
app.use('/api/admin/gp-month', verifyToken, adminGpMonthRoutes);
app.use('/api/admin/house-rank', verifyToken, adminHouseRankRoutes);
app.use('/api/admin/houses', verifyToken, adminHouseRoutes);
app.use('/api/admin/myby-coin', verifyToken, adminMybyCoinRoutes);
app.use('/api/admin/sml-feedback', verifyToken, smlFeedbackRoutes);
app.use('/admin/sml-feedback', verifyToken, smlFeedbackRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/admin', verifyToken, adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
