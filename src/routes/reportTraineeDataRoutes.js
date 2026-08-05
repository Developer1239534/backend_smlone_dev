const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const fs = require('fs');
const path = require('path');

// Helper to ensure table exists and auto-seed if empty
async function ensureTableAndSeed() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS report_trainee_data (
      id SERIAL PRIMARY KEY,
      trainee_id VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      latest_speaking_project VARCHAR(255),
      speaking_project_to_next_level VARCHAR(50),
      last_speaker_date VARCHAR(100),
      last_life_project_date VARCHAR(100),
      last_life_project TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_report_trainee_data_trainee_id ON report_trainee_data(trainee_id);
    CREATE INDEX IF NOT EXISTS idx_report_trainee_data_name ON report_trainee_data(name);
  `).catch(() => null);

  const check = await db.query('SELECT COUNT(*) FROM report_trainee_data');
  const count = parseInt(check.rows[0].count, 10);

  if (count === 0) {
    console.log('⚡ report_trainee_data is empty. Auto-seeding 1,236 records...');
    try {
      let seedRows = [];
      const p1 = path.join(__dirname, 'seed_report_trainee_data.json');
      const p2 = path.join(__dirname, '..', '..', 'scripts', 'seed_report_trainee_data.json');
      const p3 = path.join(__dirname, '..', 'db', 'seed_report_trainee_data.json');

      if (fs.existsSync(p1)) seedRows = JSON.parse(fs.readFileSync(p1, 'utf8'));
      else if (fs.existsSync(p2)) seedRows = JSON.parse(fs.readFileSync(p2, 'utf8'));
      else if (fs.existsSync(p3)) seedRows = JSON.parse(fs.readFileSync(p3, 'utf8'));

      if (Array.isArray(seedRows) && seedRows.length > 0) {
        const BATCH_SIZE = 200;
        for (let i = 0; i < seedRows.length; i += BATCH_SIZE) {
          const chunk = seedRows.slice(i, i + BATCH_SIZE);
          const placeholders = [];
          const values = [];
          let idx = 1;

          chunk.forEach(r => {
            placeholders.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6})`);
            values.push(
              r.trainee_id,
              r.name,
              r.latest_speaking_project || null,
              r.speaking_project_to_next_level || null,
              r.last_speaker_date || null,
              r.last_life_project_date || null,
              r.last_life_project || null
            );
            idx += 7;
          });

          await db.query(`
            INSERT INTO report_trainee_data (
              trainee_id, name, latest_speaking_project, speaking_project_to_next_level, last_speaker_date, last_life_project_date, last_life_project
            )
            VALUES ${placeholders.join(',\n')}
            ON CONFLICT (trainee_id) DO UPDATE SET
              name = EXCLUDED.name,
              latest_speaking_project = EXCLUDED.latest_speaking_project,
              speaking_project_to_next_level = EXCLUDED.speaking_project_to_next_level,
              last_speaker_date = EXCLUDED.last_speaker_date,
              last_life_project_date = EXCLUDED.last_life_project_date,
              last_life_project = EXCLUDED.last_life_project,
              updated_at = NOW();
          `, values);
        }
        console.log(`✅ Auto-seeded ${seedRows.length} rows into report_trainee_data.`);
      }
    } catch (err) {
      console.error('❌ Auto-seed failed:', err.message);
    }
  }
}

// GET /api/report-trainee-data
router.get('/', async (req, res) => {
  try {
    await ensureTableAndSeed();

    const { trainee_id, name, search, all, page = 1, limit = 100 } = req.query;

    let query = `SELECT * FROM report_trainee_data`;
    const conditions = [];
    const params = [];

    if (trainee_id) {
      params.push(trainee_id);
      conditions.push(`trainee_id = $${params.length}`);
    }

    if (name) {
      params.push(`%${name}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(
        trainee_id ILIKE $${params.length} OR 
        name ILIKE $${params.length} OR 
        latest_speaking_project ILIKE $${params.length} OR 
        last_life_project ILIKE $${params.length}
      )`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY id ASC`;

    const countQuery = `SELECT COUNT(*) FROM report_trainee_data` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : '');
    const countRes = await db.query(countQuery, params);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    if (all === 'true' || all === '1') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        total: totalItems,
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
      data: result.rows
    });
  } catch (err) {
    console.error('[report_trainee_data] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/report-trainee-data/:trainee_id
router.get('/:trainee_id', async (req, res) => {
  const { trainee_id } = req.params;
  try {
    await ensureTableAndSeed();
    const result = await db.query('SELECT * FROM report_trainee_data WHERE trainee_id = $1 OR id::text = $1', [trainee_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[report_trainee_data] GET BY ID error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/report-trainee-data - Add entry
router.post('/', async (req, res) => {
  const {
    trainee_id,
    name,
    latest_speaking_project,
    speaking_project_to_next_level,
    last_speaker_date,
    last_life_project_date,
    last_life_project
  } = req.body;

  if (!trainee_id || !name) {
    return res.status(400).json({ success: false, message: 'trainee_id dan name wajib diisi.' });
  }

  try {
    await ensureTableAndSeed();
    const result = await db.query(
      `INSERT INTO report_trainee_data (
        trainee_id, name, latest_speaking_project, speaking_project_to_next_level, last_speaker_date, last_life_project_date, last_life_project
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (trainee_id) DO UPDATE SET
        name = EXCLUDED.name,
        latest_speaking_project = EXCLUDED.latest_speaking_project,
        speaking_project_to_next_level = EXCLUDED.speaking_project_to_next_level,
        last_speaker_date = EXCLUDED.last_speaker_date,
        last_life_project_date = EXCLUDED.last_life_project_date,
        last_life_project = EXCLUDED.last_life_project,
        updated_at = NOW()
       RETURNING *`,
      [
        trainee_id,
        name,
        latest_speaking_project || null,
        speaking_project_to_next_level || '0%',
        last_speaker_date || null,
        last_life_project_date || null,
        last_life_project || null
      ]
    );

    res.status(201).json({ success: true, message: 'Berhasil ditambahkan/diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[report_trainee_data] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/report-trainee-data/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    trainee_id,
    name,
    latest_speaking_project,
    speaking_project_to_next_level,
    last_speaker_date,
    last_life_project_date,
    last_life_project
  } = req.body;

  try {
    await ensureTableAndSeed();
    const check = await db.query('SELECT * FROM report_trainee_data WHERE id = $1 OR trainee_id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }

    const existing = check.rows[0];
    const result = await db.query(
      `UPDATE report_trainee_data 
       SET trainee_id = $1, name = $2, latest_speaking_project = $3, speaking_project_to_next_level = $4,
           last_speaker_date = $5, last_life_project_date = $6, last_life_project = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [
        trainee_id || existing.trainee_id,
        name || existing.name,
        latest_speaking_project !== undefined ? latest_speaking_project : existing.latest_speaking_project,
        speaking_project_to_next_level !== undefined ? speaking_project_to_next_level : existing.speaking_project_to_next_level,
        last_speaker_date !== undefined ? last_speaker_date : existing.last_speaker_date,
        last_life_project_date !== undefined ? last_life_project_date : existing.last_life_project_date,
        last_life_project !== undefined ? last_life_project : existing.last_life_project,
        existing.id
      ]
    );

    res.json({ success: true, message: 'Berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[report_trainee_data] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/report-trainee-data/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureTableAndSeed();
    const result = await db.query('DELETE FROM report_trainee_data WHERE id = $1 OR trainee_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[report_trainee_data] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
