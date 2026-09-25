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

const {
  handleGetOverview,
  handleClaimStreak,
  handleDailyCheckin
} = require('./controllers/streakController');

const { handleGetLeaderboard } = require('./controllers/leaderboardController');
const { handleGetTransactions } = require('./controllers/transactionController');
const { handleGetRewards, handleRedeemReward } = require('./controllers/rewardController');

// 1. Overview Saldo & Status Streak
router.get('/overview/:traineeId?', handleGetOverview);

// 2. Klaim Koin Daily Streak (Atomic DB Transaction)
router.post('/streak/claim', handleClaimStreak);
router.post('/daily-checkin', handleDailyCheckin);

// 3. Leaderboard Realtime
router.get('/leaderboard', handleGetLeaderboard);

// 4. Riwayat Koin (Khusus Rentetan Login / Streak)
router.get('/transactions/:traineeId?', handleGetTransactions);

// 5. Katalog Reward & Penukaran Hadiah
router.get('/rewards', handleGetRewards);
router.post('/redeem', handleRedeemReward);

module.exports = router;
