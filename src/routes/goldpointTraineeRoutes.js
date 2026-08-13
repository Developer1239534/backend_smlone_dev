const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/goldpoint-trainee - Fetch gold point trainee rankings from monthly_gold_point table with exact deduplication
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

    const result = await db.query(queryText, queryParams);

    // Deduplicate by ID and sort strictly by Total Gold (descending)
    const uniqueMap = new Map();
    for (const row of result.rows) {
      const id = row['ID'];
      if (!id) continue;

      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, row);
      } else {
        // Keep row with higher gold if duplicate ID
        const existingGold = parseInt(uniqueMap.get(id)['Total Gold/Periode'] || '0', 10);
        const currentGold = parseInt(row['Total Gold/Periode'] || '0', 10);
        if (currentGold > existingGold) {
          uniqueMap.set(id, row);
        }
      }
    }

    // Convert map values to array and sort descending by GP
    const sortedRows = Array.from(uniqueMap.values()).sort((a, b) => {
      const goldA = parseInt(a['Total Gold/Periode'] || '0', 10);
      const goldB = parseInt(b['Total Gold/Periode'] || '0', 10);
      return goldB - goldA;
    });

    // Apply pagination slice
    const paginatedRows = sortedRows.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Format fields for full frontend compatibility
    const formattedData = paginatedRows.map((row, idx) => ({
      id: row['ID'],
      ID: row['ID'],
      trainee_id: row['ID'],
      nama_trainee: row['Nama Trainee'],
      trainee_name: row['Nama Trainee'],
      'Nama Trainee': row['Nama Trainee'],
      status: row['Active/Expired'],
      membership_status: row['Active/Expired'],
      'Active/Expired': row['Active/Expired'],
      level: row['Level'],
      Level: row['Level'],
      house: row['House'],
      house_sml: row['House'],
      House: row['House'],
      class: row['Class'],
      class_name: row['Class'],
      Class: row['Class'],
      branch: row['Branch'],
      cabang: row['Branch'],
      Branch: row['Branch'],
      total_gold: parseInt(row['Total Gold/Periode'] || '0', 10),
      total_gold_periode: parseInt(row['Total Gold/Periode'] || '0', 10),
      gp_month: parseInt(row['Total Gold/Periode'] || '0', 10),
      'Total Gold/Periode': row['Total Gold/Periode'],
      kategori: row['Junior/Youth'],
      junior_youth: row['Junior/Youth'],
      program: row['Junior/Youth'],
      'Junior/Youth': row['Junior/Youth'],
      rank: parseInt(offset) + idx + 1,
      ranking: parseInt(offset) + idx + 1,
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
        trainee_id: row['ID'],
        nama_trainee: row['Nama Trainee'],
        trainee_name: row['Nama Trainee'],
        'Nama Trainee': row['Nama Trainee'],
        status: row['Active/Expired'],
        membership_status: row['Active/Expired'],
        'Active/Expired': row['Active/Expired'],
        level: row['Level'],
        Level: row['Level'],
        house: row['House'],
        House: row['House'],
        class: row['Class'],
        class_name: row['Class'],
        Class: row['Class'],
        branch: row['Branch'],
        Branch: row['Branch'],
        total_gold: parseInt(row['Total Gold/Periode'] || '0', 10),
        total_gold_periode: parseInt(row['Total Gold/Periode'] || '0', 10),
        gp_month: parseInt(row['Total Gold/Periode'] || '0', 10),
        'Total Gold/Periode': row['Total Gold/Periode'],
        kategori: row['Junior/Youth'],
        junior_youth: row['Junior/Youth'],
        program: row['Junior/Youth'],
        'Junior/Youth': row['Junior/Youth'],
        rank: row['RANK/ID'],
        ranking: row['RANK/ID'],
        'RANK/ID': row['RANK/ID']
      }
    });
  } catch (err) {
    console.error('Error fetching single goldpoint_trainee:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
