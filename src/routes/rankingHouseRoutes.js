const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const fs = require('fs');
const path = require('path');

const PERIOD = '7/31/2026';
const FIRST_DATE_MONTH = '1 Jul 2026';
const LAST_DATE_MONTH = '31 Jul 2026';

// Helper to ensure table exists
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ranking_house (
      id SERIAL PRIMARY KEY,
      period VARCHAR(100) DEFAULT '${PERIOD}',
      first_date_month VARCHAR(100) DEFAULT '${FIRST_DATE_MONTH}',
      last_date_month VARCHAR(100) DEFAULT '${LAST_DATE_MONTH}',
      house VARCHAR(255) NOT NULL,
      total_gold_house INT DEFAULT 0,
      rank INT,
      class_name VARCHAR(255),
      cabang VARCHAR(255),
      program VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE ranking_house ADD COLUMN IF NOT EXISTS period VARCHAR(100) DEFAULT '${PERIOD}';
    ALTER TABLE ranking_house ADD COLUMN IF NOT EXISTS first_date_month VARCHAR(100) DEFAULT '${FIRST_DATE_MONTH}';
    ALTER TABLE ranking_house ADD COLUMN IF NOT EXISTS last_date_month VARCHAR(100) DEFAULT '${LAST_DATE_MONTH}';
  `).catch(() => null);
}

// GET / - List all house rankings
router.get('/', async (req, res) => {
  try {
    await ensureTable();

    const { house, cabang, program, period, search } = req.query;

    let query = `SELECT * FROM ranking_house`;
    const conditions = [];
    const params = [];

    if (period) {
      params.push(period);
      conditions.push(`period = $${params.length}`);
    }

    if (house) {
      params.push(house);
      conditions.push(`house = $${params.length}`);
    }

    if (cabang) {
      params.push(cabang);
      conditions.push(`cabang = $${params.length}`);
    }

    if (program) {
      params.push(program);
      conditions.push(`program = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(house ILIKE $${params.length} OR class_name ILIKE $${params.length} OR cabang ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY rank ASC, total_gold_house DESC, id ASC`;

    const result = await db.query(query, params);

    // Auto-seed if empty
    if (result.rows.length === 0 && conditions.length === 0) {
      let seedData = [];
      const p1 = path.join(__dirname, 'seed_ranking_house.json');
      const p2 = path.join(__dirname, '..', '..', 'scripts', 'seed_ranking_house.json');

      if (fs.existsSync(p1)) {
        seedData = JSON.parse(fs.readFileSync(p1, 'utf8'));
      } else if (fs.existsSync(p2)) {
        seedData = JSON.parse(fs.readFileSync(p2, 'utf8'));
      }

      if (Array.isArray(seedData) && seedData.length > 0) {
        for (const item of seedData) {
          await db.query(`
            INSERT INTO ranking_house (period, first_date_month, last_date_month, house, total_gold_house, rank, class_name, cabang, program)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
          `, [item.period || PERIOD, item.first_date_month || FIRST_DATE_MONTH, item.last_date_month || LAST_DATE_MONTH, item.house, item.total_gold_house, item.rank, item.class_name, item.cabang, item.program]);
        }
        const seeded = await db.query(`SELECT * FROM ranking_house ORDER BY rank ASC, total_gold_house DESC, id ASC`);
        return res.json({
          success: true,
          total: seeded.rows.length,
          period: PERIOD,
          first_date_month: FIRST_DATE_MONTH,
          last_date_month: LAST_DATE_MONTH,
          data: seeded.rows.map(row => ({
            ...row,
            periode: row.period,
            class: row.class_name,
            branch: row.cabang,
            total_gold: row.total_gold_house
          }))
        });
      }
    }

    // Response contains aliases for frontend compatibility
    const formattedData = result.rows.map(row => ({
      ...row,
      periode: row.period,
      class: row.class_name,
      branch: row.cabang,
      total_gold: row.total_gold_house
    }));

    res.json({
      success: true,
      total: formattedData.length,
      period: PERIOD,
      first_date_month: FIRST_DATE_MONTH,
      last_date_month: LAST_DATE_MONTH,
      data: formattedData
    });
  } catch (err) {
    console.error('[Ranking House] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST - Create new ranking_house record
router.post('/', async (req, res) => {
  const { period, first_date_month, last_date_month, house, house_name, total_gold_house, rank, class_name, class: className, cabang, branch, program } = req.body;
  const targetHouse = house || house_name;
  const targetClass = class_name || className;
  const targetCabang = cabang || branch;

  if (!targetHouse) {
    return res.status(400).json({ success: false, message: 'House name is required' });
  }

  try {
    await ensureTable();
    const result = await db.query(
      `INSERT INTO ranking_house (period, first_date_month, last_date_month, house, total_gold_house, rank, class_name, cabang, program)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [period || PERIOD, first_date_month || FIRST_DATE_MONTH, last_date_month || LAST_DATE_MONTH, targetHouse, total_gold_house || 0, rank || null, targetClass || '', targetCabang || '', program || '']
    );

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Ranking house entry created successfully',
      data: {
        ...row,
        periode: row.period,
        class: row.class_name,
        branch: row.cabang,
        total_gold: row.total_gold_house
      }
    });
  } catch (err) {
    console.error('[Ranking House] POST error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update ranking_house record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { period, first_date_month, last_date_month, house, house_name, total_gold_house, rank, class_name, class: className, cabang, branch, program } = req.body;

  try {
    await ensureTable();
    const check = await db.query('SELECT * FROM ranking_house WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data not found' });
    }

    const existing = check.rows[0];
    const updatedPeriod = period || existing.period;
    const updatedFirstDate = first_date_month || existing.first_date_month;
    const updatedLastDate = last_date_month || existing.last_date_month;
    const updatedHouse = house || house_name || existing.house;
    const updatedGold = total_gold_house !== undefined ? total_gold_house : existing.total_gold_house;
    const updatedRank = rank !== undefined ? rank : existing.rank;
    const updatedClass = class_name || className || existing.class_name;
    const updatedCabang = cabang || branch || existing.cabang;
    const updatedProgram = program || existing.program;

    const result = await db.query(
      `UPDATE ranking_house 
       SET period = $1, first_date_month = $2, last_date_month = $3, house = $4, total_gold_house = $5, rank = $6, class_name = $7, cabang = $8, program = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [updatedPeriod, updatedFirstDate, updatedLastDate, updatedHouse, updatedGold, updatedRank, updatedClass, updatedCabang, updatedProgram, id]
    );

    const row = result.rows[0];
    res.json({
      success: true,
      message: 'Ranking house entry updated successfully',
      data: {
        ...row,
        periode: row.period,
        class: row.class_name,
        branch: row.cabang,
        total_gold: row.total_gold_house
      }
    });
  } catch (err) {
    console.error('[Ranking House] PUT error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE - Delete ranking_house record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ensureTable();
    const result = await db.query('DELETE FROM ranking_house WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data not found' });
    }
    res.json({ success: true, message: 'Ranking house entry deleted successfully', data: result.rows[0] });
  } catch (err) {
    console.error('[Ranking House] DELETE error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
