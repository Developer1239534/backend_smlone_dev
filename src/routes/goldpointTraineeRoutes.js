const express = require('express');
const router = express.Router();
const { pool } = require('../db/neonClient');

// GET /api/goldpoint-trainee - Fetch gold point trainee rankings
router.get('/', async (req, res) => {
  try {
    const { branch, category, search, limit = 500, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM goldpoint_trainee WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (branch && branch.toUpperCase() !== 'ALL' && branch.toUpperCase() !== 'ALL_BRANCH') {
      queryText += ` AND UPPER(branch) = $${paramIndex++}`;
      queryParams.push(branch.toUpperCase());
    }

    if (category && category.toUpperCase() !== 'ALL') {
      queryText += ` AND UPPER(kategori) = $${paramIndex++}`;
      queryParams.push(category.toUpperCase());
    }

    if (search) {
      queryText += ` AND (LOWER(nama_trainee) LIKE $${paramIndex} OR LOWER(id) LIKE $${paramIndex})`;
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY total_gold_periode DESC, id ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(queryText, queryParams);

    // Calculate ranks dynamically
    const formattedData = result.rows.map((row, idx) => ({
      ...row,
      rank: parseInt(offset) + idx + 1,
      trainee_name: row.nama_trainee,
      house_sml: row.house,
      cabang: row.branch,
      junior_youth: row.kategori,
      gp_month: row.total_gold_periode
    }));

    res.json({
      success: true,
      total: formattedData.length,
      data: formattedData
    });
  } catch (err) {
    console.error('Error fetching goldpoint_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/goldpoint-trainee/:id - Fetch single trainee gold points
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM goldpoint_trainee WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Goldpoint trainee not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching single goldpoint_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/goldpoint-trainee - Insert / Upsert Goldpoint Trainee (n8n Webhook / Admin Sync)
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
      const status = item.status || 'Active';
      const level = item.level || 'Sergeant';
      const house = item.house || item.house_sml || 'House of Thenova';
      const className = item.class || item.nama_kelas || 'Gladwell';
      const branch = item.branch || item.cabang || 'TIMOR';
      const totalGold = parseInt(item.total_gold || item.total_gold_periode || item.gp_month || '0') || 0;
      const kategori = item.kategori || item.junior_youth || 'Junior';
      
      let rank = parseInt(item.rank || '0') || (idx + 1);

      if (!id || !name || id === 'ID' || id === '2' || id === '5' || id === '6') continue;

      const queryText = `
        INSERT INTO goldpoint_trainee 
          (id, nama_trainee, status, level, house, class, branch, total_gold_periode, gp_month, kategori, rank, updated_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (id) 
        DO UPDATE SET
          nama_trainee = EXCLUDED.nama_trainee,
          status = EXCLUDED.status,
          level = EXCLUDED.level,
          house = EXCLUDED.house,
          class = EXCLUDED.class,
          branch = EXCLUDED.branch,
          total_gold_periode = EXCLUDED.total_gold_periode,
          gp_month = EXCLUDED.gp_month,
          kategori = EXCLUDED.kategori,
          rank = EXCLUDED.rank,
          updated_at = NOW()
        RETURNING *;
      `;

      const result = await pool.query(queryText, [id, name, status, level, house, className, branch, totalGold, totalGold, kategori, rank]);

      // Connect & Sync with portal_trainee table
      await pool.query(`
        UPDATE portal_trainee 
        SET name = $2, house = $3, class = $4, branch_id = $5
        WHERE trainee_id = $1 OR id = $1
      `, [id, name, house, className, branch]).catch(() => null);

      updatedRecords.push(result.rows[0]);
    }

    // Auto-fix any 0 or null ranks in database
    await pool.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY kategori, branch 
          ORDER BY total_gold_periode DESC, nama_trainee ASC
        ) AS calculated_rank
        FROM goldpoint_trainee
      )
      UPDATE goldpoint_trainee g
      SET rank = r.calculated_rank
      FROM ranked r
      WHERE g.id = r.id AND (g.rank IS NULL OR g.rank = 0);
    `).catch(() => null);

    res.json({
      success: true,
      count: updatedRecords.length,
      data: updatedRecords
    });
  } catch (err) {
    console.error('Error upserting goldpoint_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
