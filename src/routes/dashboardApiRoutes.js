const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to fetch trainee and handle errors
async function getTraineeOrError(id, res) {
  try {
    const result = await db.query(
      `SELECT * FROM dashboard_trainne WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
      return null;
    }
    return result.rows[0];
  } catch (err) {
    console.error(`[Dashboard API Error] ID: ${id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return null;
  }
}

// 1. GET /dashboard/profile/:id
router.get('/profile/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      program: trainee.program,
      class: trainee.class,
      level: trainee.level,
      membership_expiry: trainee.membership_expiry,
      profile_picture: trainee.profile_picture,
      phone: trainee.phone,
      tanggal_lahir: trainee.tanggal_lahir,
      cabang: trainee.cabang,
      house_sml: trainee.house_sml,
      total_gold_periode: trainee.total_gold_periode,
      junior_youth: trainee.junior_youth,
      rank_id_junior: trainee.rank_id_junior,
      rank_id_youth: trainee.rank_id_youth,
      rank_id_junior_timor: trainee.rank_id_junior_timor,
      rank_id_youth_timor: trainee.rank_id_youth_timor,
      rank_id_junior_tritura: trainee.rank_id_junior_tritura,
      rank_id_youth_tritura: trainee.rank_id_youth_tritura,
      rank_id_junior_cemara: trainee.rank_id_junior_cemara,
      rank_id_youth_cemara: trainee.rank_id_youth_cemara
    }
  });
});

// 1.5 PATCH /dashboard/profile/:id - User updates their own profile
router.patch('/profile/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Explicitly prevent updating ID and Trainee Name (Read-Only)
  delete updates.id;
  delete updates.trainee_name;

  // Handle frontend camelCase aliases
  if (updates.tanggalLahir !== undefined) updates.tanggal_lahir = updates.tanggalLahir;
  if (updates.profilePicture !== undefined) updates.profile_picture = updates.profilePicture;
  if (updates.oldPassword !== undefined) updates.old_password = updates.oldPassword;

  // List of fields that a USER is allowed to update
  const allowedFields = ['profile_picture', 'phone', 'tanggal_lahir', 'password', 'old_password'];
  
  const updateData = {};
  for (const field of allowedFields) {
    // Only update if the field is actually provided and not an empty string
    if (updates[field] !== undefined && updates[field] !== '') {
      updateData[field] = updates[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, message: 'Tidak ada data valid yang diubah.' });
  }

  try {
    const check = await db.query('SELECT password FROM dashboard_trainne WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trainee tidak ditemukan.' });
    }

    const currentTrainee = check.rows[0];

    // Password Update Logic with Old Password Verification
    if (updateData.password) {
      if (!updateData.old_password) {
        return res.status(400).json({ success: false, message: 'Password lama (old_password) wajib diisi untuk mengubah password.' });
      }

      const bcrypt = require('bcryptjs');
      
      let isMatch = false;
      if (currentTrainee.password) {
        isMatch = await bcrypt.compare(updateData.old_password, currentTrainee.password);
      }
      
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Password lama yang Anda masukkan salah.' });
      }

      updateData.plain_password = updateData.password; // save plain version for admin visibility
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remove old_password from updateData so it doesn't try to save it to DB
    delete updateData.old_password;

    // If only old_password was sent but no new password, we have nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data valid yang diubah.' });
    }

    const keys = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
    const query = `UPDATE dashboard_trainne SET ${setClause} WHERE id = $${keys.length + 1} RETURNING id, trainee_name, profile_picture, phone, tanggal_lahir`;
    
    const result = await db.query(query, [...values, id]);
    res.json({ success: true, message: 'Profil berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Dashboard API] PATCH Profile Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 2. GET /dashboard/progress/:id
router.get('/progress/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      progress_ke_next_level: trainee.progress_ke_next_level,
      progress_video: trainee.progress_video
    }
  });
});

// 3. GET /dashboard/highlights/:id
router.get('/highlights/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      highlight_terbaru: trainee.highlight_terbaru,
      pengumuman: trainee.pengumuman
    }
  });
});

// 4. GET /dashboard/reports/:id
router.get('/reports/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      weekly_report: trainee.weekly_report,
      quarterly_report: trainee.quarterly_report
    }
  });
});

