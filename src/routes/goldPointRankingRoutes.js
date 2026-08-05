const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/gold-point-ranking - List with filter, search, pagination
router.get('/', async (req, res) => {
  try {
    const { period, branch, program, trainee_id, search, page = 1, limit = 100 } = req.query;

    let query = `SELECT * FROM gold_point_ranking`;
    const conditions = [];
    const params = [];

    if (period) {
      params.push(period);
      conditions.push(`period = $${params.length}`);
    }

    if (branch) {
      params.push(branch);
      conditions.push(`branch = $${params.length}`);
    }

    if (program) {
      params.push(program);
      conditions.push(`program = $${params.length}`);
    }

    if (trainee_id) {
      params.push(trainee_id);
      conditions.push(`trainee_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(trainee_id ILIKE $${params.length} OR trainee_name ILIKE $${params.length} OR class_name ILIKE $${params.length} OR house ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY ranking ASC, total_gold DESC, id ASC`;

    const countResult = await db.query(`SELECT COUNT(*) FROM gold_point_ranking` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ''), params);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    if (req.query.all === 'true' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        data: result.rows,
        total: totalItems
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const offset = (pageNum - 1) * limitNum;

    params.push(limitNum);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[GoldPointRanking] GET Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data gold_point_ranking',
      error: error.message
    });
  }
});

// GET /api/gold-point-ranking/:id - Single item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM gold_point_ranking WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data ranking dengan ID ${id} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[GoldPointRanking] GET Single Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail data gold_point_ranking',
      error: error.message
    });
  }
});

// POST /api/gold-point-ranking - Create single entry
router.post('/', async (req, res) => {
  try {
    const {
      period,
      trainee_id,
      trainee_name,
      membership_status,
      level,
      house,
      class_name,
      branch,
      program,
      total_gold,
      ranking
    } = req.body;

    const result = await db.query(`
      INSERT INTO gold_point_ranking (
        period, trainee_id, trainee_name, membership_status, level, house,
        class_name, branch, program, total_gold, ranking, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `, [
      period || null,
      trainee_id || null,
      trainee_name || null,
      membership_status || null,
      level || null,
      house || null,
      class_name || null,
      branch || null,
      program || null,
      total_gold ? parseInt(total_gold, 10) : 0,
      ranking ? parseInt(ranking, 10) : null
    ]);

    res.status(201).json({
      success: true,
      message: 'Data gold_point_ranking berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[GoldPointRanking] POST Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data gold_point_ranking',
      error: error.message
    });
  }
});

// POST /api/gold-point-ranking/bulk - Bulk insert/upsert array of records
router.post('/bulk', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Body harus berupa object dengan array "records"'
      });
    }

    const insertedRows = [];
    for (const r of records) {
      const result = await db.query(`
        INSERT INTO gold_point_ranking (
          period, trainee_id, trainee_name, membership_status, level, house,
          class_name, branch, program, total_gold, ranking, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
      `, [
        r.period || null,
        r.trainee_id || null,
        r.trainee_name || null,
        r.membership_status || null,
        r.level || null,
        r.house || null,
        r.class_name || null,
        r.branch || null,
        r.program || null,
        r.total_gold ? parseInt(r.total_gold, 10) : 0,
        r.ranking ? parseInt(r.ranking, 10) : null
      ]);
      insertedRows.push(result.rows[0]);
    }

    res.status(201).json({
      success: true,
      message: `Berhasil menambahkan ${insertedRows.length} data gold_point_ranking`,
      totalInserted: insertedRows.length,
      data: insertedRows
    });
  } catch (error) {
    console.error('[GoldPointRanking] Bulk POST Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses bulk insert gold_point_ranking',
      error: error.message
    });
  }
});

// PUT /api/gold-point-ranking/:id - Update entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      period,
      trainee_id,
      trainee_name,
      membership_status,
      level,
      house,
      class_name,
      branch,
      program,
      total_gold,
      ranking
    } = req.body;

    const result = await db.query(`
      UPDATE gold_point_ranking
      SET
        period = COALESCE($1, period),
        trainee_id = COALESCE($2, trainee_id),
        trainee_name = COALESCE($3, trainee_name),
        membership_status = COALESCE($4, membership_status),
        level = COALESCE($5, level),
        house = COALESCE($6, house),
        class_name = COALESCE($7, class_name),
        branch = COALESCE($8, branch),
        program = COALESCE($9, program),
        total_gold = COALESCE($10, total_gold),
        ranking = COALESCE($11, ranking),
        updated_at = NOW()
      WHERE id = $12
      RETURNING *
    `, [
      period,
      trainee_id,
      trainee_name,
      membership_status,
      level,
      house,
      class_name,
      branch,
      program,
      total_gold !== undefined ? parseInt(total_gold, 10) : null,
      ranking !== undefined ? parseInt(ranking, 10) : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data gold_point_ranking dengan ID ${id} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      message: 'Data gold_point_ranking berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[GoldPointRanking] PUT Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data gold_point_ranking',
      error: error.message
    });
  }
});

// DELETE /api/gold-point-ranking/:id - Delete single entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM gold_point_ranking WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data gold_point_ranking dengan ID ${id} tidak ditemukan`
      });
    }

    res.json({
      success: true,
      message: 'Data gold_point_ranking berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[GoldPointRanking] DELETE Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data gold_point_ranking',
      error: error.message
    });
  }
});

// DELETE /api/gold-point-ranking - Truncate table
router.delete('/', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE gold_point_ranking RESTART IDENTITY');
    res.json({
      success: true,
      message: 'Seluruh data gold_point_ranking berhasil dibersihkan'
    });
  } catch (error) {
    console.error('[GoldPointRanking] TRUNCATE Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membersihkan tabel gold_point_ranking',
      error: error.message
    });
  }
});

module.exports = router;
