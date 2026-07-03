const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const verifyToken = require('../middleware/authMiddleware');

// Helper to fetch trainee and handle errors
async function getTraineeOrError(id, res) {
  try {
    const result = await db.query(
      `SELECT dt.*, 
              COALESCE(gp.total_gold_periode, '0') AS total_gold_periode,
              gp.rank_id_junior,
              gp.rank_id_youth,
              gp.rank_id_junior_timor,
              gp.rank_id_youth_timor,
              gp.rank_id_junior_tritura,
              gp.rank_id_youth_tritura,
              gp.rank_id_junior_cemara,
              gp.rank_id_youth_cemara
       FROM dashboard_trainne dt
       LEFT JOIN (
         SELECT DISTINCT ON (trainee_id) *
         FROM gp_month
         ORDER BY trainee_id, created_at DESC
       ) gp ON dt.id = gp.trainee_id
       WHERE dt.id = $1`,
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

// Helper to parse period string for sorting
function parsePeriod(periodStr) {
  if (!periodStr) return { year: 0, quarter: 0 };
  const clean = periodStr.replace(/\s+/g, '').toLowerCase();
  const yearMatch = clean.match(/\d{4}$/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
  
  let quarter = 0;
  if (clean.includes('jan') || clean.includes('mar')) {
    quarter = 1;
  } else if (clean.includes('apr') || clean.includes('jun')) {
    quarter = 2;
  } else if (clean.includes('jul') || clean.includes('sep')) {
    quarter = 3;
  } else if (clean.includes('oct') || clean.includes('dec')) {
    quarter = 4;
  }
  return { year, quarter };
}

function comparePeriods(a, b) {
  const pa = parsePeriod(a);
  const pb = parsePeriod(b);
  if (pa.year !== pb.year) {
    return pb.year - pa.year;
  }
  return pb.quarter - pa.quarter;
}

function parseRealStagePeriod(periodStr) {
  if (!periodStr) return 0;
  const match = periodStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function compareRealStagePeriods(a, b) {
  return parseRealStagePeriod(b) - parseRealStagePeriod(a);
}

// ========================================================
// PUBLIC NEWS / ANNOUNCEMENTS
// ========================================================
router.get('/news', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM news_announcements ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Dashboard API] GET News error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 1. GET /dashboard/profile/:id
router.get('/profile/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  try {
    const rsResult = await db.query(
      'SELECT periode, url FROM real_stage WHERE trainee_id = $1',
      [trainee.id]
    );
    const sortedRS = rsResult.rows.sort((a, b) => compareRealStagePeriods(a.periode, b.periode));

    res.json({
      success: true,
      data: {
        id_trainee: trainee.id,
        nama_trainee: trainee.trainee_name,
        program: trainee.program,
        class: trainee.class ? trainee.class.replace(/\s*\([^)]*\)/g, '').trim() : trainee.class,
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
        rank_id_youth_cemara: trainee.rank_id_youth_cemara,
        newest_grade: trainee.newest_grade,
        nama_sekolah: trainee.nama_sekolah,
        wa_trainee: trainee.wa_trainee,
        screening_test: trainee.screening_test,
        screeningTest: trainee.screening_test,
        // Real stage reports
        real_stage: sortedRS[0]?.url || null,
        real_stages: sortedRS,
        realStage: sortedRS[0]?.url || null,
        realStages: sortedRS,
        real_stage_report: sortedRS[0]?.url || null,
        realStageReport: sortedRS[0]?.url || null
      }
    });
  } catch (err) {
    console.error(`[Dashboard API Error] GET /profile/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 1.5 PATCH /dashboard/profile/:id - User updates their own profile
router.patch('/profile/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!req.trainee || String(req.trainee.id) !== String(id)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya diizinkan mengubah profil Anda sendiri.'
    });
  }
  
  // Explicitly prevent updating ID and Trainee Name (Read-Only)
  delete updates.id;
  delete updates.trainee_name;

  // Handle frontend camelCase aliases
  if (updates.tanggalLahir !== undefined) updates.tanggal_lahir = updates.tanggalLahir;
  if (updates.profilePicture !== undefined) updates.profile_picture = updates.profilePicture;
  if (updates.oldPassword !== undefined) updates.old_password = updates.oldPassword;
  if (updates.newestGrade !== undefined) updates.newest_grade = updates.newestGrade;
  if (updates.namaSekolah !== undefined) updates.nama_sekolah = updates.namaSekolah;
  if (updates.school !== undefined) updates.nama_sekolah = updates.school;
  if (updates.waTrainee !== undefined) updates.wa_trainee = updates.waTrainee;
  if (updates.wa_trainee !== undefined) updates.wa_trainee = updates.wa_trainee;

  // List of fields that a USER is allowed to update
  const allowedFields = ['profile_picture', 'phone', 'tanggal_lahir', 'password', 'old_password', 'newest_grade', 'nama_sekolah', 'wa_trainee'];
  
  const updateData = {};
  for (const field of allowedFields) {
    // Only update if the field is actually provided (can be empty string or null)
    if (updates[field] !== undefined) {
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
    
    const query = `UPDATE dashboard_trainne SET ${setClause} WHERE id = $${keys.length + 1} RETURNING id, trainee_name, profile_picture, phone, tanggal_lahir, newest_grade, nama_sekolah, wa_trainee`;
    
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
      progress_ke_next_level: null,
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
      highlight_terbaru: null,
      pengumuman: null
    }
  });
});

// 4. GET /dashboard/reports/:id
router.get('/reports/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  try {
    const reportsResult = await db.query(
      'SELECT periode, url FROM quarterly_report WHERE trainee_id = $1',
      [trainee.id]
    );
    const sortedReports = reportsResult.rows.sort((a, b) => comparePeriods(a.periode, b.periode));

    // Fetch real stage reports
    const rsResult = await db.query(
      'SELECT periode, url FROM real_stage WHERE trainee_id = $1',
      [trainee.id]
    );
    const sortedRS = rsResult.rows.sort((a, b) => compareRealStagePeriods(a.periode, b.periode));

    res.json({
      success: true,
      data: {
        id_trainee: trainee.id,
        nama_trainee: trainee.trainee_name,
        weekly_report: trainee.weekly_report,
        screening_test: trainee.screening_test,
        screeningTest: trainee.screening_test,
        quarterly_report: sortedReports[0]?.url || null,
        quarterly_reports: sortedReports,
        // Real stage reports
        real_stage: sortedRS[0]?.url || null,
        real_stages: sortedRS,
        realStage: sortedRS[0]?.url || null,
        realStages: sortedRS,
        real_stage_report: sortedRS[0]?.url || null,
        realStageReport: sortedRS[0]?.url || null
      }
    });
  } catch (err) {
    console.error(`[Dashboard API Error] GET /reports/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 4.1 GET /dashboard/reports/quarterly/:id (Frontend Compatibility)
router.get('/reports/quarterly/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  try {
    const reportsResult = await db.query(
      'SELECT periode, url FROM quarterly_report WHERE trainee_id = $1',
      [trainee.id]
    );
    const sortedReports = reportsResult.rows.sort((a, b) => comparePeriods(a.periode, b.periode));

    res.json({
      success: true,
      data: {
        id_trainee: trainee.id,
        nama_trainee: trainee.trainee_name,
        weekly_report: trainee.weekly_report,
        quarterly_report: sortedReports[0]?.url || null,
        quarterly_reports: sortedReports
      }
    });
  } catch (err) {
    console.error(`[Dashboard API Error] GET /reports/quarterly/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 4.5 GET /dashboard/reports/real-stage/:id
router.get('/reports/real-stage/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  try {
    const reportsResult = await db.query(
      'SELECT periode, url FROM real_stage WHERE trainee_id = $1',
      [trainee.id]
    );
    const sortedReports = reportsResult.rows.sort((a, b) => compareRealStagePeriods(a.periode, b.periode));

    res.json({
      success: true,
      data: {
        id_trainee: trainee.id,
        nama_trainee: trainee.trainee_name,
        real_stage: sortedReports[0]?.url || null,
        real_stages: sortedReports
      }
    });
  } catch (err) {
    console.error(`[Dashboard API Error] GET /reports/real-stage/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
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
      completed_speaking_project: null
    }
  });
});

// 7. GET /dashboard/reports/previous/:id
router.get('/reports/previous/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  try {
    const reportsResult = await db.query(
      'SELECT periode, url FROM quarterly_report WHERE trainee_id = $1',
      [trainee.id]
    );
    const sortedReports = reportsResult.rows.sort((a, b) => comparePeriods(a.periode, b.periode));

    res.json({
      success: true,
      data: {
        id_trainee: trainee.id,
        nama_trainee: trainee.trainee_name,
        laporan_sebelumnya: sortedReports[1]?.url || null,
        laporan_quarter_sebelumnya: sortedReports[2]?.url || null
      }
    });
  } catch (err) {
    console.error(`[Dashboard API Error] GET /reports/previous/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
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
    if (traineeInfo && typeof traineeInfo.class === 'string') {
      traineeInfo.class = traineeInfo.class.replace(/\s*\([^)]*\)/g, '').trim();
    }

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
router.post('/myby-coin/convert', verifyToken, async (req, res) => {
  const { trainee_id, amount } = req.body;

  if (!req.trainee || String(req.trainee.id) !== String(trainee_id)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya diizinkan mengonversi koin untuk akun Anda sendiri.'
    });
  }

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
    const walletRes = await client.query('SELECT trainee_name, myby_balance, gp_balance FROM myby_coin WHERE id = $1', [trainee_id]);
    if (walletRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Dompet trainee tidak ditemukan.' });
    }

    const traineeWallet = walletRes.rows[0];
    if (traineeWallet.myby_balance < convertAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Saldo MYBY Coin tidak mencukupi.' });
    }

    // 2. Update balances
    await client.query(
      'UPDATE myby_coin SET myby_balance = myby_balance - $1, gp_balance = gp_balance + $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [convertAmount, gpEarned, trainee_id]
    );

    // 3. Insert ledger entry (untuk GP masuk)
    const ledgerId = require('crypto').randomUUID();
    const transactionId = 'CONV-' + trainee_id + '-' + Date.now();
    await client.query(
      `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
       VALUES ($1, $2, $3, $4, 'Deposit', $5, 'Credit', $6, 'Success')`,
      [ledgerId, transactionId, trainee_id, traineeWallet.trainee_name, gpEarned, `Konversi ${convertAmount} MYBY ke ${gpEarned} GP`]
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

// 14. POST /dashboard/myby-coin/vault-action — Deposit or Withdrawal MYBY/GP
router.post('/myby-coin/vault-action', verifyToken, async (req, res) => {
  const { trainee_id, action_type, currency, amount } = req.body;

  if (!req.trainee || String(req.trainee.id) !== String(trainee_id)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya diizinkan melakukan transaksi deposit/withdrawal untuk akun Anda sendiri.'
    });
  }

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
    const walletRes = await client.query('SELECT trainee_name, myby_balance, gp_balance FROM myby_coin WHERE id = $1', [trainee_id]);
    if (walletRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Dompet trainee tidak ditemukan.' });
    }

    const wallet = walletRes.rows[0];
    const ledgerId = require('crypto').randomUUID();
    const transactionId = 'VAULT-' + trainee_id + '-' + Date.now();

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
        
        // Catat ke ledger terpadu jika mutasi GP
        await client.query(
          `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
           VALUES ($1, $2, $3, $4, 'Transfer', $5, 'Debit', $6, 'Success')`,
          [ledgerId, transactionId, trainee_id, wallet.trainee_name, valAmount, 'Vault GP Withdrawal']
        );
      }
    } else {
      // Action: deposit (add)
      if (currency === 'MYBY') {
        await client.query('UPDATE myby_coin SET myby_balance = myby_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [valAmount, trainee_id]);
      } else {
        await client.query('UPDATE myby_coin SET gp_balance = gp_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [valAmount, trainee_id]);
        
        // Catat ke ledger terpadu jika mutasi GP
        await client.query(
          `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
           VALUES ($1, $2, $3, $4, 'Deposit', $5, 'Credit', $6, 'Success')`,
          [ledgerId, transactionId, trainee_id, wallet.trainee_name, valAmount, 'Vault GP Deposit']
        );
      }
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

// 15. GET /dashboard/myby-coin/rewards — Get Rewards Shop list (legacy)
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

// 16. POST /dashboard/myby-coin/rewards/claim — Claim reward (legacy)
router.post('/myby-coin/rewards/claim', verifyToken, async (req, res) => {
  const { trainee_id, reward_id } = req.body;

  if (!req.trainee || String(req.trainee.id) !== String(trainee_id)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya diizinkan mengklaim hadiah untuk akun Anda sendiri.'
    });
  }

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
    const walletRes = await client.query('SELECT trainee_name, myby_balance, gp_balance FROM myby_coin WHERE id = $1', [trainee_id]);
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

      // Catat ke ledger terpadu jika memotong GP
      const ledgerId = require('crypto').randomUUID();
      const transactionId = 'CLAIM-' + trainee_id + '-' + Date.now();
      await client.query(
        `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
         VALUES ($1, $2, $3, $4, 'Purchase', $5, 'Debit', $6, 'Success')`,
        [ledgerId, transactionId, trainee_id, wallet.trainee_name, reward.cost, `Klaim hadiah: ${reward.reward_name}`]
      );
    }

    // 4. Deduct reward stock
    await client.query('UPDATE rewards_shop SET stock = stock - 1 WHERE id = $1', [reward_id]);

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

// 18. POST /dashboard/myby-coin/transfer — Transfer Gold Point to Trainer
router.post('/myby-coin/transfer', verifyToken, async (req, res) => {
  const { created_by, trainer_id, trainer_name, amount_gold_point } = req.body;

  if (!req.trainee || String(req.trainee.id) !== String(created_by)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya diizinkan mentransfer poin untuk akun Anda sendiri.'
    });
  }

  if (!created_by || !trainer_id || !trainer_name || amount_gold_point === undefined) {
    return res.status(400).json({ success: false, message: 'Parameter created_by, trainer_id, trainer_name, dan amount_gold_point diperlukan.' });
  }

  const gpAmount = parseInt(amount_gold_point, 10);
  if (isNaN(gpAmount) || gpAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah Gold Point harus berupa angka positif.' });
  }

  const transferId = require('crypto').randomUUID();
  const ledgerId = require('crypto').randomUUID();
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify sender wallet exists and check balance
    const walletRes = await client.query('SELECT trainee_name, gp_balance FROM myby_coin WHERE id = $1', [created_by]);
    if (walletRes.rows.length === 0) {
      // Save transfer transaction as Failed
      await client.query(
        `INSERT INTO myby_coin_transfer (transfer_id, trainer_id, trainer_name, amount_gold_point, status, created_by)
         VALUES ($1, $2, $3, $4, 'Failed', $5)`,
        [transferId, trainer_id, trainer_name, gpAmount, created_by]
      );
      // Save ledger audit as Failed
      await client.query(
        `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
         VALUES ($1, $2, $3, $4, 'Transfer', $5, 'Debit', $6, 'Failed')`,
        [ledgerId, transferId, created_by, 'Unknown Trainee', gpAmount, `Transfer GP ke trainer ${trainer_name} (Dompet Tidak Ditemukan)`]
      );
      await client.query('COMMIT');
      return res.status(404).json({ success: false, message: 'Dompet pengirim tidak ditemukan.' });
    }

    const senderWallet = walletRes.rows[0];
    const currentGp = senderWallet.gp_balance;

    if (currentGp < gpAmount) {
      // Save transfer transaction as Failed
      await client.query(
        `INSERT INTO myby_coin_transfer (transfer_id, trainer_id, trainer_name, amount_gold_point, status, created_by)
         VALUES ($1, $2, $3, $4, 'Failed', $5)`,
        [transferId, trainer_id, trainer_name, gpAmount, created_by]
      );
      // Save ledger audit as Failed
      await client.query(
        `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
         VALUES ($1, $2, $3, $4, 'Transfer', $5, 'Debit', $6, 'Failed')`,
        [ledgerId, transferId, created_by, senderWallet.trainee_name, gpAmount, `Transfer GP ke trainer ${trainer_name} (Saldo Tidak Mencukupi)`]
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

    // 4. Record to ledger terpadu
    await client.query(
      `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
       VALUES ($1, $2, $3, $4, 'Transfer', $5, 'Debit', $6, 'Success')`,
      [ledgerId, transferId, created_by, senderWallet.trainee_name, gpAmount, `Transfer GP ke trainer ${trainer_name}`]
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
router.post('/myby-coin/deposit', verifyToken, async (req, res) => {
  const { trainee_id, trainer_id, trainer_name, amount_gold_point, deposit_method } = req.body;

  if (!req.trainee || String(req.trainee.id) !== String(trainee_id)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya diizinkan memproses deposit untuk akun Anda sendiri.'
    });
  }

  if (!trainee_id || !trainer_id || !trainer_name || amount_gold_point === undefined || !deposit_method) {
    return res.status(400).json({ success: false, message: 'Parameter trainee_id, trainer_id, trainer_name, amount_gold_point, dan deposit_method diperlukan.' });
  }

  const gpAmount = parseInt(amount_gold_point, 10);
  if (isNaN(gpAmount) || gpAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah Gold Point harus berupa angka positif lebih dari 0.' });
  }

  if (typeof trainer_id !== 'string' || trainer_id.trim() === '') {
    return res.status(400).json({ success: false, message: 'Trainer ID tidak valid.' });
  }

  const allowedMethods = ['Transfer Bank', 'Cash', 'Credit Card', 'E-Wallet'];
  if (!allowedMethods.includes(deposit_method)) {
    return res.status(400).json({ success: false, message: `Metode deposit tidak tersedia. Metode yang didukung: ${allowedMethods.join(', ')}` });
  }

  const depositId = require('crypto').randomUUID();
  const ledgerId = require('crypto').randomUUID();
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify trainee wallet exists (create if not exist)
    const walletRes = await client.query(
      `SELECT dt.id, dt.trainee_name, gp.total_gold_periode 
       FROM dashboard_trainne dt
       LEFT JOIN (
         SELECT DISTINCT ON (trainee_id) *
         FROM gp_month
         ORDER BY trainee_id, created_at DESC
       ) gp ON dt.id = gp.trainee_id
       WHERE dt.id = $1`,
      [trainee_id]
    );
    if (walletRes.rows.length === 0) {
      await client.query(
        `INSERT INTO myby_coin_deposit (deposit_id, trainer_id, trainer_name, trainee_id, amount_gold_point, deposit_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Failed')`,
        [depositId, trainer_id, trainer_name, trainee_id, gpAmount, deposit_method]
      );
      await client.query(
        `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
         VALUES ($1, $2, $3, $4, 'Deposit', $5, 'Credit', $6, 'Failed')`,
        [ledgerId, depositId, trainee_id, 'Unknown Trainee', gpAmount, `Deposit GP dari trainer ${trainer_name} via ${deposit_method} (Trainee Tidak Ditemukan)`]
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

    // 4. Record to ledger terpadu
    await client.query(
      `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
       VALUES ($1, $2, $3, $4, 'Deposit', $5, 'Credit', $6, 'Success')`,
      [ledgerId, depositId, trainee_id, traineeInfo.trainee_name, gpAmount, `Deposit GP dari trainer ${trainer_name} via ${deposit_method}`]
    );

    await client.query('COMMIT');
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
    res.json({ success: true, deposits: result.rows });
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
    res.json({ success: true, deposit: result.rows[0] });
  } catch (err) {
    console.error('[Dashboard API] GET Deposit Detail Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 22. GET /dashboard/myby-coin/wallet/balance/:trainee_id — Get Wallet Balance
router.get('/myby-coin/wallet/balance/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
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

// === MODUL SHOP BARU ===

// 23. GET /dashboard/myby-coin/shop/products — Get active products
router.get('/myby-coin/shop/products', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT product_id, product_name, product_description, product_image, gold_point_price, stock, status FROM myby_coin_shop WHERE status = 'Active' ORDER BY created_at DESC"
    );
    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error('[Dashboard API] GET Shop Products Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 24. GET /dashboard/myby-coin/shop/product/:id — Get product detail
router.get('/myby-coin/shop/product/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "SELECT product_id, product_name, product_description, product_image, gold_point_price, stock, status FROM myby_coin_shop WHERE product_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }
    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error('[Dashboard API] GET Shop Product Detail Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 25. POST /dashboard/myby-coin/shop/purchase — Purchase product using GP
router.post('/myby-coin/shop/purchase', verifyToken, async (req, res) => {
  const { trainer_id, trainer_name, product_id } = req.body;

  if (!req.trainee || String(req.trainee.id) !== String(trainer_id)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya diizinkan melakukan pembelian produk untuk akun Anda sendiri.'
    });
  }

  if (!trainer_id || !trainer_name || !product_id) {
    return res.status(400).json({ success: false, message: 'Parameter trainer_id, trainer_name, dan product_id diperlukan.' });
  }

  const purchaseId = require('crypto').randomUUID();
  const ledgerId = require('crypto').randomUUID();
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify product exists, status active, and stock available
    const productRes = await client.query('SELECT product_id, product_name, gold_point_price, stock, status FROM myby_coin_shop WHERE product_id = $1', [product_id]);
    if (productRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    const product = productRes.rows[0];
    if (product.status !== 'Active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Produk sedang tidak aktif.' });
    }

    if (product.stock <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Stok produk sudah habis.' });
    }

    // 2. Verify buyer wallet exists and has sufficient GP
    const walletRes = await client.query('SELECT gp_balance FROM myby_coin WHERE id = $1', [trainer_id]);
    if (walletRes.rows.length === 0) {
      // Record failed transaction to DB and ledger
      await client.query(
        `INSERT INTO myby_coin_shop_transaction (transaction_id, trainer_id, trainer_name, product_id, product_name, amount_gold_point, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Failed')`,
        [purchaseId, trainer_id, trainer_name, product_id, product.product_name, product.gold_point_price]
      );
      await client.query(
        `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
         VALUES ($1, $2, $3, $4, 'Purchase', $5, 'Debit', $6, 'Failed')`,
        [ledgerId, purchaseId, trainer_id, trainer_name, product.gold_point_price, `Pembelian ${product.product_name} (Dompet Tidak Ditemukan)`]
      );
      await client.query('COMMIT');
      return res.status(404).json({ success: false, message: 'Dompet pembeli tidak ditemukan.' });
    }

    const currentGp = walletRes.rows[0].gp_balance;
    if (currentGp < product.gold_point_price) {
      // Record failed transaction to DB and ledger
      await client.query(
        `INSERT INTO myby_coin_shop_transaction (transaction_id, trainer_id, trainer_name, product_id, product_name, amount_gold_point, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Failed')`,
        [purchaseId, trainer_id, trainer_name, product_id, product.product_name, product.gold_point_price]
      );
      await client.query(
        `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
         VALUES ($1, $2, $3, $4, 'Purchase', $5, 'Debit', $6, 'Failed')`,
        [ledgerId, purchaseId, trainer_id, trainer_name, product.gold_point_price, `Pembelian ${product.product_name} (Saldo GP Kurang)`]
      );
      await client.query('COMMIT');
      return res.status(400).json({ success: false, message: 'Saldo Gold Point tidak mencukupi.' });
    }

    // 3. Update balances & product stock
    await client.query(
      'UPDATE myby_coin SET gp_balance = gp_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [product.gold_point_price, trainer_id]
    );

    await client.query(
      'UPDATE myby_coin_shop SET stock = stock - 1 WHERE product_id = $1',
      [product_id]
    );

    // 4. Save success transaction to shop log
    await client.query(
      `INSERT INTO myby_coin_shop_transaction (transaction_id, trainer_id, trainer_name, product_id, product_name, amount_gold_point, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Success')`,
      [purchaseId, trainer_id, trainer_name, product_id, product.product_name, product.gold_point_price]
    );

    // 5. Save success transaction to ledger
    await client.query(
      `INSERT INTO myby_coin_ledger (ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status)
       VALUES ($1, $2, $3, $4, 'Purchase', $5, 'Debit', $6, 'Success')`,
      [ledgerId, purchaseId, trainer_id, trainer_name, product.gold_point_price, `Pembelian produk: ${product.product_name}`]
    );

    await client.query('COMMIT');
    console.log(`[Notification] Halo ${trainer_name}, pembelian "${product.product_name}" seharga ${product.gold_point_price} GP berhasil dilakukan.`);

    res.json({
      success: true,
      message: `Pembelian "${product.product_name}" berhasil diproses.`,
      transaction_id: purchaseId,
      status: 'Success',
      notification_sent: true
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Dashboard API] POST Shop Purchase Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// 26. GET /dashboard/myby-coin/shop/history — Get purchase history
router.get('/myby-coin/shop/history', async (req, res) => {
  const { trainer_id } = req.query;
  try {
    let query = 'SELECT transaction_id, trainer_id, trainer_name, product_id, product_name, amount_gold_point, status, transaction_date FROM myby_coin_shop_transaction';
    const params = [];
    if (trainer_id) {
      query += ' WHERE trainer_id = $1';
      params.push(trainer_id);
    }
    query += ' ORDER BY transaction_date DESC';

    const result = await db.query(query, params);
    res.json({ success: true, history: result.rows });
  } catch (err) {
    console.error('[Dashboard API] GET Shop History Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// === MODUL LEDGER BARU ===

// 27. GET /dashboard/myby-coin/ledger — Get all ledger records
router.get('/myby-coin/ledger', async (req, res) => {
  try {
    const result = await db.query('SELECT ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, status, transaction_date FROM myby_coin_ledger ORDER BY transaction_date DESC');
    res.json({ success: true, ledger: result.rows });
  } catch (err) {
    console.error('[Dashboard API] GET All Ledger Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 28. GET /dashboard/myby-coin/ledger/history — Get ledger history (optional trainer filter)
router.get('/myby-coin/ledger/history', async (req, res) => {
  const { trainer_id } = req.query;
  try {
    let query = 'SELECT ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, status, transaction_date FROM myby_coin_ledger';
    const params = [];
    if (trainer_id) {
      query += ' WHERE trainer_id = $1';
      params.push(trainer_id);
    }
    query += ' ORDER BY transaction_date DESC';

    const result = await db.query(query, params);
    res.json({ success: true, ledger: result.rows });
  } catch (err) {
    console.error('[Dashboard API] GET Ledger History Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 29. GET /dashboard/myby-coin/ledger/detail/:id — Get ledger detail
router.get('/myby-coin/ledger/detail/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, description, status, transaction_date 
       FROM myby_coin_ledger WHERE ledger_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Catatan ledger tidak ditemukan.' });
    }
    res.json({ success: true, ledger: result.rows[0] });
  } catch (err) {
    console.error('[Dashboard API] GET Ledger Detail Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 30. GET /dashboard/myby-coin/ledger/filter — Advanced filter ledger
router.get('/myby-coin/ledger/filter', async (req, res) => {
  const { start_date, end_date, trainer_id, transaction_type, status } = req.query;

  try {
    let query = 'SELECT ledger_id, transaction_id, trainer_id, trainer_name, transaction_type, amount_gold_point, transaction_direction, status, transaction_date FROM myby_coin_ledger WHERE 1=1';
    const params = [];
    let pCount = 1;

    if (trainer_id) {
      query += ` AND trainer_id = $${pCount}`;
      params.push(trainer_id);
      pCount++;
    }

    if (transaction_type) {
      query += ` AND transaction_type = $${pCount}`;
      params.push(transaction_type);
      pCount++;
    }

    if (status) {
      query += ` AND status = $${pCount}`;
      params.push(status);
      pCount++;
    }

    if (start_date) {
      query += ` AND transaction_date >= $${pCount}`;
      params.push(new Date(start_date));
      pCount++;
    }

    if (end_date) {
      query += ` AND transaction_date <= $${pCount}`;
      params.push(new Date(end_date));
      pCount++;
    }

    query += ' ORDER BY transaction_date DESC';

    const result = await db.query(query, params);
    res.json({ success: true, ledger: result.rows });
  } catch (err) {
    console.error('[Dashboard API] GET Filtered Ledger Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 12. GET /dashboard/myby-coin/:trainee_id — Get trainee's MYBY Coin balance (autocreate wallet if it doesn't exist)
router.get('/myby-coin/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    // 1. Verify that the trainee exists in the database
    const traineeResult = await db.query(
      `SELECT dt.id, dt.trainee_name, gp.total_gold_periode 
       FROM dashboard_trainne dt
       LEFT JOIN (
         SELECT DISTINCT ON (trainee_id) *
         FROM gp_month
         ORDER BY trainee_id, created_at DESC
       ) gp ON dt.id = gp.trainee_id
       WHERE dt.id = $1`,
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
