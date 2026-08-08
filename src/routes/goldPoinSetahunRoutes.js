const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const fs = require('fs');
const path = require('path');

const PERIOD_START = '1 Jan 2026';
const PERIOD_END = '31 Aug 2026';

// Helper to ensure table exists & auto-seed if empty
async function ensureTableAndSeed() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS gold_poin_setahun (
      id SERIAL PRIMARY KEY,
      period_start VARCHAR(100) DEFAULT '${PERIOD_START}',
      period_end VARCHAR(100) DEFAULT '${PERIOD_END}',
      trainee_id VARCHAR(100) NOT NULL,
      student_name VARCHAR(255),
      date_string VARCHAR(100) NOT NULL,
      total_gold INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_gold_poin_setahun_trainee_id ON gold_poin_setahun(trainee_id);
    CREATE INDEX IF NOT EXISTS idx_gold_poin_setahun_date_string ON gold_poin_setahun(date_string);
  `).catch(() => null);

  const check = await db.query('SELECT COUNT(*) FROM gold_poin_setahun');
  const count = parseInt(check.rows[0].count, 10);

  if (count === 0) {
    console.log('⚡ gold_poin_setahun table is empty. Auto-seeding 8,887 records...');
    try {
      let seedRows = [];
      const p1 = path.join(__dirname, 'seed_gold_poin_setahun.json');
      const p2 = path.join(__dirname, '..', '..', 'scripts', 'seed_gold_poin_setahun.json');
      const p3 = path.join(__dirname, '..', 'db', 'seed_gold_poin_setahun.json');

      if (fs.existsSync(p1)) {
        seedRows = JSON.parse(fs.readFileSync(p1, 'utf8'));
      } else if (fs.existsSync(p2)) {
        seedRows = JSON.parse(fs.readFileSync(p2, 'utf8'));
      } else if (fs.existsSync(p3)) {
        seedRows = JSON.parse(fs.readFileSync(p3, 'utf8'));
      }

      if (Array.isArray(seedRows) && seedRows.length > 0) {
        // Fetch trainee name map
        const nameMap = {};
        try {
          const nameRes = await db.query('SELECT trainee_id, name FROM profile_trainee UNION SELECT id as trainee_id, name FROM login_portalllll');
          nameRes.rows.forEach(r => {
            if (r.trainee_id && r.name) nameMap[r.trainee_id.trim()] = r.name.trim();
          });
        } catch (e) {
          console.log('Name map fetch warning:', e.message);
        }

        const BATCH_SIZE = 500;
        for (let i = 0; i < seedRows.length; i += BATCH_SIZE) {
          const chunk = seedRows.slice(i, i + BATCH_SIZE);
          const placeholders = [];
          const values = [];
          let idx = 1;

          chunk.forEach(r => {
            const studentName = nameMap[r.trainee_id] || r.student_name || r.trainee_id;
            placeholders.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5})`);
            values.push(PERIOD_START, PERIOD_END, r.trainee_id, studentName, r.date_string, r.total_gold || 0);
            idx += 6;
          });

          await db.query(`
            INSERT INTO gold_poin_setahun (period_start, period_end, trainee_id, student_name, date_string, total_gold)
            VALUES ${placeholders.join(',\n')};
          `, values);
        }
        console.log(`✅ Auto-seeded ${seedRows.length} rows into gold_poin_setahun.`);
      }
    } catch (seedErr) {
      console.error('❌ Auto-seed failed:', seedErr.message);
    }
  }
}

