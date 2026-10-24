/**
 * ============================================================
 * ROUTE: MyBY Coin, Daily Streak, & Leaderboard
 * ============================================================
 * Arsitektur Terpisah & Modular:
 * - mybyCoinConstants.js: Nilai bonus, nama hari, katalog bawaan
 * - mybyCoinDatabase.js: DDL Neon PG (ID sebagai PK, Name sebagai Secondary Key)
 * - controllers/streakController.js: Overview & klaim koin harian
 * - controllers/leaderboardController.js: Ranking & filter House
 * - controllers/transactionController.js: Riwayat mutasi khusus streak
 * - controllers/rewardController.js: Katalog reward & penukaran
 * ============================================================
 */

const express = require('express');
const router = express.Router();

// Middleware Anti-Cache: Menjamin seluruh response data mutasi koin, streak, dan katalog selalu REAL-TIME
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

const {
  handleGetOverview,
  handleClaimStreak,
  handleDailyCheckin,
  handleGetStreakCalendar,
} = require('./controllers/streakController');

const { handleGetLeaderboard, handleGetLeaderboardReferral } = require('./controllers/leaderboardController');
const {
  handleGetReferralEventStatus,
  handleClaimReferralCoins
} = require('./controllers/referralEventController');
const { handleRegisterCalonSiswa, handleListCalonSiswa } = require('./controllers/calonSiswaController');
const { handleGetTransactions } = require('./controllers/transactionController');
const { handleGetRewards, handleRedeemReward, handleGetTraineeRedeems } = require('./controllers/rewardController');

const {
  handleAdminListStreaks,
  handleAdminGetStreak,
  handleAdminUpsertStreak,
  handleAdminUpdateStreak,
  handleAdminDeleteStreak
} = require('./controllers/streakAdminController');

const {
  handleAdminListWallets,
  handleAdminGetWallet,
  handleAdminUpsertWallet,
  handleAdminDeleteWallet,
  handleAdminListTransactions,
  handleAdminCreateTransaction,
  handleAdminDeleteTransaction,
  handleAdminListRewards,
  handleAdminGetReward,
  handleAdminUpsertReward,
  handleAdminUpdateReward,
  handleAdminDeleteReward,
  handleAdminListRedeems,
  handleAdminGetRedeem,
  handleAdminUpdateRedeem,
  handleAdminDeleteRedeem
,
  handleScanRedeem
} = require('./controllers/coinAdminController');

// 1. Overview Saldo & Status Streak
router.get('/overview{/:traineeId}', handleGetOverview);

// 2. Klaim Koin Daily Streak (Atomic DB Transaction)
router.post('/streak/claim', handleClaimStreak);
router.post('/daily-checkin', handleDailyCheckin);
router.get('/streak/calendar{/:traineeId}', handleGetStreakCalendar);
router.get('/streak/calendar', handleGetStreakCalendar);

// 3. Leaderboard Realtime & Referral
router.get('/leaderboard', handleGetLeaderboard);
router.get('/leaderboard-referral', handleGetLeaderboardReferral);

// 3.0 Event Referral (Batas 31 Okt 2026 & Klaim Reward)
router.get('/referral-event/status', handleGetReferralEventStatus);
router.post('/referral-event/claim', handleClaimReferralCoins);

// 3.1 Calon Siswa Pendaftar SMLONE
router.get('/calon-siswa', handleListCalonSiswa);
router.post('/calon-siswa', handleRegisterCalonSiswa);

// 4. Riwayat Koin (Khusus Rentetan Login / Streak)
router.get('/transactions{/:traineeId}', handleGetTransactions);

// 5. Katalog Reward & Penukaran Hadiah
router.get('/rewards', handleGetRewards);
router.post('/redeem', handleRedeemReward);
router.post('/redeems/scan', handleScanRedeem);
router.get('/redeems/:traineeId', handleGetTraineeRedeems);
router.get('/redeems', handleGetTraineeRedeems);

// ============================================================
// 6. ADMIN CRUD — STREAK TRAINEE
// ============================================================
router.get('/admin/streaks', handleAdminListStreaks);
router.get('/admin/streaks/:id', handleAdminGetStreak);
router.post('/admin/streaks', handleAdminUpsertStreak);
router.put('/admin/streaks/:id', handleAdminUpdateStreak);
router.delete('/admin/streaks/:id', handleAdminDeleteStreak);

// ============================================================
// 7. ADMIN CRUD — WALLETS (MYBY COIN)
// ============================================================
router.get('/admin/wallets', handleAdminListWallets);
router.get('/admin/wallets/:id', handleAdminGetWallet);
router.post('/admin/wallets', handleAdminUpsertWallet);
router.delete('/admin/wallets/:id', handleAdminDeleteWallet);

// ============================================================
// 8. ADMIN CRUD — TRANSACTIONS (MANUAL AUDIT)
// ============================================================
router.get('/admin/transactions', handleAdminListTransactions);
router.post('/admin/transactions', handleAdminCreateTransaction);
router.delete('/admin/transactions/:id', handleAdminDeleteTransaction);

// ============================================================
// 9. ADMIN CRUD — REWARDS CATALOG
// ============================================================
router.get('/admin/rewards', handleAdminListRewards);
router.get('/admin/rewards/:id', handleAdminGetReward);
router.post('/admin/rewards', handleAdminUpsertReward);
router.put('/admin/rewards/:id', handleAdminUpdateReward);
router.delete('/admin/rewards/:id', handleAdminDeleteReward);

// ============================================================
// 10. ADMIN CRUD — REDEEM REQUESTS
// ============================================================
router.get('/admin/redeems', handleAdminListRedeems);
router.get('/admin/redeems/:id', handleAdminGetRedeem);
router.put('/admin/redeems/:id', handleAdminUpdateRedeem);
router.delete('/admin/redeems/:id', handleAdminDeleteRedeem);

module.exports = router;
