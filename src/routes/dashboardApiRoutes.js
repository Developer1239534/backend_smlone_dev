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

// 12. GET /dashboard/myby-coin/:trainee_id — Get trainee's MYBY Coin balance (autocreate wallet if it doesn't exist)
router.get('/myby-coin/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    // 1. Verify that the trainee exists in the database
    const traineeResult = await db.query(
      'SELECT id, trainee_name FROM dashboard_trainne WHERE id = $1',
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
      // 3. Wallet doesn't exist, create it (Welcome Bonus: 50 GP, 0 MYBY)
      const insertResult = await db.query(
        `INSERT INTO myby_coin (id, trainee_name, myby_balance, gp_balance)
         VALUES ($1, $2, 0, 50)
         RETURNING id, trainee_name, myby_balance, gp_balance, created_at, updated_at`,
        [trainee_id, traineeInfo.trainee_name]
      );
      walletData = insertResult.rows[0];
      console.log(`[MYBY Coin] Created wallet for trainee ${trainee_id} (${traineeInfo.trainee_name}) with 50 GP.`);
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
