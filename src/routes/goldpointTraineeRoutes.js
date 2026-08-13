const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to ensure monthly_gold_point table exists
async function ensureMonthlyGoldPointTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS monthly_gold_point (
        "ID" TEXT PRIMARY KEY,
        "Nama Trainee" TEXT,
        "Active/Expired" TEXT,
        "Level" TEXT,
        "House" TEXT,
        "Class" TEXT,
        "Branch" TEXT,
        "Total Gold/Periode" TEXT,
        "Junior/Youth" TEXT,
        "RANK/ID" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const countCheck = await db.query('SELECT COUNT(*) FROM monthly_gold_point');
    if (parseInt(countCheck.rows[0].count, 10) === 0) {
      try {
        await db.query(`
          INSERT INTO monthly_gold_point ("ID", "Nama Trainee", "Active/Expired", "Level", "House", "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "RANK/ID")
          SELECT DISTINCT ON (trainee_id) 
            trainee_id AS "ID",
            COALESCE(trainee_name, nama_trainee) AS "Nama Trainee",
            COALESCE(membership_status, status) AS "Active/Expired",
            level AS "Level",
            house AS "House",
            COALESCE(class_name, class) AS "Class",
            branch AS "Branch",
            CAST(COALESCE(total_gold, total_gold_periode, gp_month, 0) AS TEXT) AS "Total Gold/Periode",
            COALESCE(program, kategori, junior_youth) AS "Junior/Youth",
            CAST(COALESCE(ranking, rank, 0) AS TEXT) AS "RANK/ID"
          FROM goldpoint_trainee
          ON CONFLICT ("ID") DO NOTHING
        `);
      } catch (copyErr) {
        console.warn('[Goldpoint Trainee] Could not populate from goldpoint_trainee:', copyErr.message);
      }
    }
  } catch (err) {
    console.error('[Goldpoint Trainee] Table init error:', err.message);
  }
}

// GET /api/goldpoint-trainee - Fetch gold point trainee rankings from monthly_gold_point table with exact deduplication
router.get('/', async (req, res) => {
  try {
    await ensureMonthlyGoldPointTable();

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

    let result;
    try {
      result = await db.query(queryText, queryParams);
    } catch (tblErr) {
      result = await db.query('SELECT * FROM goldpoint_trainee');
    }

    // Deduplicate by ID and sort strictly by Total Gold (descending)
    const uniqueMap = new Map();
    for (const row of result.rows) {
      const id = row['ID'] || row.id || row.trainee_id;
      if (!id) continue;

      const name = row['Nama Trainee'] || row.nama_trainee || row.trainee_name;
      const status = row['Active/Expired'] || row.status || row.membership_status;
      const level = row['Level'] || row.level;
      const house = row['House'] || row.house;
      const class_val = row['Class'] || row.class || row.class_name;
      const branch_val = row['Branch'] || row.branch;
      const gold = parseInt(row['Total Gold/Periode'] || row.total_gold || row.gp_month || row.total_gold_periode || '0', 10);
      const cat_val = row['Junior/Youth'] || row.kategori || row.program || row.junior_youth;
      const rank_val = row['RANK/ID'] || row.rank || row.ranking;

      const normalized = {
        id: String(id),
        ID: String(id),
        trainee_id: String(id),
        nama_trainee: name,
        trainee_name: name,
        'Nama Trainee': name,
        status: status,
        membership_status: status,
        'Active/Expired': status,
        level: level,
        Level: level,
        house: house,
        house_sml: house,
        House: house,
        class: class_val,
        class_name: class_val,
        Class: class_val,
        branch: branch_val,
        cabang: branch_val,
        Branch: branch_val,
        total_gold: gold,
        total_gold_periode: gold,
        gp_month: gold,
        'Total Gold/Periode': String(gold),
        kategori: cat_val,
        junior_youth: cat_val,
        program: cat_val,
        'Junior/Youth': cat_val,
        rank: rank_val,
        ranking: rank_val,
        'RANK/ID': rank_val
      };

      if (!uniqueMap.has(String(id))) {
        uniqueMap.set(String(id), normalized);
      } else {
        if (gold > uniqueMap.get(String(id)).total_gold) {
          uniqueMap.set(String(id), normalized);
        }
      }
    }

    const sortedRows = Array.from(uniqueMap.values()).sort((a, b) => b.total_gold - a.total_gold);
    const paginatedRows = sortedRows.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Re-assign 1-based ranks after sorting
    const formattedData = paginatedRows.map((item, idx) => ({
      ...item,
      rank: parseInt(offset) + idx + 1,
      ranking: parseInt(offset) + idx + 1,
      'RANK/ID': parseInt(offset) + idx + 1
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

module.exports = router;
