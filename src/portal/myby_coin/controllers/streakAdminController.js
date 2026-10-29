/**
 * ============================================================
 * MYBY COIN - STREAK ADMIN CRUD CONTROLLER
 * ============================================================
 * CRUD penuh untuk tabel myby_trainee_streaks (admin/ops).
 * Kolom "ID" sebagai Primary Key, "Name" sebagai Secondary Key.
 * ============================================================
 */

const db = require('../../../db/neonClient');
const { ensureMyByCoinTables, getTraineeProfile } = require('../mybyCoinDatabase');

// GET /admin/streaks - List semua streak (dengan search + pagination)
async function handleAdminListStreaks(req, res) {
  try {
    await ensureMyByCoinTables();
    const { search, timeFilter, limit = 50, offset = 0 } = req.query;

    // Ambil seluruh trainee yang terdaftar di sistem wallet, gabungkan dengan data streak-nya
    let query = `
      SELECT 
        w."ID", 
        COALESCE(NULLIF(TRIM(w."Name"), ''), NULLIF(TRIM(s."Name"), ''), CONCAT('Trainee ', w."ID")) AS "Name",
        COALESCE(s.current_streak, 0) AS current_streak,
        COALESCE(s.longest_streak, 0) AS longest_streak,
        COALESCE(s.streak_cycle_day, 1) AS streak_cycle_day,
        s.last_check_in_date::TEXT AS last_check_in_date,
        COALESCE(s.total_check_ins, 0) AS total_check_ins,
        s.created_at,
        s.updated_at
      FROM myby_trainee_wallets w
      LEFT JOIN myby_trainee_streaks s ON w."ID" = s."ID"
    `;
    const params = [];
    const conds = [];

    if (search) {
      params.push(`%${search}%`);
      conds.push(`(w."ID" ILIKE $${params.length} OR w."Name" ILIKE $${params.length} OR s."Name" ILIKE $${params.length})`);
    }

    if (timeFilter === 'today') {
      conds.push(`DATE(CONVERT_TZ(s.last_check_in_date, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))`);
    } else if (timeFilter === 'last_week') {
      conds.push(`s.last_check_in_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    } else if (timeFilter === 'last_month') {
      conds.push(`s.last_check_in_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(timeFilter)) {
      conds.push(`(DATE(CONVERT_TZ(s.last_check_in_date, '+00:00', '+07:00')) = '${timeFilter}' OR DATE(CONVERT_TZ(w.created_at, '+00:00', '+07:00')) = '${timeFilter}')`);
    }

    if (conds.length) {
      query += ' WHERE ' + conds.join(' AND ');
    }

    query += ` ORDER BY COALESCE(s.total_check_ins, 0) DESC, COALESCE(s.current_streak, 0) DESC, w."ID" ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) AS count, COUNT(CASE WHEN (s.total_check_ins > 0 OR s.current_streak > 0) THEN 1 END) AS active_count FROM myby_trainee_wallets w LEFT JOIN myby_trainee_streaks s ON w."ID" = s."ID"';
    if (conds.length) {
      countQuery += ' WHERE ' + conds.join(' AND ');
    }
    const countRes = await db.query(countQuery, params.slice(0, conds.length ? (params.length - 2) : 0));
    const countVal = countRes.rows && countRes.rows[0] ? (countRes.rows[0].count ?? countRes.rows[0]['COUNT(*)'] ?? result.rows.length) : result.rows.length;
    const activeVal = countRes.rows && countRes.rows[0] ? Number(countRes.rows[0].active_count ?? countRes.rows[0].ACTIVE_COUNT ?? 0) : 0;

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data streak trainee.',
      total: result.rows.length,
      grandTotal: Number(countVal),
      activeCount: activeVal,
      data: result.rows
    });
  } catch (error) {
    console.error('[MyBy Streak Admin] LIST error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data streak.', error: error.message });
  }
}

// GET /admin/streaks/:id - Detail satu streak
async function handleAdminGetStreak(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const result = await db.query(
      `SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day,
              last_check_in_date::TEXT AS last_check_in_date, total_check_ins,
              created_at, updated_at FROM myby_trainee_streaks
       WHERE "ID" = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) {
      const profile = await getTraineeProfile(id);
      return res.status(200).json({
        success: true,
        message: 'Berhasil mengambil detail streak.',
        data: {
          ID: profile.ID,
          Name: profile.Name,
          current_streak: 0,
          longest_streak: 0,
          streak_cycle_day: 1,
          last_check_in_date: null,
          total_check_ins: 0,
          created_at: null,
          updated_at: null
        }
      });
    }
    return res.status(200).json({ success: true, message: 'Berhasil mengambil detail streak.', data: result.rows[0] });
  } catch (error) {
    console.error('[MyBy Streak Admin] GET error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail streak.', error: error.message });
  }
}

