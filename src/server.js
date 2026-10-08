require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Route Handlers from src/portal/
const credentialRoutes = require('./portal/credential_portal/credentialRoutes');
const profileTraineeRoutes = require('./portal/profile_trainee_portal/profileTraineeRoutes');
const monthlyGoldPointRoutes = require('./portal/id_gold_point/monthlyGoldPointRoutes');
const houseRankRoutes = require('./portal/house_rank_dan_class/houseRankRoutes');
const reportProgresRoutes = require('./portal/report_progres/reportProgresRoutes');
const houseAllegianceRoutes = require('./portal/house_allegiance/houseAllegianceRoutes');
const historyHousesRoutes = require('./portal/history_houses/historyHousesRoutes');
const award2025Routes = require('./portal/award_2025/award2025Routes');
const realStageRoutes = require('./portal/voucher_real_stage/realStageRoutes');
const referralCodeRoutes = require('./portal/referral_code/referralCodeRoutes');
const referralLinkRoutes = require('./portal/referral_link/referralLinkRoutes');
const mybyCoinRoutes = require('./portal/myby_coin/mybyCoinRoutes');
const authRoutes = require('./routes/authRoutes');
const giftRoutes = require('./routes/giftRoutes');
const studentRoutes = require('./routes/studentRoutes');
const credentialAdminRoutes = require('./portal/credential_admin/credentialAdminRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const db = require('./db/neonClient');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', true);

// Middlewares
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key'],
  credentials: true,
}));
app.options(/(.*)/, cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SMLONE Backend Server is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

// Endpoint Agregat Dashboard Summary (1x request, multi-table query via same pool)
app.get(['/api/dashboard-summary/:id', '/api/portal/dashboard-summary/:id'], async (req, res) => {
  const { id } = req.params;
  const cleanId = String(id || '').trim();
  try {
    const [profileRes, reportRes] = await Promise.all([
      db.query(
        `SELECT "Class", "Day", "Time", "Room", "Branch", "ID", "Name", "Level", "HOUSE", "House Role",
          "Trainee Homeroom", "Homeroom kelas", "Trainer", "MEMBERSHIP", "EXPIRY DATE", "FIRST ENROLL",
          "Date of Birth", "Class in School", "Parents Email Account", "Parent WhatsApp Number",
          "Trainee WhatsApp Number", "School Name"
        FROM profile_trainee WHERE "ID" = $1 LIMIT 1`,
        [cleanId]
      ),
      db.query(
        `SELECT "ID", "Student Name", "Class Trainers", "Date", "Coach Feedback", "Challenge",
          "Speaking Project", "Role 2", "Role 3", "Role 4", "Life Project", "House", "Level",
          "Latest Speaking Project", "Last Time Speaking", "Class", created_at, updated_at
        FROM report_progres WHERE "ID" = $1 ORDER BY created_at DESC LIMIT 1`,
        [cleanId]
      )
    ]);

    const profileData = profileRes.rows[0] || null;
    const reportData = reportRes.rows[0] || null;

    res.json({
      success: true,
      message: `Dashboard summary untuk ID ${cleanId}`,
      data: {
        profile: profileData,
        reportProgres: reportData,
        reportTrainee: reportData
      }
    });
  } catch (err) {
    console.error('[Dashboard Summary] Error:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil summary dashboard', error: err.message });
  }
});

// ============================================================
// 1. Credential Portal
// ============================================================
app.use('/api/credential-portal', credentialRoutes);
app.use('/api/credential', credentialRoutes);
app.use('/api/webhook/credential-portal', credentialRoutes);
app.use('/api/portal/credential', credentialRoutes);

// ============================================================
// 2. Profile Trainee Portal
// ============================================================
app.use('/api/profile-trainee', profileTraineeRoutes);
app.use('/api/webhook/profile-trainee', profileTraineeRoutes);
app.use('/api/portal/profile-trainee', profileTraineeRoutes);

// ============================================================
// 3. ID Gold Point & Monthly Gold Point
// ============================================================
app.use('/api/monthly-gold-point', monthlyGoldPointRoutes);
app.use('/api/id-gold-point', monthlyGoldPointRoutes);
app.use('/api/webhook/monthly-gold-point', monthlyGoldPointRoutes);
app.use('/api/portal/gold-point', monthlyGoldPointRoutes);

// ============================================================
// 4. House Rank Dan Class
// ============================================================
app.use('/api/house-rank', houseRankRoutes);
app.use('/api/portal/house-rank', houseRankRoutes);

