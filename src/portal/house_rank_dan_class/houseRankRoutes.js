const express = require('express');
const router = express.Router();
const db = require('../../db/neonClient');

/**
 * ============================================================
 * ROUTE: House Rank Dan Class (/api/house-rank & /api/portal/house-rank)
 * HANYA 8 Kolom Resmi Sesuai Permintaan:
 * 1. HOUSE (Primary Key)
 * 2. TOTAL GOLD/HOUSE
 * 3. RANK
 * 4. CLASS
 * 5. CABANG
 * 6. PROGRAM
 * 7. RANK/CORE
 * 8. RANK/ORATOR
 * ============================================================
 */

// Helper to ensure house_rank table exists with strictly and only the 8 columns
async function ensureHouseRankTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS house_rank (
        "HOUSE"            VARCHAR(100) PRIMARY KEY,
        "TOTAL GOLD/HOUSE" VARCHAR(100),
        "RANK"             VARCHAR(50),
        "CLASS"            VARCHAR(100),
        "CABANG"           VARCHAR(100),
        "PROGRAM"          VARCHAR(100),
        "RANK/CORE"        VARCHAR(50),
        "RANK/ORATOR"      VARCHAR(50)
      );
    `);
  } catch (err) {
    console.error('[House Rank] Ensure table error:', err.message);
  }
}

// Format row untuk menghasilkan 8 kolom resmi dan alias kompatibilitas frontend
function formatHouseRankRow(row) {
  const house = row["HOUSE"] ?? '';
  const totalGold = row["TOTAL GOLD/HOUSE"] ?? '0';
  const rank = row["RANK"] ?? '1';
  const className = row["CLASS"] ?? '';
  const cabang = row["CABANG"] ?? '';
  const program = row["PROGRAM"] ?? '';
  const rankCore = row["RANK/CORE"] ?? '';
  const rankOrator = row["RANK/ORATOR"] ?? '';

  return {
    "HOUSE": house,
    "TOTAL GOLD/HOUSE": totalGold,
    "RANK": rank,
    "CLASS": className,
    "CABANG": cabang,
    "PROGRAM": program,
    "RANK/CORE": rankCore,
    "RANK/ORATOR": rankOrator,
    // Alias kompatibilitas frontend
    house: house,
    house_name: house,
    total_gold: parseInt(totalGold, 10) || 0,
    total_gold_house: parseInt(totalGold, 10) || 0,
    rank: parseInt(rank, 10) || 1,
    class: className,
    class_name: className,
    cabang: cabang,
    branch: cabang,
    program: program,
    rank_core: rankCore,
    rank_orator: rankOrator
  };
}

// 1. GET / - Ambil semua peringkat House murni dari database Neon
router.get('/', async (req, res) => {
  try {
    await ensureHouseRankTable();

    const { search, house, cabang, class_name } = req.query;
    let query = `
      SELECT 
        "HOUSE", 
        "TOTAL GOLD/HOUSE", 
        "RANK", 
        "CLASS", 
        "CABANG", 
        "PROGRAM", 
        "RANK/CORE", 
        "RANK/ORATOR"
      FROM house_rank
    `;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      const pIdx = `$${params.length}`;
      conditions.push(`("HOUSE" ILIKE ${pIdx} OR "CLASS" ILIKE ${pIdx} OR "CABANG" ILIKE ${pIdx})`);
    }

    if (house) {
      params.push(house.trim());
      conditions.push(`"HOUSE" ILIKE $${params.length}`);
    }

    if (cabang) {
      params.push(cabang.trim());
      conditions.push(`"CABANG" ILIKE $${params.length}`);
    }

    if (class_name) {
      params.push(class_name.trim());
      conditions.push(`"CLASS" ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY "TOTAL GOLD/HOUSE"::int DESC NULLS LAST';

    let result;
    try {
      result = await db.query(query, params);
    } catch (e) {
      result = await db.query('SELECT * FROM house_rank', []);
    }

    const formatted = result.rows.map(formatHouseRankRow);

    res.json({
      success: true,
      message: 'Berhasil mengambil data House Rank.',
      count: formatted.length,
      total: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('[House Rank] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 2. GET /:house - Ambil detail ranking satu House
router.get('/:house', async (req, res) => {
  const { house } = req.params;
  try {
    await ensureHouseRankTable();
    const result = await db.query(
      `SELECT 
        "HOUSE", "TOTAL GOLD/HOUSE", "RANK", "CLASS", "CABANG", "PROGRAM", "RANK/CORE", "RANK/ORATOR"
       FROM house_rank 
       WHERE "HOUSE" = $1 OR "HOUSE" ILIKE $1 
       LIMIT 1`,
      [house]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Data House Rank tidak ditemukan untuk House: ${house}` });
    }

    res.json({ success: true, data: formatHouseRankRow(result.rows[0]) });
  } catch (err) {
    console.error('[House Rank] GET by House error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. POST / - Tambah / Upsert data tunggal (8 kolom murni)
router.post('/', async (req, res) => {
  const b = req.body;
  const house = String(b["HOUSE"] ?? b.house ?? b.house_name ?? '').trim();
  const totalGold = String(b["TOTAL GOLD/HOUSE"] ?? b.total_gold_house ?? b.total_gold ?? '0').trim();
  const rank = String(b["RANK"] ?? b.rank ?? '1').trim();
  const className = String(b["CLASS"] ?? b.class ?? b.class_name ?? '').trim();
  const cabang = String(b["CABANG"] ?? b.cabang ?? b.branch ?? '').trim();
  const program = String(b["PROGRAM"] ?? b.program ?? '').trim();
  const rankCore = String(b["RANK/CORE"] ?? b.rank_core ?? '').trim();
  const rankOrator = String(b["RANK/ORATOR"] ?? b.rank_orator ?? '').trim();

  if (!house) {
    return res.status(400).json({ success: false, message: 'Kolom "HOUSE" wajib diisi.' });
  }

  try {
    await ensureHouseRankTable();
    const result = await db.query(
      `INSERT INTO house_rank (
        "HOUSE", "TOTAL GOLD/HOUSE", "RANK", "CLASS", "CABANG", "PROGRAM", "RANK/CORE", "RANK/ORATOR"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ("HOUSE") DO UPDATE SET
        "TOTAL GOLD/HOUSE" = EXCLUDED."TOTAL GOLD/HOUSE",
        "RANK"             = EXCLUDED."RANK",
        "CLASS"            = EXCLUDED."CLASS",
        "CABANG"           = EXCLUDED."CABANG",
        "PROGRAM"          = EXCLUDED."PROGRAM",
        "RANK/CORE"        = EXCLUDED."RANK/CORE",
        "RANK/ORATOR"      = EXCLUDED."RANK/ORATOR"
      RETURNING *`,
      [house, totalGold, rank, className, cabang, program, rankCore, rankOrator]
    );

    res.status(201).json({
      success: true,
      message: 'Data House Rank berhasil disimpan/diperbarui.',
      data: formatHouseRankRow(result.rows[0])
    });
  } catch (err) {
    console.error('[House Rank] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 4. POST /push - Bulk Upsert dari Google Sheets / n8n (8 kolom murni)
router.post('/push', async (req, res) => {
  try {
    await ensureHouseRankTable();
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data array kosong.' });
    }

    let inserted = 0;
    let errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') continue;

      const house = String(row["HOUSE"] ?? row.house ?? row.house_name ?? '').trim();
      if (!house) continue;

      const totalGold = String(row["TOTAL GOLD/HOUSE"] ?? row.total_gold_house ?? row.total_gold ?? '0').trim();
      const rank = String(row["RANK"] ?? row.rank ?? '1').trim();
      const className = String(row["CLASS"] ?? row.class ?? row.class_name ?? '').trim();
      const cabang = String(row["CABANG"] ?? row.cabang ?? row.branch ?? '').trim();
      const program = String(row["PROGRAM"] ?? row.program ?? '').trim();
      const rankCore = String(row["RANK/CORE"] ?? row.rank_core ?? '').trim();
      const rankOrator = String(row["RANK/ORATOR"] ?? row.rank_orator ?? '').trim();

      try {
        await db.query(`
          INSERT INTO house_rank (
            "HOUSE", "TOTAL GOLD/HOUSE", "RANK", "CLASS", "CABANG", "PROGRAM", "RANK/CORE", "RANK/ORATOR"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT ("HOUSE") DO UPDATE SET
            "TOTAL GOLD/HOUSE" = EXCLUDED."TOTAL GOLD/HOUSE",
            "RANK"             = EXCLUDED."RANK",
            "CLASS"            = EXCLUDED."CLASS",
            "CABANG"           = EXCLUDED."CABANG",
            "PROGRAM"          = EXCLUDED."PROGRAM",
            "RANK/CORE"        = EXCLUDED."RANK/CORE",
            "RANK/ORATOR"      = EXCLUDED."RANK/ORATOR";
        `, [house, totalGold, rank, className, cabang, program, rankCore, rankOrator]);
        inserted++;
      } catch (err) {
        errors.push({ index: i, house, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Berhasil sinkronisasi ${inserted} data House Rank.`,
      count: inserted,
      errors: errors.slice(0, 5)
    });
  } catch (err) {
    console.error('[House Rank] Push error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. PUT /:house - Update data satu house
router.put('/:house', async (req, res) => {
  const { house } = req.params;
  const b = req.body;

  try {
    await ensureHouseRankTable();
    const check = await db.query('SELECT * FROM house_rank WHERE "HOUSE" = $1', [house]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data House tidak ditemukan.' });
    }

    const ex = check.rows[0];
    const totalGold = b["TOTAL GOLD/HOUSE"] ?? b.total_gold_house ?? ex["TOTAL GOLD/HOUSE"];
    const rank = b["RANK"] ?? b.rank ?? ex["RANK"];
    const className = b["CLASS"] ?? b.class ?? ex["CLASS"];
    const cabang = b["CABANG"] ?? b.cabang ?? ex["CABANG"];
    const program = b["PROGRAM"] ?? b.program ?? ex["PROGRAM"];
    const rankCore = b["RANK/CORE"] ?? b.rank_core ?? ex["RANK/CORE"];
    const rankOrator = b["RANK/ORATOR"] ?? b.rank_orator ?? ex["RANK/ORATOR"];

    const result = await db.query(`
      UPDATE house_rank SET 
        "TOTAL GOLD/HOUSE" = $1,
        "RANK"             = $2,
        "CLASS"            = $3,
        "CABANG"           = $4,
        "PROGRAM"          = $5,
        "RANK/CORE"        = $6,
        "RANK/ORATOR"      = $7
      WHERE "HOUSE" = $8
      RETURNING *
    `, [totalGold, rank, className, cabang, program, rankCore, rankOrator, house]);

    res.json({ success: true, message: 'Berhasil diperbarui.', data: formatHouseRankRow(result.rows[0]) });
  } catch (err) {
    console.error('[House Rank] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. DELETE /:house - Hapus satu house rank record
router.delete('/:house', async (req, res) => {
  const { house } = req.params;
  try {
    await ensureHouseRankTable();
    const result = await db.query('DELETE FROM house_rank WHERE "HOUSE" = $1 RETURNING *', [house]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berhasil dihapus.', data: formatHouseRankRow(result.rows[0]) });
  } catch (err) {
    console.error('[House Rank] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 7. DELETE /truncate - Kosongkan seluruh tabel house_rank
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE house_rank');
    res.json({ success: true, message: 'Seluruh isi tabel house_rank berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

module.exports = router;
