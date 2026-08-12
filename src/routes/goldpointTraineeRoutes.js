const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/goldpoint-trainee - Fetch gold point trainee rankings from monthly_gold_point table
router.get('/', async (req, res) => {
  try {
    const { branch, category, search, limit = 1000, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM monthly_gold_point WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (branch && branch.toUpperCase() !== 'ALL' && branch.toUpperCase() !== 'ALL_BRANCH') {
      queryText += ` AND UPPER("Branch") = $${paramIndex++}`;
      queryParams.push(branch.toUpperCase());
    }

    if (category && category.toUpperCase() !== 'ALL') {
      queryText += ` AND UPPER("Junior/Youth") = $${paramIndex++}`;
      queryParams.push(category.toUpperCase());
    }

    if (search) {
      queryText += ` AND (LOWER("Nama Trainee") LIKE $${paramIndex} OR LOWER("ID") LIKE $${paramIndex})`;
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY CAST(COALESCE(NULLIF("Total Gold/Periode", ''), '0') AS INTEGER) DESC, "ID" ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(queryText, queryParams);

    // Format fields for frontend compatibility
    const formattedData = result.rows.map((row, idx) => ({
      id: row['ID'],
      ID: row['ID'],
      nama_trainee: row['Nama Trainee'],
      trainee_name: row['Nama Trainee'],
      'Nama Trainee': row['Nama Trainee'],
      status: row['Active/Expired'],
      'Active/Expired': row['Active/Expired'],
      level: row['Level'],
      Level: row['Level'],
      house: row['House'],
      house_sml: row['House'],
      House: row['House'],
      class: row['Class'],
      Class: row['Class'],
      branch: row['Branch'],
      cabang: row['Branch'],
      Branch: row['Branch'],
      total_gold_periode: row['Total Gold/Periode'],
      gp_month: row['Total Gold/Periode'],
      'Total Gold/Periode': row['Total Gold/Periode'],
      kategori: row['Junior/Youth'],
      junior_youth: row['Junior/Youth'],
      'Junior/Youth': row['Junior/Youth'],
      rank: row['RANK/ID'] || (parseInt(offset) + idx + 1),
      'RANK/ID': row['RANK/ID'] || (parseInt(offset) + idx + 1)
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

// GET /api/goldpoint-trainee/:id - Fetch single trainee
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM monthly_gold_point WHERE "ID" = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Goldpoint trainee not found' });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row['ID'],
        ID: row['ID'],
        nama_trainee: row['Nama Trainee'],
        trainee_name: row['Nama Trainee'],
        'Nama Trainee': row['Nama Trainee'],
        status: row['Active/Expired'],
        'Active/Expired': row['Active/Expired'],
        level: row['Level'],
        Level: row['Level'],
        house: row['House'],
        House: row['House'],
        class: row['Class'],
        Class: row['Class'],
        branch: row['Branch'],
        Branch: row['Branch'],
        total_gold_periode: row['Total Gold/Periode'],
        'Total Gold/Periode': row['Total Gold/Periode'],
        kategori: row['Junior/Youth'],
        'Junior/Youth': row['Junior/Youth'],
        rank: row['RANK/ID'],
        'RANK/ID': row['RANK/ID']
      }
    });
  } catch (err) {
    console.error('Error fetching single goldpoint_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
