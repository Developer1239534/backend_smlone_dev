const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: Award 2025 (/api/award-2025 & /api/portal/award-2025)
 * HANYA 20 Kolom Resmi Sesuai Permintaan:
 * 1. No (Primary Key)
 * 2. Trainee of the Season
 * 3. Most Active Trainee (OSJ/Y)
 * 4. The Most Creative Trainee (OSJ/Y)
 * 5. The Most Supportive Trainee (OSJ/Y)
 * 6. The Most Improved (OSJ/Y)
 * 7. The Most Inspirational Trainee (OSJ/Y)
 * 8. The Most Discipline (OSJ/Y)
 * 9. The Most Initiative (OSJ/Y)
 * 10. The Most Favorite (OSJ/Y)
 * 11. Best House Leader (OSJ/Y)
 * 12. SMLONE Manner Award (OSJ/Y)
 * 13. Skill Manner Life Award (OSJ/Y)
 * 14. The Most Initiative Apprentice Trainee
 * 15. SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed
 * 16. SMLONE Life Award (OSJ/Y)
 * 17. THE OSJ TOP SCORER (Highest  Gold Points)
 * 18. THE OSY TOP SCORER (Highest  Gold Points)
 * 19. The Most Discipline Apprentice Trainee (HIghest attendance)
 * 20. THE OSJ & OSY TOP HOUSE
 * ============================================================
 */

const AWARD_COLUMNS = [
  "No",
  "Trainee of the Season",
  "Most Active Trainee (OSJ/Y)",
  "The Most Creative Trainee (OSJ/Y)",
  "The Most Supportive Trainee (OSJ/Y)",
  "The Most Improved (OSJ/Y)",
  "The Most Inspirational Trainee (OSJ/Y)",
  "The Most Discipline (OSJ/Y)",
  "The Most Initiative (OSJ/Y)",
  "The Most Favorite (OSJ/Y)",
  "Best House Leader (OSJ/Y)",
  "SMLONE Manner Award (OSJ/Y)",
  "Skill Manner Life Award (OSJ/Y)",
  "The Most Initiative Apprentice Trainee",
  "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed",
  "SMLONE Life Award (OSJ/Y)",
  "THE OSJ TOP SCORER (Highest  Gold Points)",
  "THE OSY TOP SCORER (Highest  Gold Points)",
  "The Most Discipline Apprentice Trainee (HIghest attendance)",
  "THE OSJ & OSY TOP HOUSE"
];

// Helper to ensure award_2025 table exists with strictly and only the 20 columns
async function ensureAward2025Table() {
  try {
    const colDefs = AWARD_COLUMNS.map((col, idx) => {
      if (idx === 0) return `"${col}" VARCHAR(50) PRIMARY KEY`;
      return `"${col}" TEXT`;
    }).join(',\n        ');

    await db.query(`
      CREATE TABLE IF NOT EXISTS award_2025 (
        ${colDefs}
      );
    `);
  } catch (err) {
    console.error('[Award 2025] Ensure table error:', err.message);
  }
}

// Format row untuk menghasilkan 20 kolom resmi
function formatAwardRow(row) {
  const result = {};
  for (const col of AWARD_COLUMNS) {
    let val = row[col] ?? '';
    // Jika data berupa JSON string dari sheet/n8n, parse otomatis
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try { val = JSON.parse(val); } catch {}
    }
    result[col] = val;
  }
  return result;
}

