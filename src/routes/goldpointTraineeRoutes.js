const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/goldpoint-trainee - Fetch gold point rankings directly from portal_trainee
router.get('/', async (req, res) => {
  try {
    const { branch, category, search, limit = 500, offset = 0 } = req.query;

    let queryText = `
      SELECT 
        trainee_id AS id,
        name AS nama_trainee,
        name AS trainee_name,
        COALESCE(program, 'Junior/Youth Program') AS status,
        COALESCE(level, 'Sergeant') AS level,
        COALESCE(house, 'House of Thenova') AS house,
        COALESCE(class, 'Gladwell') AS class,
        COALESCE(branch_id, 'TIMOR') AS branch,
        COALESCE(branch_id, 'TIMOR') AS cabang,
        COALESCE(total_gold, 0) AS total_gold_periode,
        COALESCE(gp_month, total_gold, 0) AS gp_month,
        COALESCE(total_gold, 0) AS total_gold,
        COALESCE(kategori, 'Junior') AS kategori,
        COALESCE(kategori, 'Junior') AS junior_youth,
        COALESCE(rank, 0) AS rank,
        updated_at
      FROM portal_trainee
      WHERE total_gold > 0 OR gp_month > 0
    `;
    const queryParams = [];
    let paramIndex = 1;

    if (branch && branch.toUpperCase() !== 'ALL' && branch.toUpperCase() !== 'ALL_BRANCH') {
      queryText += ` AND UPPER(branch_id) = $${paramIndex++}`;
      queryParams.push(branch.toUpperCase());
    }

    if (category && category.toUpperCase() !== 'ALL') {
      queryText += ` AND UPPER(kategori) = $${paramIndex++}`;
      queryParams.push(category.toUpperCase());
    }

    if (search) {
      queryText += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(trainee_id) LIKE $${paramIndex})`;
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY total_gold DESC, name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(queryText, queryParams);

    // Calculate dynamic ranks
    const formattedData = result.rows.map((row, idx) => ({
      ...row,
      rank: row.rank > 0 ? row.rank : (parseInt(offset) + idx + 1)
    }));

    res.json({
      success: true,
      total: formattedData.length,
      data: formattedData
    });
  } catch (err) {
    console.error('Error fetching goldpoint data from portal_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/goldpoint-trainee/:id - Fetch single trainee gold points from portal_trainee
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        trainee_id AS id,
        name AS nama_trainee,
        name AS trainee_name,
        COALESCE(level, 'Sergeant') AS level,
        COALESCE(house, 'House of Thenova') AS house,
        COALESCE(class, 'Gladwell') AS class,
        COALESCE(branch_id, 'TIMOR') AS branch,
        COALESCE(branch_id, 'TIMOR') AS cabang,
        COALESCE(total_gold, 0) AS total_gold_periode,
        COALESCE(gp_month, total_gold, 0) AS gp_month,
        COALESCE(total_gold, 0) AS total_gold,
        COALESCE(kategori, 'Junior') AS kategori,
        COALESCE(kategori, 'Junior') AS junior_youth,
        COALESCE(rank, 0) AS rank,
        updated_at
      FROM portal_trainee 
      WHERE trainee_id = $1 OR id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Goldpoint trainee not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching single goldpoint trainee from portal_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/goldpoint-trainee - Bulk update Gold Points directly into portal_trainee
router.post('/', async (req, res) => {
  try {
    let itemsToProcess = [];
    if (Array.isArray(req.body)) {
      itemsToProcess = req.body;
    } else if (req.body && Array.isArray(req.body.daftar_siswa)) {
      itemsToProcess = req.body.daftar_siswa;
    } else if (req.body) {
      itemsToProcess = [req.body];
    }

    const updatedRecords = [];

    for (let idx = 0; idx < itemsToProcess.length; idx++) {
      const item = itemsToProcess[idx];
      const id = String(item.id || item.trainee_id || '').trim();
      const name = String(item.nama_trainee || item.name || item.trainee_name || '').trim();
      const level = item.level || 'Sergeant';
      const house = item.house || item.house_sml || 'House of Thenova';
      const className = item.class || item.nama_kelas || 'Gladwell';
      const branch = item.branch || item.cabang || 'TIMOR';
      const totalGold = parseInt(item.total_gold || item.total_gold_periode || item.gp_month || '0') || 0;
      const kategori = item.kategori || item.junior_youth || 'Junior';
      let rank = parseInt(item.rank || '0') || (idx + 1);

      if (!id || id === 'ID') continue;

      const result = await db.query(`
        UPDATE portal_trainee 
        SET 
          total_gold = $2,
          gp_month = $3,
          rank = $4,
          kategori = $5,
          level = COALESCE($6, level),
          house = COALESCE($7, house),
          class = COALESCE($8, class),
          branch_id = COALESCE($9, branch_id),
          updated_at = NOW()
        WHERE trainee_id = $1 OR id = $1
        RETURNING *;
      `, [id, totalGold, totalGold, rank, kategori, level, house, className, branch]);

      if (result.rows.length > 0) {
        updatedRecords.push(result.rows[0]);
      }
    }

    res.json({
      success: true,
      count: updatedRecords.length,
      data: updatedRecords
    });
  } catch (err) {
    console.error('Error updating gold points in portal_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