// 5. GET /dashboard/rankings/:id
router.get('/rankings/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      gold_rank: trainee.gold_rank,
      referral_code: trainee.referral_code,
      total_gold_periode: trainee.total_gold_periode,
      junior_youth: trainee.junior_youth,
      rank_id_junior: trainee.rank_id_junior,
      rank_id_youth: trainee.rank_id_youth,
      rank_id_junior_timor: trainee.rank_id_junior_timor,
      rank_id_youth_timor: trainee.rank_id_youth_timor,
      rank_id_junior_tritura: trainee.rank_id_junior_tritura,
      rank_id_youth_tritura: trainee.rank_id_youth_tritura,
      rank_id_junior_cemara: trainee.rank_id_junior_cemara,
      rank_id_youth_cemara: trainee.rank_id_youth_cemara
    }
  });
});

// 6. GET /dashboard/speaking-projects/:id
router.get('/speaking-projects/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      last_speaking_project: trainee.last_speaking_project,
      completed_speaking_project: trainee.completed_speaking_project
    }
  });
});

// 7. GET /dashboard/reports/previous/:id
router.get('/reports/previous/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      laporan_sebelumnya: trainee.laporan_sebelumnya,
      laporan_quarter_sebelumnya: trainee.laporan_quarter_sebelumnya
    }
  });
});

// 8. GET /contact/:id (Can be accessed via /contact/:id or /dashboard/contact/:id)
router.get('/contact/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name
    }
  });
});

// ============================================================
// AWARDS ENDPOINTS (User-facing)
// ============================================================

