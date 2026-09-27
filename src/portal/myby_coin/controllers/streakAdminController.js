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
    const { search, limit = 50, offset = 0 } = req.query;

    let query = `SELECT "ID", "Name", current_streak, longest_streak, streak_cycle_day,
                 last_check_in_date::TEXT AS last_check_in_date, total_check_ins,
                 created_at, updated_at FROM myby_trainee_streaks`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE "ID" ILIKE $1 OR "Name" ILIKE $1`;
    }
    query += ` ORDER BY current_streak DESC, "Name" ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await db.query(query, params);
    const countRes = await db.query('SELECT COUNT(*) FROM myby_trainee_streaks');
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data streak trainee.',
      total: result.rows.length,
      grandTotal: Number(countRes.rows[0].count),
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
       WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 OR "Name" ILIKE $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Streak ID "${id}" tidak ditemukan.` });
    }
    return res.status(200).json({ success: true, message: 'Berhasil mengambil detail streak.', data: result.rows[0] });
  } catch (error) {
    console.error('[MyBy Streak Admin] GET error:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail streak.', error: error.message });
  }
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
      last_check_in_date || null,
      Number(total_check_ins ?? 0)
    ]);
    return res.status(201).json({ success: true, message: 'Data streak berhasil disimpan.', data: result.rows[0] });
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
    const check = await db.query('SELECT * FROM myby_trainee_streaks WHERE "ID" = $1 OR "ID" ILIKE $1 LIMIT 1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Streak ID "${id}" tidak ditemukan.` });
    }
    const ex = check.rows[0];
    const b = req.body;
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
      b.current_streak ?? ex.current_streak,
      b.longest_streak ?? ex.longest_streak,
      b.streak_cycle_day ?? ex.streak_cycle_day,
      b.last_check_in_date !== undefined ? (b.last_check_in_date || null) : ex.last_check_in_date,
      b.total_check_ins ?? ex.total_check_ins
    ]);
    return res.status(200).json({ success: true, message: `Streak ID ${ex.ID} berhasil diperbarui.`, data: result.rows[0] });
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
    const result = await db.query(
      'DELETE FROM myby_trainee_streaks WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 RETURNING "ID", "Name";',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Streak ID "${id}" tidak ditemukan.` });
    }
    return res.status(200).json({ success: true, message: 'Data streak berhasil dihapus.', data: result.rows[0] });
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