// GET /api/gold-poin-setahun - List yearly gold points
router.get('/', async (req, res) => {
  try {
    await ensureTableAndSeed();

    const { trainee_id, student_name, date_string, search, all, aggregate, page = 1, limit = 100 } = req.query;

    // Check if aggregation per trainee is requested
    if (aggregate === 'true' || aggregate === '1') {
      let aggQuery = `
        SELECT 
          trainee_id,
          MAX(student_name) as student_name,
          '${PERIOD_START}' as period_start,
          '${PERIOD_END}' as period_end,
          SUM(total_gold) as total_gold,
          COUNT(*) as total_entries
        FROM gold_poin_setahun
      `;
      const aggConditions = [];
      const aggParams = [];

      if (trainee_id) {
        aggParams.push(trainee_id);
        aggConditions.push(`trainee_id = $${aggParams.length}`);
      }

      if (search) {
        aggParams.push(`%${search}%`);
        aggConditions.push(`(trainee_id ILIKE $${aggParams.length} OR student_name ILIKE $${aggParams.length})`);
      }

      if (aggConditions.length > 0) {
        aggQuery += ` WHERE ` + aggConditions.join(' AND ');
      }

      aggQuery += ` GROUP BY trainee_id ORDER BY (CASE WHEN SUM(total_gold) = 0 THEN 1 ELSE 0 END) ASC, total_gold DESC, trainee_id ASC`;

      const aggResult = await db.query(aggQuery, aggParams);
      return res.json({
        success: true,
        period_start: PERIOD_START,
        period_end: PERIOD_END,
        total_trainees: aggResult.rows.length,
        data: aggResult.rows.map(r => ({
          ...r,
          total_gold: parseInt(r.total_gold, 10)
        }))
      });
    }

    let query = `SELECT * FROM gold_poin_setahun`;
    const conditions = [];
    const params = [];

    if (trainee_id) {
      params.push(trainee_id);
      conditions.push(`trainee_id = $${params.length}`);
    }

    if (student_name) {
      params.push(`%${student_name}%`);
      conditions.push(`student_name ILIKE $${params.length}`);
    }

    if (date_string) {
      params.push(date_string);
      conditions.push(`date_string = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(trainee_id ILIKE $${params.length} OR student_name ILIKE $${params.length} OR date_string ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY (CASE WHEN total_gold = 0 THEN 1 ELSE 0 END) ASC, total_gold DESC, id ASC`;

    let countQuery = `SELECT COUNT(*) FROM gold_poin_setahun` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : '');
    const countRes = await db.query(countQuery, params);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    if (all === 'true' || all === '1') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        total: totalItems,
        period_start: PERIOD_START,
        period_end: PERIOD_END,
        data: result.rows
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const offset = (pageNum - 1) * limitNum;

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      total: totalItems,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalItems / limitNum),
      period_start: PERIOD_START,
      period_end: PERIOD_END,
      data: result.rows
    });
  } catch (err) {
    console.error('[Gold Poin Setahun] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST - Add entry
router.post('/', async (req, res) => {
  const { trainee_id, student_name, date_string, total_gold, period_start, period_end } = req.body;

  if (!trainee_id || !date_string) {
    return res.status(400).json({ success: false, message: 'trainee_id dan date_string wajib diisi.' });
  }

  try {
    await ensureTableAndSeed();
    const result = await db.query(
      `INSERT INTO gold_poin_setahun (period_start, period_end, trainee_id, student_name, date_string, total_gold)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [period_start || PERIOD_START, period_end || PERIOD_END, trainee_id, student_name || trainee_id, date_string, total_gold || 0]
    );

    res.status(201).json({ success: true, message: 'Berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error('[Gold Poin Setahun] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update entry
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { trainee_id, student_name, date_string, total_gold, period_start, period_end } = req.body;

  try {
    await ensureTableAndSeed();
    const check = await db.query('SELECT * FROM gold_poin_setahun WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const existing = check.rows[0];
    const result = await db.query(
      `UPDATE gold_poin_setahun 
       SET period_start = $1, period_end = $2, trainee_id = $3, student_name = $4, date_string = $5, total_gold = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [
        period_start || existing.period_start,
        period_end || existing.period_end,
        trainee_id || existing.trainee_id,
        student_name || existing.student_name,
        date_string || existing.date_string,
        total_gold !== undefined ? total_gold : existing.total_gold,
        id
      ]
    );

    res.json({ success: true, message: 'Berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[Gold Poin Setahun] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE - Delete entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureTableAndSeed();
    const result = await db.query('DELETE FROM gold_poin_setahun WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[Gold Poin Setahun] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
