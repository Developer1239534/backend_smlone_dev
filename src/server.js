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

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key'],
  credentials: true,
}));

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
app.use('/api/portal/referral-code', referralCodeRoutes);
app.use('/api/webhook/referral-code', referralCodeRoutes);

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

app.listen(PORT, () => {
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
});

module.exports = app;
