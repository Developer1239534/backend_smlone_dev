const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

const VALID_CLASSES = new Set([
  'Alexandrite', 'Almeria', 'Amber', 'Amethyst', 'Aristotle', 'Asheville',
  'Athens', 'Atlanta', 'Atlantis', 'Auckland', 'Avalon', 'Azurite', 'Beryl',
  'Cairo', 'Camelot', 'Canfield', 'Clinton', 'DaVinci', 'Dale', 'Denver',
  'Diamond', 'Doyle', 'Duloc', 'Einstein', 'Eldorado', 'Emerald', 'Galileo',
  'Gandhi', 'Gates', 'Gladwell', 'Graham', 'Grande', 'Hogwarts', 'Jade',
  'Kiyosaki', 'Lincoln', 'Mandela', 'Marley', 'Maxwell', 'Millman', 'Narnia',
  'Neverland', 'Newton', 'Obsidian', 'Pearl', 'Plato', 'Quartz', 'Robbins',
  'Ruby', 'Sapphire', 'Sherwood Forest', 'Sigmund', 'Socrates', 'Spielberg',
  'Topaz', 'Tracy', 'Whomville', 'Winfrey', 'Wonderland', 'Ziglar'
]);

function sanitizeClass(className) {
  if (!className) return 'Gladwell';
  let cleaned = String(className).replace(/\s*\(.*?\)/g, '').trim();
  if (VALID_CLASSES.has(cleaned)) return cleaned;
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
        COALESCE(class, 'Gladwell') AS class_name,
        COALESCE(class, 'Gladwell') AS nama_kelas,
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
      WHERE name IS NOT NULL 
        AND TRIM(name) != '' 
        AND LOWER(TRIM(name)) NOT IN ('trainee', 'youth', 'junior')
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
    const formattedData = result.rows
      .filter(row => row.nama_trainee && row.nama_trainee.trim().length > 0)
      .map((row, idx) => {
        const cleanClass = sanitizeClass(row.class);
        return {
          ...row,
          class: cleanClass,
          class_name: cleanClass,
          nama_kelas: cleanClass,
          rank: row.rank > 0 ? row.rank : (parseInt(offset) + idx + 1)
        };
      });

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
        COALESCE(class, 'Gladwell') AS class_name,
        COALESCE(class, 'Gladwell') AS nama_kelas,
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
      WHERE trainee_id = $1 AND name IS NOT NULL AND TRIM(name) != ''
    `, [id]);

    if (result.rows.length === 0) {
      return sendResponse(res, 404, { success: false, message: 'Goldpoint trainee not found' });
    }

    const row = result.rows[0];
    const cleanClass = sanitizeClass(row.class);
    row.class = cleanClass;
    row.class_name = cleanClass;
    row.nama_kelas = cleanClass;

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
      const className = sanitizeClass(item.class || item.nama_kelas || item.class_name || 'Gladwell');
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