function toDateOnly(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    const m = val.match(/^\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : null;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  return null;
}

// POST /admin/streaks - Buat / Upsert streak
async function handleAdminUpsertStreak(req, res) {
  try {
    await ensureMyByCoinTables();
    const { ID, id, traineeId, Name, name, current_streak, longest_streak, streak_cycle_day, last_check_in_date, total_check_ins } = req.body;
    const rawId = String(ID ?? id ?? traineeId ?? '').trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Field "ID" / traineeId wajib diisi.' });
    }
    const profile = await getTraineeProfile(rawId);
    const finalName = String(Name ?? name ?? profile.Name ?? '').trim();
    const dateVal = toDateOnly(last_check_in_date);

    const result = await db.query(`
      INSERT INTO myby_trainee_streaks ("ID", "Name", current_streak, longest_streak, streak_cycle_day, last_check_in_date, total_check_ins, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::DATE, $7, NOW())
      ON CONFLICT ("ID") DO UPDATE SET
        "Name" = COALESCE(NULLIF(EXCLUDED."Name", ''), myby_trainee_streaks."Name"),
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        streak_cycle_day = EXCLUDED.streak_cycle_day,
        last_check_in_date = EXCLUDED.last_check_in_date,
        total_check_ins = EXCLUDED.total_check_ins,
        updated_at = NOW()
      RETURNING "ID", "Name", current_streak, longest_streak, streak_cycle_day,
                last_check_in_date::TEXT AS last_check_in_date, total_check_ins;
    `, [
      profile.ID,
      finalName,
      Number(current_streak ?? 0),
      Number(longest_streak ?? 0),
      Number(streak_cycle_day ?? 1),
      dateVal,
      Number(total_check_ins ?? 0)
    ]);
    const returnData = (await db.query(
      'SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day, last_check_in_date, total_check_ins FROM myby_trainee_streaks WHERE "ID" = $1',
      [profile.ID]
    )).rows[0] || result.rows[0];

    return res.status(201).json({ success: true, message: 'Data streak berhasil disimpan.', data: returnData });
  } catch (error) {
    console.error('[MyBy Streak Admin] UPSERT error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan data streak.', error: error.message });
  }
}

// PUT /admin/streaks/:id - Update streak (parsial)
async function handleAdminUpdateStreak(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const check = await db.query('SELECT * FROM myby_trainee_streaks WHERE "ID" = $1 LIMIT 1', [id]);
    const b = req.body;
    const rawDate = b.last_check_in_date !== undefined ? (b.last_check_in_date || null) : (check.rows[0]?.last_check_in_date || null);
    const dateVal = toDateOnly(rawDate);

    if (check.rows.length === 0) {
      const profile = await getTraineeProfile(id);
      const finalName = String(b.Name ?? b.name ?? profile.Name ?? `Trainee ${id}`).trim();
      const insertRes = await db.query(`
        INSERT INTO myby_trainee_streaks ("ID", "Name", current_streak, longest_streak, streak_cycle_day, last_check_in_date, total_check_ins, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6::DATE, $7, NOW())
        ON CONFLICT ("ID") DO UPDATE SET
          "Name" = COALESCE(NULLIF(EXCLUDED."Name", ''), myby_trainee_streaks."Name"),
          current_streak = EXCLUDED.current_streak,
          longest_streak = EXCLUDED.longest_streak,
          streak_cycle_day = EXCLUDED.streak_cycle_day,
          last_check_in_date = EXCLUDED.last_check_in_date,
          total_check_ins = EXCLUDED.total_check_ins,
          updated_at = NOW()
        RETURNING "ID", "Name", current_streak, longest_streak, streak_cycle_day,
                  last_check_in_date::TEXT AS last_check_in_date, total_check_ins;
      `, [
        id,
        finalName,
        Number(b.current_streak ?? 0),
        Number(b.longest_streak ?? 0),
        Number(b.streak_cycle_day ?? 1),
        dateVal,
        Number(b.total_check_ins ?? 0)
      ]);
      const returnData = (await db.query(
        'SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day, last_check_in_date, total_check_ins FROM myby_trainee_streaks WHERE "ID" = $1',
        [id]
      )).rows[0] || insertRes.rows[0];
      return res.status(200).json({ success: true, message: `Streak ID ${id} berhasil diperbarui.`, data: returnData });
    }

    const ex = check.rows[0];
    const result = await db.query(`
      UPDATE myby_trainee_streaks SET
        "Name" = $2, current_streak = $3, longest_streak = $4, streak_cycle_day = $5,
        last_check_in_date = $6::DATE, total_check_ins = $7, updated_at = NOW()
      WHERE "ID" = $1
      RETURNING "ID", "Name", current_streak, longest_streak, streak_cycle_day,
                last_check_in_date::TEXT AS last_check_in_date, total_check_ins;
    `, [
      ex.ID,
      b.Name ?? b.name ?? ex.Name,
      b.current_streak !== undefined ? Number(b.current_streak) : ex.current_streak,
      b.longest_streak !== undefined ? Number(b.longest_streak) : ex.longest_streak,
      b.streak_cycle_day !== undefined ? Number(b.streak_cycle_day) : ex.streak_cycle_day,
      dateVal,
      b.total_check_ins !== undefined ? Number(b.total_check_ins) : ex.total_check_ins
    ]);
    const returnData = (await db.query(
      'SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day, last_check_in_date, total_check_ins FROM myby_trainee_streaks WHERE "ID" = $1',
      [ex.ID]
    )).rows[0] || result.rows[0];

    return res.status(200).json({ success: true, message: `Streak ID ${ex.ID} berhasil diperbarui.`, data: returnData });
  } catch (error) {
    console.error('[MyBy Streak Admin] UPDATE error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui streak.', error: error.message });
  }
}

// DELETE /admin/streaks/:id - Hapus streak
async function handleAdminDeleteStreak(req, res) {
  const { id } = req.params;
  try {
    await ensureMyByCoinTables();
    const existing = await db.query(
      'SELECT "ID", "Name" FROM myby_trainee_streaks WHERE "ID" = $1 LIMIT 1;',
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Streak ID "${id}" tidak ditemukan.` });
    }
    await db.query(
      'DELETE FROM myby_trainee_streaks WHERE "ID" = $1;',
      [id]
    );
    return res.status(200).json({ success: true, message: 'Data streak berhasil dihapus.', data: existing.rows[0] });
  } catch (error) {
    console.error('[MyBy Streak Admin] DELETE error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal menghapus streak.', error: error.message });
  }
}

module.exports = {
  handleAdminListStreaks,
  handleAdminGetStreak,
  handleAdminUpsertStreak,
  handleAdminUpdateStreak,
  handleAdminDeleteStreak
};