// 9. GET /dashboard/awards/all — Public leaderboard: all awards with filters
router.get('/awards/all', async (req, res) => {
  const { award_type, award_name, category, medal, period } = req.query;
  try {
    let where = [];
    let params = [];
    let idx = 1;

    if (award_type) { where.push(`award_type = $${idx++}`); params.push(award_type); }
    if (award_name) { where.push(`award_name ILIKE $${idx++}`); params.push(`%${award_name}%`); }
    if (category) { where.push(`category = $${idx++}`); params.push(category); }
    if (medal) { where.push(`medal = $${idx++}`); params.push(medal); }
    if (period) { where.push(`period = $${idx++}`); params.push(period); }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT id, award_type, award_name, category, medal, trainee_id, trainee_name, score, threshold, period
       FROM awards ${whereClause}
       ORDER BY award_name, category, 
         CASE medal WHEN 'gold' THEN 1 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 3 END,
         score DESC`,
      params
    );

    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[Dashboard API] GET Awards All Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 10. GET /dashboard/awards/grouped — Grouped awards by name, category, and medal for UI layout
router.get('/awards/grouped', async (req, res) => {
  const period = req.query.period || 'jun-2026';
  try {
    const result = await db.query(
      `SELECT id, award_type, award_name, category, medal, trainee_id, trainee_name, score, threshold, period
       FROM awards
       WHERE period = $1
       ORDER BY award_name, category, 
         CASE medal WHEN 'gold' THEN 1 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 3 END,
         score DESC`,
      [period]
    );

    const grouped = {};

    for (const row of result.rows) {
      const { award_name, award_type, category, medal, trainee_id, trainee_name, score, threshold } = row;

      if (!grouped[award_name]) {
        grouped[award_name] = {
          award_name,
          award_type,
          categories: {}
        };
      }

      if (!grouped[award_name].categories[category]) {
        grouped[award_name].categories[category] = {
          bronze: { threshold: 0, count: 0, winners: [] },
          silver: { threshold: 0, count: 0, winners: [] },
          gold: { threshold: 0, count: 0, winners: [] }
        };
      }

      const categoryGroup = grouped[award_name].categories[category];
      if (categoryGroup[medal]) {
        if (threshold) {
          categoryGroup[medal].threshold = threshold;
        }
        categoryGroup[medal].winners.push({
          trainee_id,
          trainee_name,
          score
        });
        categoryGroup[medal].count += 1;
      }
    }

    const dataArray = Object.values(grouped);

    res.json({
      success: true,
      period,
      count: dataArray.length,
      data: dataArray
    });
  } catch (err) {
    console.error('[Dashboard API] GET Grouped Awards Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 11. GET /dashboard/awards/:trainee_id — Get all awards for a specific trainee
router.get('/awards/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  const { period } = req.query;
  try {
    let query = `SELECT id, award_type, award_name, category, medal, trainee_id, trainee_name, score, threshold, period
                 FROM awards WHERE trainee_id = $1`;
    let params = [trainee_id];

    if (period) {
      query += ` AND period = $2`;
      params.push(period);
    }

    query += ` ORDER BY award_type, award_name, 
      CASE medal WHEN 'gold' THEN 1 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 3 END`;

    const result = await db.query(query, params);

    // Also get trainee info
    const traineeResult = await db.query(
      'SELECT id, trainee_name, junior_youth, class, level, cabang FROM dashboard_trainne WHERE id = $1',
      [trainee_id]
    );

    const traineeInfo = traineeResult.rows.length > 0 ? traineeResult.rows[0] : null;

    res.json({
      success: true,
      trainee: traineeInfo,
      count: result.rows.length,
      awards: result.rows
    });
  } catch (err) {
    console.error(`[Dashboard API] GET Awards Error (Trainee: ${trainee_id}):`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 13. POST /dashboard/myby-coin/convert — Convert MYBY to GP (50 MYBY = 1 GP)
router.post('/myby-coin/convert', async (req, res) => {
  const { trainee_id, amount } = req.body;

  if (!trainee_id || amount === undefined) {
    return res.status(400).json({ success: false, message: 'ID trainee dan jumlah koin (amount) diperlukan.' });
  }

  const convertAmount = parseInt(amount, 10);
  if (isNaN(convertAmount) || convertAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah koin yang dikonversi harus berupa angka positif.' });
  }

  if (convertAmount % 50 !== 0) {
    return res.status(400).json({ success: false, message: 'Jumlah koin yang dikonversi harus kelipatan 50.' });
  }

  const gpEarned = convertAmount / 50;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check current balance
    const walletRes = await client.query('SELECT myby_balance, gp_balance FROM myby_coin WHERE id = $1', [trainee_id]);
    if (walletRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Dompet trainee tidak ditemukan.' });
    }

    const currentMyby = walletRes.rows[0].myby_balance;
    if (currentMyby < convertAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Saldo MYBY Coin tidak mencukupi.' });
    }

    // 2. Update balances
    await client.query(
      'UPDATE myby_coin SET myby_balance = myby_balance - $1, gp_balance = gp_balance + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [convertAmount, gpEarned, trainee_id]
    );

    // 3. Insert ledger entries
    // - Redeemed MYBY
    await client.query(
      `INSERT INTO myby_coin_ledger (trainee_id, transaction_type, action, amount, currency, description)
       VALUES ($1, 'redeemed', 'conversion', $2, 'MYBY', 'Konversi koin ke GP')`,
      [trainee_id, convertAmount]
    );
    // - Earned GP
    await client.query(
      `INSERT INTO myby_coin_ledger (trainee_id, transaction_type, action, amount, currency, description)
       VALUES ($1, 'earned', 'conversion', $2, 'GP', 'Penerimaan GP dari konversi koin')`,
      [trainee_id, gpEarned]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      message: `Berhasil mengonversi ${convertAmount} MYBY menjadi ${gpEarned} GP.`,
      converted_myby: convertAmount,
      received_gp: gpEarned
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Dashboard API] POST MYBY Coin Convert Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 14. POST /dashboard/myby-coin/vault-action — Deposit or Withdrawal
router.post('/myby-coin/vault-action', async (req, res) => {
  const { trainee_id, action_type, currency, amount } = req.body;

  if (!trainee_id || !action_type || !currency || amount === undefined) {
    return res.status(400).json({ success: false, message: 'Parameter trainee_id, action_type, currency, dan amount diperlukan.' });
  }

  const valAmount = parseInt(amount, 10);
  if (isNaN(valAmount) || valAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah transaksi harus berupa angka positif.' });
  }

  if (action_type !== 'deposit' && action_type !== 'withdrawal') {
    return res.status(400).json({ success: false, message: 'Tipe aksi harus deposit atau withdrawal.' });
  }

  if (currency !== 'MYBY' && currency !== 'GP') {
    return res.status(400).json({ success: false, message: 'Mata uang harus MYBY atau GP.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify wallet exists
    const walletRes = await client.query('SELECT myby_balance, gp_balance FROM myby_coin WHERE id = $1', [trainee_id]);
    if (walletRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Dompet trainee tidak ditemukan.' });
    }

    const wallet = walletRes.rows[0];

    if (action_type === 'withdrawal') {
      const currentBalance = currency === 'MYBY' ? wallet.myby_balance : wallet.gp_balance;
      if (currentBalance < valAmount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `Saldo ${currency} tidak mencukupi untuk melakukan penarikan.` });
      }

      // Update balance (deduct)
      if (currency === 'MYBY') {
        await client.query('UPDATE myby_coin SET myby_balance = myby_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [valAmount, trainee_id]);
      } else {
        await client.query('UPDATE myby_coin SET gp_balance = gp_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [valAmount, trainee_id]);
      }

      // Insert ledger
      await client.query(
        `INSERT INTO myby_coin_ledger (trainee_id, transaction_type, action, amount, currency, description)
         VALUES ($1, 'redeemed', 'withdrawal', $2, $3, 'Vault Withdrawal')`,
        [trainee_id, valAmount, currency]
      );
    } else {
      // Action: deposit (add)
      if (currency === 'MYBY') {
        await client.query('UPDATE myby_coin SET myby_balance = myby_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [valAmount, trainee_id]);
      } else {
        await client.query('UPDATE myby_coin SET gp_balance = gp_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [valAmount, trainee_id]);
      }

      // Insert ledger
      await client.query(
        `INSERT INTO myby_coin_ledger (trainee_id, transaction_type, action, amount, currency, description)
         VALUES ($1, 'earned', 'deposit', $2, $3, 'Vault Deposit')`,
        [trainee_id, valAmount, currency]
      );
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      message: `Berhasil melakukan ${action_type} sebesar ${valAmount} ${currency}.`
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Dashboard API] POST Vault Action Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 15. GET /dashboard/myby-coin/rewards — Get Rewards Shop list
router.get('/myby-coin/rewards', async (req, res) => {
  try {
    const result = await db.query('SELECT id, reward_name, description, cost, currency, stock FROM rewards_shop ORDER BY id ASC');
    res.json({
      success: true,
      rewards: result.rows
    });
  } catch (err) {
    console.error('[Dashboard API] GET Rewards Shop Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 16. POST /dashboard/myby-coin/rewards/claim — Claim reward
router.post('/myby-coin/rewards/claim', async (req, res) => {
  const { trainee_id, reward_id } = req.body;

  if (!trainee_id || !reward_id) {
    return res.status(400).json({ success: false, message: 'Parameter trainee_id dan reward_id diperlukan.' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify reward exists and has stock
    const rewardRes = await client.query('SELECT id, reward_name, cost, currency, stock FROM rewards_shop WHERE id = $1', [reward_id]);
    if (rewardRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Item hadiah tidak ditemukan.' });
    }

    const reward = rewardRes.rows[0];
    if (reward.stock <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Stok item hadiah ini sudah habis.' });
    }

    // 2. Verify wallet exists and has sufficient balance
    const walletRes = await client.query('SELECT myby_balance, gp_balance FROM myby_coin WHERE id = $1', [trainee_id]);
    if (walletRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Dompet trainee tidak ditemukan.' });
    }

    const wallet = walletRes.rows[0];
    const userBalance = reward.currency === 'MYBY' ? wallet.myby_balance : wallet.gp_balance;

    if (userBalance < reward.cost) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Saldo ${reward.currency} tidak mencukupi untuk mengklaim hadiah ini.` });
    }

    // 3. Deduct balance
    if (reward.currency === 'MYBY') {
      await client.query('UPDATE myby_coin SET myby_balance = myby_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [reward.cost, trainee_id]);
    } else {
      await client.query('UPDATE myby_coin SET gp_balance = gp_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [reward.cost, trainee_id]);
    }

    // 4. Deduct reward stock
    await client.query('UPDATE rewards_shop SET stock = stock - 1 WHERE id = $1', [reward_id]);

    // 5. Insert ledger
    await client.query(
      `INSERT INTO myby_coin_ledger (trainee_id, transaction_type, action, amount, currency, description)
       VALUES ($1, 'redeemed', 'reward_claim', $2, $3, $4)`,
      [trainee_id, reward.cost, reward.currency, `Klaim hadiah: ${reward.reward_name}`]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      message: `Berhasil mengklaim hadiah "${reward.reward_name}".`,
      claimed_item: reward.reward_name,
      cost: reward.cost,
      currency: reward.currency
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Dashboard API] POST Claim Reward Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 17. GET /dashboard/myby-coin/ledger/:trainee_id — View Transaction Ledger
router.get('/myby-coin/ledger/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  const { type } = req.query; // 'all', 'earned', 'redeemed'

  try {
    let query = 'SELECT id, transaction_type, action, amount, currency, description, created_at FROM myby_coin_ledger WHERE trainee_id = $1';
    const params = [trainee_id];

    if (type === 'earned' || type === 'redeemed') {
      query += ' AND transaction_type = $2';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      ledger: result.rows
    });
  } catch (err) {
    console.error('[Dashboard API] GET Ledger Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 18. POST /dashboard/myby-coin/transfer — Transfer Gold Point to Trainer
router.post('/myby-coin/transfer', async (req, res) => {
  const { created_by, trainer_id, trainer_name, amount_gold_point } = req.body;

  if (!created_by || !trainer_id || !trainer_name || amount_gold_point === undefined) {
    return res.status(400).json({ success: false, message: 'Parameter created_by, trainer_id, trainer_name, dan amount_gold_point diperlukan.' });
  }

  const gpAmount = parseInt(amount_gold_point, 10);
  if (isNaN(gpAmount) || gpAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah Gold Point harus berupa angka positif.' });
  }

  const transferId = require('crypto').randomUUID();
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify sender wallet exists and check balance
    const walletRes = await client.query('SELECT gp_balance FROM myby_coin WHERE id = $1', [created_by]);
    if (walletRes.rows.length === 0) {
      // Insert failed transaction into ledger & transfer log
      await client.query(
        `INSERT INTO myby_coin_transfer (transfer_id, trainer_id, trainer_name, amount_gold_point, status, created_by)
         VALUES ($1, $2, $3, $4, 'Failed', $5)`,
        [transferId, trainer_id, trainer_name, gpAmount, created_by]
      );
      await client.query('COMMIT');
      return res.status(404).json({ success: false, message: 'Dompet pengirim tidak ditemukan.' });
    }

    const currentGp = walletRes.rows[0].gp_balance;
    if (currentGp < gpAmount) {
      // Insert failed transaction
      await client.query(
        `INSERT INTO myby_coin_transfer (transfer_id, trainer_id, trainer_name, amount_gold_point, status, created_by)
         VALUES ($1, $2, $3, $4, 'Failed', $5)`,
        [transferId, trainer_id, trainer_name, gpAmount, created_by]
      );
      await client.query('COMMIT');
      return res.status(400).json({ success: false, message: 'Saldo Gold Point (GP) tidak mencukupi untuk transfer.' });
    }

    // 2. Deduct sender balance
    await client.query(
      'UPDATE myby_coin SET gp_balance = gp_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [gpAmount, created_by]
    );

    // 3. Save transfer transaction as Success
    await client.query(
      `INSERT INTO myby_coin_transfer (transfer_id, trainer_id, trainer_name, amount_gold_point, status, created_by)
       VALUES ($1, $2, $3, $4, 'Success', $5)`,
      [transferId, trainer_id, trainer_name, gpAmount, created_by]
    );

    // 4. Record to ledger
    await client.query(
      `INSERT INTO myby_coin_ledger (trainee_id, transaction_type, action, amount, currency, description)
       VALUES ($1, 'redeemed', 'transfer', $2, 'GP', $3)`,
      [created_by, gpAmount, `Transfer GP ke trainer ${trainer_name}`]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      message: `Berhasil mentransfer ${gpAmount} GP ke trainer ${trainer_name}.`,
      transfer_id: transferId,
      status: 'Success'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Dashboard API] POST Transfer GP Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 19. POST /dashboard/myby-coin/deposit — Deposit Gold Point from Trainer to Trainee
router.post('/myby-coin/deposit', async (req, res) => {
  const { trainee_id, trainer_id, trainer_name, amount_gold_point, deposit_method } = req.body;

  if (!trainee_id || !trainer_id || !trainer_name || amount_gold_point === undefined || !deposit_method) {
    return res.status(400).json({ success: false, message: 'Parameter trainee_id, trainer_id, trainer_name, amount_gold_point, dan deposit_method diperlukan.' });
  }

  const gpAmount = parseInt(amount_gold_point, 10);
  if (isNaN(gpAmount) || gpAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah Gold Point harus berupa angka positif lebih dari 0.' });
  }

  // Validasi: Pastikan Trainer ID valid (sesuai format, atau pastikan parameter diisi)
  if (typeof trainer_id !== 'string' || trainer_id.trim() === '') {
    return res.status(400).json({ success: false, message: 'Trainer ID tidak valid.' });
  }

  // Validasi: Pastikan metode deposit didukung
  const allowedMethods = ['Transfer Bank', 'Cash', 'Credit Card', 'E-Wallet'];
  if (!allowedMethods.includes(deposit_method)) {
    return res.status(400).json({ success: false, message: `Metode deposit tidak tersedia. Metode yang didukung: ${allowedMethods.join(', ')}` });
  }

  const depositId = require('crypto').randomUUID();
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify trainee wallet exists (create if not exist)
    const walletRes = await client.query('SELECT id, trainee_name, total_gold_periode FROM dashboard_trainne WHERE id = $1', [trainee_id]);
    if (walletRes.rows.length === 0) {
      // Record failed transaction to DB
      await client.query(
        `INSERT INTO myby_coin_deposit (deposit_id, trainer_id, trainer_name, trainee_id, amount_gold_point, deposit_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Failed')`,
        [depositId, trainer_id, trainer_name, trainee_id, gpAmount, deposit_method]
      );
      await client.query('COMMIT');
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${trainee_id} tidak ditemukan.` });
    }

    const traineeInfo = walletRes.rows[0];

    // Ensure wallet row exists in myby_coin
    const coinWallet = await client.query('SELECT id FROM myby_coin WHERE id = $1', [trainee_id]);
    if (coinWallet.rows.length === 0) {
      const initialGp = traineeInfo.total_gold_periode ? parseInt(traineeInfo.total_gold_periode, 10) || 0 : 0;
      await client.query(
        'INSERT INTO myby_coin (id, trainee_name, myby_balance, gp_balance) VALUES ($1, $2, 0, $3)',
        [trainee_id, traineeInfo.trainee_name, initialGp]
      );
    }

    // 2. Add GP balance to trainee
    await client.query(
      'UPDATE myby_coin SET gp_balance = gp_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [gpAmount, trainee_id]
    );

    // 3. Save success transaction
    await client.query(
      `INSERT INTO myby_coin_deposit (deposit_id, trainer_id, trainer_name, trainee_id, amount_gold_point, deposit_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Success')`,
      [depositId, trainer_id, trainer_name, trainee_id, gpAmount, deposit_method]
    );

    // 4. Record to ledger
    await client.query(
      `INSERT INTO myby_coin_ledger (trainee_id, transaction_type, action, amount, currency, description)
       VALUES ($1, 'earned', 'deposit', $2, 'GP', $3)`,
      [trainee_id, gpAmount, `Deposit GP dari trainer ${trainer_name} via ${deposit_method}`]
    );

    await client.query('COMMIT');

    // 5. Send notification simulation
    console.log(`[Notification] Halo ${traineeInfo.trainee_name}, deposit Gold Point sebesar ${gpAmount} GP dari trainer ${trainer_name} telah berhasil diterima.`);

    res.json({
      success: true,
      message: `Deposit sebesar ${gpAmount} GP berhasil ditambahkan ke trainee ${traineeInfo.trainee_name}.`,
      deposit_id: depositId,
      status: 'Success',
      notification_sent: true
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Dashboard API] POST Deposit GP Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 20. GET /dashboard/myby-coin/deposit/history — Get deposit history
router.get('/myby-coin/deposit/history', async (req, res) => {
  const { trainee_id } = req.query;

  try {
    let query = 'SELECT deposit_id, trainer_id, trainer_name, trainee_id, amount_gold_point, deposit_method, status, deposit_date FROM myby_coin_deposit';
    const params = [];

    if (trainee_id) {
      query += ' WHERE trainee_id = $1';
      params.push(trainee_id);
    }

    query += ' ORDER BY deposit_date DESC';

    const result = await db.query(query, params);
    res.json({
      success: true,
      deposits: result.rows
    });
  } catch (err) {
    console.error('[Dashboard API] GET Deposit History Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 21. GET /dashboard/myby-coin/deposit/detail/:deposit_id — Get deposit detail
router.get('/myby-coin/deposit/detail/:deposit_id', async (req, res) => {
  const { deposit_id } = req.params;

  try {
    const result = await db.query(
      `SELECT deposit_id, trainer_id, trainer_name, trainee_id, amount_gold_point, deposit_method, status, deposit_date 
       FROM myby_coin_deposit WHERE deposit_id = $1`,
      [deposit_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaksi deposit tidak ditemukan.' });
    }

    res.json({
      success: true,
      deposit: result.rows[0]
    });
  } catch (err) {
    console.error('[Dashboard API] GET Deposit Detail Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 22. GET /dashboard/myby-coin/wallet/balance/:trainee_id — Get Wallet Balance
router.get('/myby-coin/wallet/balance/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;

  try {
    // Verify trainee
    const traineeRes = await db.query('SELECT id, trainee_name FROM dashboard_trainne WHERE id = $1', [trainee_id]);
    if (traineeRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${trainee_id} tidak ditemukan.` });
    }

    const coinRes = await db.query('SELECT myby_balance, gp_balance FROM myby_coin WHERE id = $1', [trainee_id]);
    const myby_balance = coinRes.rows.length > 0 ? coinRes.rows[0].myby_balance : 0;
    const gp_balance = coinRes.rows.length > 0 ? coinRes.rows[0].gp_balance : 0;

    res.json({
      success: true,
      balance: {
        trainee_id,
        trainee_name: traineeRes.rows[0].trainee_name,
        myby_balance,
        gp_balance
      }
    });
  } catch (err) {
    console.error('[Dashboard API] GET Wallet Balance Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 12. GET /dashboard/myby-coin/:trainee_id — Get trainee's MYBY Coin balance (autocreate wallet if it doesn't exist)
router.get('/myby-coin/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    // 1. Verify that the trainee exists in the database
    const traineeResult = await db.query(
      'SELECT id, trainee_name, total_gold_periode FROM dashboard_trainne WHERE id = $1',
      [trainee_id]
    );

    if (traineeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Trainee dengan ID ${trainee_id} tidak ditemukan.`
      });
    }

    const traineeInfo = traineeResult.rows[0];

    // 2. Fetch the wallet from myby_coin
    const coinResult = await db.query(
      'SELECT id, trainee_name, myby_balance, gp_balance, created_at, updated_at FROM myby_coin WHERE id = $1',
      [trainee_id]
    );

    let walletData;

    if (coinResult.rows.length === 0) {
      // 3. Wallet doesn't exist, create it (GP balance dari total_gold_periode, 0 MYBY)
      const initialGp = traineeInfo.total_gold_periode ? parseInt(traineeInfo.total_gold_periode, 10) || 0 : 0;
      const insertResult = await db.query(
        `INSERT INTO myby_coin (id, trainee_name, myby_balance, gp_balance)
         VALUES ($1, $2, 0, $3)
         RETURNING id, trainee_name, myby_balance, gp_balance, created_at, updated_at`,
        [trainee_id, traineeInfo.trainee_name, initialGp]
      );
      walletData = insertResult.rows[0];
      console.log(`[MYBY Coin] Created wallet for trainee ${trainee_id} (${traineeInfo.trainee_name}) with ${initialGp} GP.`);
    } else {
      walletData = coinResult.rows[0];
    }

    res.json({
      success: true,
      data: {
        id: walletData.id,
        trainee_name: walletData.trainee_name,
        myby_balance: walletData.myby_balance,
        gp_balance: walletData.gp_balance,
        created_at: walletData.created_at,
        updated_at: walletData.updated_at
      }
    });
  } catch (err) {
    console.error(`[Dashboard API] GET MYBY Coin Error (Trainee: ${trainee_id}):`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
