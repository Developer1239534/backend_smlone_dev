const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const fs = require('fs');
const path = require('path');

// Helper to ensure table exists
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ranking_house (
      id SERIAL PRIMARY KEY,
      house VARCHAR(255) NOT NULL,
      total_gold_house INT DEFAULT 0,
      rank INT,
      class_name VARCHAR(255),
      cabang VARCHAR(255),
      program VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => null);
}

// GET / - List all house rankings
router.get('/', async (req, res) => {
  try {
    await ensureTable();

    const { house, cabang, program, search } = req.query;

    let query = `SELECT * FROM ranking_house`;
    const conditions = [];
    const params = [];

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
            INSERT INTO ranking_house (house, total_gold_house, rank, class_name, cabang, program)
            VALUES ($1, $2, $3, $4, $5, $6);
          `, [item.house, item.total_gold_house, item.rank, item.class_name, item.cabang, item.program]);
        }
        const seeded = await db.query(`SELECT * FROM ranking_house ORDER BY rank ASC, total_gold_house DESC, id ASC`);
        return res.json({
          success: true,
          total: seeded.rows.length,
          data: seeded.rows
        });
      }
    }

    // Response contains both class_name and class for frontend compatibility
    const formattedData = result.rows.map(row => ({
      ...row,
      class: row.class_name,
      branch: row.cabang,
      total_gold: row.total_gold_house
    }));

    res.json({
      success: true,
      total: formattedData.length,
      data: formattedData
    });
  } catch (err) {
    console.error('[Ranking House] GET error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST - Create new ranking_house record
router.post('/', async (req, res) => {
  const { house, house_name, total_gold_house, rank, class_name, class: className, cabang, branch, program } = req.body;
  const targetHouse = house || house_name;
  const targetClass = class_name || className;
  const targetCabang = cabang || branch;

  if (!targetHouse) {
    return res.status(400).json({ success: false, message: 'House name is required' });
  }

  try {
    await ensureTable();
    const result = await db.query(
      `INSERT INTO ranking_house (house, total_gold_house, rank, class_name, cabang, program)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [targetHouse, total_gold_house || 0, rank || null, targetClass || '', targetCabang || '', program || '']
    );

    const row = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Ranking house entry created successfully',
      data: {
        ...row,
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
  const { house, house_name, total_gold_house, rank, class_name, class: className, cabang, branch, program } = req.body;

  try {
    await ensureTable();
    const check = await db.query('SELECT * FROM ranking_house WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data not found' });
    }

    const existing = check.rows[0];
    const updatedHouse = house || house_name || existing.house;
    const updatedGold = total_gold_house !== undefined ? total_gold_house : existing.total_gold_house;
    const updatedRank = rank !== undefined ? rank : existing.rank;
    const updatedClass = class_name || className || existing.class_name;
    const updatedCabang = cabang || branch || existing.cabang;
    const updatedProgram = program || existing.program;

    const result = await db.query(
      `UPDATE ranking_house 
       SET house = $1, total_gold_house = $2, rank = $3, class_name = $4, cabang = $5, program = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [updatedHouse, updatedGold, updatedRank, updatedClass, updatedCabang, updatedProgram, id]
    );

    const row = result.rows[0];
    res.json({
      success: true,
      message: 'Ranking house entry updated successfully',
      data: {
        ...row,
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
