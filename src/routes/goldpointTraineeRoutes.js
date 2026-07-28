const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

const VALID_CLASSES = new Set([
  'Alexandrite', 'Almeria', 'Amber', 'Amethyst', 'Aristotle', 'Asheville',
  'Athens', 'Atlanta', 'Auckland', 'Avalon', 'Azurite', 'Beryl', 'Cairo',
  'Camelot', 'Canfield', 'Clinton (Fri 3-5)', 'DaVinci', 'Dale (Sat 4-6)',
  'Denver', 'Diamond', 'Doyle (Sat 1-3)', 'Duloc', 'Einstein', 'Eldorado',
  'Emerald', 'Galileo (Wed 4-6)', 'Gandhi', 'Gates (Sat 10-12)', 'Gladwell',
  'Graham', 'Grande (Thu 4-6 PM)', 'Hogwarts', 'Jade', 'Kiyosaki (Sat 4-6)',
  'Lincoln', 'Mandela', 'Marley', 'Maxwell', 'Millman (Sat 1-3)', 'Narnia',
  'Neverland', 'Newton (Tue 4-6)', 'Obsidian', 'Pearl', 'Plato', 'Quartz',
  'Robbins (Sat 1-3)', 'Ruby', 'Sapphire', 'Sherwood Forest', 'Sigmund',
  'Socrates', 'Spielberg (Sat 4-6)', 'Topaz', 'Tracy (Sat 4-6)', 'Whomville',
  'Winfrey (Thursday 4-6)', 'Wonderland', 'Ziglar (Sat 4-6)'
]);

function sanitizeClass(className) {
  if (!className) return 'Gladwell';
  const trimmed = String(className).trim();
  if (VALID_CLASSES.has(trimmed)) return trimmed;
  return 'Gladwell';
}

// Helper to set CORS headers on every response
const sendResponse = (res, statusCode, payload) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  return res.status(statusCode).json(payload);
};

// Handle OPTIONS preflight
router.options('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  return res.sendStatus(200);
});

// Ensure columns exist on startup / request
async function ensureColumns() {
  try {
    await db.query(`
      ALTER TABLE portal_trainee 
      ADD COLUMN IF NOT EXISTS total_gold INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS gp_month INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rank INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS kategori VARCHAR;
    `);
  } catch (err) {
    // Ignore error if columns exist or query fails
  }
}

// GET /api/goldpoint-trainee - Fetch gold point rankings
router.get('/', async (req, res) => {
  try {
    await ensureColumns();

    const { branch, category, search, limit = 1000, offset = 0 } = req.query;

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
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    if (branch && branch.toUpperCase() !== 'ALL' && branch.toUpperCase() !== 'ALL_BRANCH') {
      queryText += ` AND UPPER(COALESCE(branch_id, 'TIMOR')) = $${paramIndex++}`;
      queryParams.push(branch.toUpperCase());
    }

    if (category && category.toUpperCase() !== 'ALL') {
      queryText += ` AND UPPER(COALESCE(kategori, 'Junior')) = $${paramIndex++}`;
      queryParams.push(category.toUpperCase());
    }

    if (search) {
      queryText += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(trainee_id) LIKE $${paramIndex})`;
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY COALESCE(total_gold, 0) DESC, name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(queryText, queryParams);

    // Format and sanitize class names & dynamic ranks
    const formattedData = result.rows.map((row, idx) => ({
      ...row,
      class: sanitizeClass(row.class),
      rank: row.rank > 0 ? row.rank : (parseInt(offset) + idx + 1)
    }));

    return sendResponse(res, 200, {
      success: true,
      total: formattedData.length,
      data: formattedData
    });
  } catch (err) {
    console.error('Error fetching goldpoint data from portal_trainee:', err);
    return sendResponse(res, 200, {
      success: true,
      total: 0,
      data: [],
      error: err.message
    });
  }
});

// GET /api/goldpoint-trainee/:id - Fetch single trainee gold points
router.get('/:id', async (req, res) => {
  try {
    await ensureColumns();

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
      WHERE trainee_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return sendResponse(res, 404, { success: false, message: 'Goldpoint trainee not found' });
    }

    const row = result.rows[0];
    row.class = sanitizeClass(row.class);

    return sendResponse(res, 200, {
      success: true,
      data: row
    });
  } catch (err) {
    console.error('Error fetching single goldpoint trainee:', err);
    return sendResponse(res, 500, { success: false, message: err.message });
  }
});

// POST /api/goldpoint-trainee - Bulk update Gold Points
router.post('/', async (req, res) => {
  try {
    await ensureColumns();

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
      const level = item.level || 'Sergeant';
      const house = item.house || item.house_sml || 'House of Thenova';
      const className = sanitizeClass(item.class || item.nama_kelas || 'Gladwell');
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
        WHERE trainee_id = $1
        RETURNING *;
      `, [id, totalGold, totalGold, rank, kategori, level, house, className, branch]);

      if (result.rows.length > 0) {
        updatedRecords.push(result.rows[0]);
      }
    }

    return sendResponse(res, 200, {
      success: true,
      count: updatedRecords.length,
      data: updatedRecords
    });
  } catch (err) {
    console.error('Error updating gold points:', err);
    return sendResponse(res, 500, { success: false, message: err.message });
  }
});

module.exports = router;
