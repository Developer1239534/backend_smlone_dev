const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const fs = require('fs');
const path = require('path');

// Helper: No-op after table drop
async function ensureTableAndSeed() {
  return;
}

// GET /api/report-trainee-data
router.get('/', async (req, res) => {
  try {
    const { trainee_id, name, search } = req.query;
    
    // Fallback to login_portal_fix
    let query = `SELECT id as trainee_id, name, level as latest_speaking_project, house as last_life_project FROM login_portal_fix`;
    const conditions = [];
    const params = [];

    if (trainee_id) {
      params.push(trainee_id);
      conditions.push(`id = $${params.length}`);
    }

    if (name || search) {
      params.push(`%${name || search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY name ASC LIMIT 100`;

    const result = await db.query(query, params).catch(() => ({ rows: [] }));

    res.json({
      success: true,
      data: result.rows.map(r => ({
        id: r.trainee_id,
        trainee_id: r.trainee_id,
        name: r.name,
        latest_speaking_project: r.latest_speaking_project || '—',
        speaking_project_to_next_level: '0%',
        last_speaker_date: null,
        last_life_project_date: null,
        last_life_project: r.last_life_project || '—'
      })),
      total: result.rows.length
    });
  } catch (err) {
    res.json({ success: true, data: [], total: 0 });
  }
});

// GET /api/report-trainee-data/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).trim();

    const result = await db.query(
      `SELECT id as trainee_id, name, level as latest_speaking_project, house as last_life_project FROM login_portal_fix WHERE id = $1`,
      [cleanId]
    ).catch(() => ({ rows: [] }));

    if (result.rows.length > 0) {
      const r = result.rows[0];
      return res.json({
        success: true,
        data: {
          id: r.trainee_id,
          trainee_id: r.trainee_id,
          name: r.name,
          latest_speaking_project: r.latest_speaking_project || '—',
          speaking_project_to_next_level: '0%',
          last_speaker_date: null,
          last_life_project_date: null,
          last_life_project: r.last_life_project || '—'
        }
      });
    }

    return res.json({
      success: true,
      data: {
        id: cleanId,
        trainee_id: cleanId,
        name: 'Trainee ' + cleanId,
        latest_speaking_project: '—',
        speaking_project_to_next_level: '0%',
        last_speaker_date: null,
        last_life_project_date: null,
        last_life_project: '—'
      }
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        trainee_id: req.params.id,
        name: 'Trainee ' + req.params.id,
        latest_speaking_project: '—',
        speaking_project_to_next_level: '0%',
        last_speaker_date: null,
        last_life_project_date: null,
        last_life_project: '—'
      }
    });
  }
});

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