// ============================================================
// 5. Report Progres
// ============================================================
app.use('/api/report-progres', reportProgresRoutes);
app.use('/api/report-trainee', reportProgresRoutes);
app.use('/api/weekly-report', reportProgresRoutes);
app.use('/api/portal/report-progres', reportProgresRoutes);

// ============================================================
// 6. House Allegiance
// ============================================================
app.use('/api/house-allegiance', houseAllegianceRoutes);
app.use('/api/houses', houseAllegianceRoutes);
app.use('/api/quiz', houseAllegianceRoutes);
app.use('/api/portal/house-allegiance', houseAllegianceRoutes);

// ============================================================
// 7. History Houses
// ============================================================
app.use('/api/history-house', historyHousesRoutes);
app.use('/api/house-selection-history', historyHousesRoutes);
app.use('/api/portal/history-houses', historyHousesRoutes);

// ============================================================
// 8. Award 2025
// ============================================================
app.use('/api/award-2025', award2025Routes);
app.use('/api/awards', award2025Routes);
app.use('/api/portal/award-2025', award2025Routes);

// ============================================================
// 9. Voucher Real Stage
// ============================================================
app.use('/api/voucher-real-stage', realStageRoutes);
app.use('/api/portal/voucher-real-stage', realStageRoutes);
app.use('/api/webhook/voucher-real-stage', realStageRoutes);
app.use('/api/real-stage', realStageRoutes);
app.use('/api/webhook/real-stage', realStageRoutes);
app.use('/api/portal/real-stage', realStageRoutes);

// ============================================================
// 10. Referral Code
// ============================================================
app.use('/api/referral-code', referralCodeRoutes);
app.use('/api/referral', referralCodeRoutes);
app.use('/api/portal/referral', referralCodeRoutes);
app.use('/api/portal/referral-code', referralCodeRoutes);
app.use('/api/webhook/referral-code', referralCodeRoutes);

// ============================================================
// 11. Referal Link
// ============================================================
app.use('/api/referral-link', referralLinkRoutes);
app.use('/api/referal-link', referralLinkRoutes);
app.use('/api/portal/referral-link', referralLinkRoutes);
app.use('/api/portal/referal-link', referralLinkRoutes);
// ============================================================
// 12. MyBY Coin, Daily Streak & Leaderboard
// ============================================================
app.use('/api/myby-coin', mybyCoinRoutes);
app.use('/api/portal/myby-coin', mybyCoinRoutes);
app.use('/api/daily-checkin', mybyCoinRoutes);

// ============================================================
// 13. Auth & Credential Dispatcher
// ============================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/gifts', giftRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/portal/gifts', giftRoutes);

// ============================================================
// 14. Students & Level 6 Reports
// ============================================================
app.use('/api/v1/students', studentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/portal/students', studentRoutes);

// ============================================================
// 15. Credential Admin
// ============================================================
app.use('/api/credential-admin', credentialAdminRoutes);
app.use('/api/portal/credential-admin', credentialAdminRoutes);
app.use('/api/admin/credential', credentialAdminRoutes);

// Telemetry & Activity Tracking
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/portal/telemetry', telemetryRoutes);

// On-demand Google Sheets sync trigger to n8n
app.post('/api/sync-sheets', async (req, res) => {
  try {
    fetch('https://n8n-jua7.srv1825659.hstgr.cloud/webhook/sync-google-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggered_by: req.ip || 'admin' })
    }).catch(err => console.error('[Sync-Sheets] Webhook trigger error:', err.message));

    res.json({ success: true, message: 'Google Sheets sync workflow telah dipicu di n8n' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📡 Endpoints Portal aktif:`);
  console.log(`   - 1. Credential Portal     : /api/credential-portal`);
  console.log(`   - 2. Profile Trainee       : /api/profile-trainee`);
  console.log(`   - 3. ID Gold Point         : /api/monthly-gold-point & /api/id-gold-point`);
  console.log(`   - 4. House Rank            : /api/house-rank`);
  console.log(`   - 5. Report Progres        : /api/report-progres`);
  console.log(`   - 6. House Allegiance      : /api/house-allegiance`);
  console.log(`   - 7. History Houses        : /api/history-house`);
  console.log(`   - 8. Award 2025            : /api/award-2025`);
  console.log(`   - 9. Voucher Real Stage    : /api/voucher-real-stage & /api/real-stage`);
  console.log(`   - 10. Referral Code        : /api/referral-code & /api/portal/referral-code`);
  console.log(`   - 11. Referal Link         : /api/referral-link & /api/referal-link`);
  console.log(`   - 12. MyBY Coin & Streak   : /api/myby-coin & /api/portal/myby-coin`);
});

module.exports = app;