// 1. GET / - Ambil semua data Award 2025 murni dari database Neon
router.get('/', async (req, res) => {
  try {
    await ensureAward2025Table();

    let result;
    try {
      result = await db.query('SELECT * FROM award_2025 ORDER BY "No"::int ASC');
    } catch (e) {
      result = await db.query('SELECT * FROM award_2025 ORDER BY "No" ASC');
    }

    const formatted = result.rows.map(formatAwardRow);

    res.json({
      success: true,
      message: 'Berhasil mengambil data Award 2025.',
      count: formatted.length,
      total: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('[Award 2025] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 2. GET /:no - Ambil detail per baris No
router.get('/:no', async (req, res) => {
  const { no } = req.params;
  try {
    await ensureAward2025Table();
    const result = await db.query(
      'SELECT * FROM award_2025 WHERE "No" = $1 OR "No" ILIKE $1 LIMIT 1',
      [no]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data award tidak ditemukan untuk No: ${no}` });
    }

    res.json({ success: true, data: formatAwardRow(result.rows[0]) });
  } catch (err) {
    console.error('[Award 2025] GET by No error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. POST / - Tambah / Upsert data tunggal (20 kolom murni)
router.post('/', async (req, res) => {
  const body = req.body;
  const no = String(body["No"] ?? body.no ?? '').trim();

  if (!no) {
    return res.status(400).json({ success: false, message: 'Kolom "No" wajib diisi.' });
  }

  try {
    await ensureAward2025Table();

    const insertCols = AWARD_COLUMNS.map(c => `"${c}"`).join(', ');
    const valuePlaceholders = AWARD_COLUMNS.map((_, i) => `$${i + 1}`).join(', ');
    const updateSets = AWARD_COLUMNS.filter(c => c !== 'No')
      .map(c => `"${c}" = EXCLUDED."${c}"`)
      .join(', ');

    const values = AWARD_COLUMNS.map(c => {
      let v = body[c] ?? '';
      if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
      return String(v).trim();
    });

    const query = `
      INSERT INTO award_2025 (${insertCols})
      VALUES (${valuePlaceholders})
      ON CONFLICT ("No") DO UPDATE SET
        ${updateSets}
      RETURNING *;
    `;

    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Data Award 2025 berhasil disimpan/diperbarui.',
      data: formatAwardRow(result.rows[0])
    });
  } catch (err) {
    console.error('[Award 2025] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 4. POST /push - Bulk Upsert dari Google Sheets / n8n (20 kolom murni)
router.post('/push', async (req, res) => {
  try {
    await ensureAward2025Table();
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data array kosong.' });
    }

    const insertCols = AWARD_COLUMNS.map(c => `"${c}"`).join(', ');
    const valuePlaceholders = AWARD_COLUMNS.map((_, i) => `$${i + 1}`).join(', ');
    const updateSets = AWARD_COLUMNS.filter(c => c !== 'No')
      .map(c => `"${c}" = EXCLUDED."${c}"`)
      .join(', ');

    const upsertQuery = `
      INSERT INTO award_2025 (${insertCols})
      VALUES (${valuePlaceholders})
      ON CONFLICT ("No") DO UPDATE SET
        ${updateSets};
    `;

    let inserted = 0;
    let errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') continue;

      const no = String(row["No"] ?? row.no ?? (i + 1)).trim();
      if (!no) continue;

      const values = AWARD_COLUMNS.map(c => {
        let v = row[c] ?? '';
        if (c === 'No') v = no;
        if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
        return String(v).trim();
      });

      try {
        await db.query(upsertQuery, values);
        inserted++;
      } catch (err) {
        errors.push({ index: i, no, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Berhasil sinkronisasi ${inserted} data Award 2025.`,
      count: inserted,
      errors: errors.slice(0, 5)
    });
  } catch (err) {
    console.error('[Award 2025] Push error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. PUT /:no - Update data satu baris award
router.put('/:no', async (req, res) => {
  const { no } = req.params;
  const body = req.body;

  try {
    await ensureAward2025Table();
    const check = await db.query('SELECT * FROM award_2025 WHERE "No" = $1', [no]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const ex = check.rows[0];
    const updateCols = AWARD_COLUMNS.filter(c => c !== 'No');
    const setClauses = updateCols.map((c, idx) => `"${c}" = $${idx + 1}`).join(', ');
    const values = updateCols.map(c => {
      let v = body[c] ?? ex[c] ?? '';
      if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
      return String(v).trim();
    });

    values.push(no);

    const updateQuery = `
      UPDATE award_2025 SET
        ${setClauses}
      WHERE "No" = $${values.length}
      RETURNING *;
    `;

    const result = await db.query(updateQuery, values);
    res.json({ success: true, message: 'Data berhasil diperbarui.', data: formatAwardRow(result.rows[0]) });
  } catch (err) {
    console.error('[Award 2025] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. DELETE /:no - Hapus satu data award
router.delete('/:no', async (req, res) => {
  const { no } = req.params;
  try {
    await ensureAward2025Table();
    const result = await db.query('DELETE FROM award_2025 WHERE "No" = $1 RETURNING *', [no]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data berhasil dihapus.', data: formatAwardRow(result.rows[0]) });
  } catch (err) {
    console.error('[Award 2025] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 7. DELETE /truncate - Kosongkan seluruh tabel award_2025
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE award_2025');
    res.json({ success: true, message: 'Seluruh isi tabel award_2025 berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

module.exports = router;
