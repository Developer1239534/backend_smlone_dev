const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to ALL routes in this file
router.use(authMiddleware);

// Helper to ensure wallet exists for a trainee (creates one with 0 balances if not found)
async function getOrCreateWallet(traineeId) {
  const check = await db.query('SELECT * FROM myby_wallets WHERE trainee_id = $1', [traineeId]);
  if (check.rows.length > 0) {
    return check.rows[0];
  }

  // Create new wallet
  const result = await db.query(
    'INSERT INTO myby_wallets (trainee_id, myby_balance, gp_balance) VALUES ($1, $2, $3) RETURNING *',
    [traineeId, 0, 0]
  );
  return result.rows[0];
}

// 1. GET /profile — Get logged-in user profile (ID and Trainee Name)
router.get('/profile', async (req, res) => {
  const traineeId = req.trainee.id;
  try {
    const result = await db.query('SELECT id, trainee_name FROM dashboard_trainne WHERE id = $1', [traineeId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trainee profile not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[MYBY API] GET Profile Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. GET /wallet — Get MYBY Coin and Gold Points balances
router.get('/wallet', async (req, res) => {
  const traineeId = req.trainee.id;
  try {
    const wallet = await getOrCreateWallet(traineeId);
    res.json({ success: true, data: wallet });
  } catch (err) {
    console.error('[MYBY API] GET Wallet Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 3. GET /transactions — Get transaction history
router.get('/transactions', async (req, res) => {
  const traineeId = req.trainee.id;
  try {
    const result = await db.query(
      'SELECT id, transaction_type, amount, description, status, created_at FROM myby_transactions WHERE trainee_id = $1 ORDER BY created_at DESC',
      [traineeId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[MYBY API] GET Transactions Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 4. GET /conversions — Get conversion history
router.get('/conversions', async (req, res) => {
  const traineeId = req.trainee.id;
  try {
    const result = await db.query(
      'SELECT id, myby_amount, gp_received, conversion_rate, created_at FROM myby_conversions WHERE trainee_id = $1 ORDER BY created_at DESC',
      [traineeId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[MYBY API] GET Conversions Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 5. POST /convert — Convert MYBY Coin to Gold Points (Course: 50 MYBY = 1 GP)
router.post('/convert', async (req, res) => {
  const traineeId = req.trainee.id;
  const { myby_amount } = req.body;

  const amount = parseInt(myby_amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah MYBY Coin (myby_amount) harus berupa angka positif.' });
  }

  if (amount % 50 !== 0) {
    return res.status(400).json({ success: false, message: 'Konversi harus dalam kelipatan 50 MYBY Coin (misal: 50, 100, 150).' });
  }

  const gpReceived = amount / 50;

  try {
    const wallet = await getOrCreateWallet(traineeId);
    if (wallet.myby_balance < amount) {
      return res.status(400).json({ success: false, message: 'Saldo MYBY Coin Anda tidak mencukupi untuk melakukan konversi.' });
    }

    await db.query('BEGIN');

    // 1. Deduct MYBY and Add GP to Wallet
    const updatedWalletRes = await db.query(
      `UPDATE myby_wallets 
       SET myby_balance = myby_balance - $1, gp_balance = gp_balance + $2, updated_at = CURRENT_TIMESTAMP
       WHERE trainee_id = $3
       RETURNING *`,
      [amount, gpReceived, traineeId]
    );

    // 2. Sync GP to dashboard_trainne total_gold_periode column
    const traineeRes = await db.query('SELECT total_gold_periode FROM dashboard_trainne WHERE id = $1', [traineeId]);
    if (traineeRes.rows.length > 0) {
      const currentGp = parseInt(traineeRes.rows[0].total_gold_periode) || 0;
      const newGp = currentGp + gpReceived;
      await db.query('UPDATE dashboard_trainne SET total_gold_periode = $1 WHERE id = $2', [newGp.toString(), traineeId]);
    }

    // 3. Log into myby_conversions table
    await db.query(
      `INSERT INTO myby_conversions (trainee_id, myby_amount, gp_received, conversion_rate)
       VALUES ($1, $2, $3, $4)`,
      [traineeId, amount, gpReceived, 50.0]
    );

    // 4. Log into myby_transactions table
    await db.query(
      `INSERT INTO myby_transactions (trainee_id, transaction_type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [traineeId, 'convert', amount, `Converted ${amount} MYBY Coins into ${gpReceived} Gold Points (GP).`, 'completed']
    );

    await db.query('COMMIT');

    res.json({
      success: true,
      message: `Konversi berhasil! ${amount} MYBY telah ditukarkan menjadi ${gpReceived} GP.`,
      data: updatedWalletRes.rows[0]
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('[MYBY API] POST Convert Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 6. GET /rewards — Get list of redeemable rewards
router.get('/rewards', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, description, myby_cost, stock FROM rewards ORDER BY myby_cost ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[MYBY API] GET Rewards Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 7. POST /rewards/redeem — Redeem a reward using MYBY Coin
router.post('/rewards/redeem', async (req, res) => {
  const traineeId = req.trainee.id;
  const { reward_id } = req.body;

  if (!reward_id) {
    return res.status(400).json({ success: false, message: 'ID Reward (reward_id) wajib diisi.' });
  }

  try {
    // Check if reward exists and check stock
    const rewardRes = await db.query('SELECT * FROM rewards WHERE id = $1', [reward_id]);
    if (rewardRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reward tidak ditemukan.' });
    }

    const reward = rewardRes.rows[0];
    if (reward.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Stok reward ini sudah habis.' });
    }

    const wallet = await getOrCreateWallet(traineeId);
    if (wallet.myby_balance < reward.myby_cost) {
      return res.status(400).json({ success: false, message: 'Saldo MYBY Coin Anda tidak mencukupi untuk menukarkan reward ini.' });
    }

    await db.query('BEGIN');

    // 1. Deduct MYBY Coin from Wallet
    const updatedWalletRes = await db.query(
      `UPDATE myby_wallets
       SET myby_balance = myby_balance - $1, updated_at = CURRENT_TIMESTAMP
       WHERE trainee_id = $2
       RETURNING *`,
      [reward.myby_cost, traineeId]
    );

    // 2. Deduct stock from rewards
    await db.query(
      'UPDATE rewards SET stock = stock - 1 WHERE id = $1',
      [reward_id]
    );

    // 3. Create redemption record
    const redemptionRes = await db.query(
      `INSERT INTO reward_redemptions (trainee_id, reward_id, myby_spent, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [traineeId, reward_id, reward.myby_cost, 'completed']
    );

    // 4. Create transaction log
    await db.query(
      `INSERT INTO myby_transactions (trainee_id, transaction_type, amount, description, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [traineeId, 'redeem', reward.myby_cost, `Redeemed reward: ${reward.name}`, 'completed']
    );

    await db.query('COMMIT');

    res.json({
      success: true,
      message: `Reward '${reward.name}' berhasil ditukarkan!`,
      wallet: updatedWalletRes.rows[0],
      redemption: redemptionRes.rows[0]
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('[MYBY API] POST Redeem Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 8. GET /rewards/redemptions — Get trainee redemption history
router.get('/rewards/redemptions', async (req, res) => {
  const traineeId = req.trainee.id;
  try {
    const result = await db.query(
      `SELECT rr.id, rr.myby_spent, rr.status, rr.created_at, r.name as reward_name, r.description as reward_description
       FROM reward_redemptions rr
       INNER JOIN rewards r ON rr.reward_id = r.id
       WHERE rr.trainee_id = $1
       ORDER BY rr.created_at DESC`,
      [traineeId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[MYBY API] GET Redemptions Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
