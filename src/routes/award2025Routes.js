const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const Ably = require('ably');

// Helper to ensure award_2025 table exists
async function ensureAward2025Table() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS award_2025 (
        "No" TEXT PRIMARY KEY,
        "Trainee of the Season" TEXT,
        "Most Active Trainee (OSJ/Y)" TEXT,
        "The Most Creative Trainee (OSJ/Y)" TEXT,
        "The Most Supportive Trainee (OSJ/Y)" TEXT,
        "The Most Improved (OSJ/Y)" TEXT,
        "The Most Inspirational Trainee (OSJ/Y)" TEXT,
        "The Most Discipline (OSJ/Y)" TEXT,
        "The Most Initiative (OSJ/Y)" TEXT,
        "The Most Favorite (OSJ/Y)" TEXT,
        "Best House Leader (OSJ/Y)" TEXT,
        "SMLONE Manner Award (OSJ/Y)" TEXT,
        "Skill Manner Life Award (OSJ/Y)" TEXT,
        "The Most Initiative Apprentice Trainee" TEXT,
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)" TEXT,
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed" TEXT,
        "SMLONE Life Award (OSJ/Y)" TEXT,
        "THE OSJ TOP SCORER (Highest  Gold Points)" TEXT,
        "THE OSY TOP SCORER (Highest  Gold Points)" TEXT,
        "The Most Discipline Apprentice Trainee (HIghest attendance)" TEXT,
        "THE OSJ & OSY TOP HOUSE" TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('[Award 2025] Ensure Table error:', err.message);
  }
}

// Initialize Ably if API key is provided
let ably;
try {
  const ablyKey = process.env.ABLY_API_KEY ? process.env.ABLY_API_KEY.trim() : null;
  if (ablyKey) {
    ably = new Ably.Rest(ablyKey);
    console.log('✅ Ably real-time initialized for award_2025.');
  }
} catch (err) {
  console.warn('⚠️ Ably warning for award_2025:', err.message);
}

// Active Server-Sent Events (SSE) subscribers
const sseClients = new Set();

/**
 * Broadcast event to all active SSE subscribers and Ably channel
 */
async function broadcast(eventType, data) {
  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: data
  };

  // 1. Broadcast to SSE subscribers
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  });

  // 2. Broadcast to Ably channel
  if (ably) {
    try {
      const channel = ably.channels.get('award_2025');
      await channel.publish(eventType, payload);
    } catch (err) {
      console.error('[Ably Publish Error]:', err.message);
    }
  }
}

// SSE Keep-alive heartbeat ping (every 20s)
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(': ping\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  });
}, 20000);

// Helper to extract fields from request body (supporting all exact column names & aliases)
function extractAward2025Fields(row) {
  const no = String(row['No'] ?? row['no'] ?? row['ID'] ?? row['id'] ?? '').trim();
  
  const skillAward = String(
    row['SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed)'] ??
    row['SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed'] ??
    row['SMLONE Skill Award (OSJ/Y) (Highest #speaking project)'] ??
    row['SMLONE Skill Award (OSJ/Y)'] ??
    row['smlone_skill_award'] ?? ''
  ).trim();

  const osjTopScorer = String(
    row['THE OSJ TOP SCORER (Highest  Gold Points)'] ??
    row['THE OSJ TOP SCORER (Highest Gold Points)'] ??
    row['the_osj_top_scorer'] ?? ''
  ).trim();

  const osyTopScorer = String(
    row['THE OSY TOP SCORER (Highest  Gold Points)'] ??
    row['THE OSY TOP SCORER (Highest Gold Points)'] ??
    row['the_osy_top_scorer'] ?? ''
  ).trim();

  return {
    no,
    traineeOfSeason:         String(row['Trainee of the Season'] ?? row['trainee_of_the_season'] ?? '').trim(),
    mostActive:              String(row['Most Active Trainee (OSJ/Y)'] ?? row['most_active_trainee'] ?? '').trim(),
    mostCreative:            String(row['The Most Creative Trainee (OSJ/Y)'] ?? row['the_most_creative_trainee'] ?? '').trim(),
    mostSupportive:          String(row['The Most Supportive Trainee (OSJ/Y)'] ?? row['the_most_supportive_trainee'] ?? '').trim(),
    mostImproved:            String(row['The Most Improved (OSJ/Y)'] ?? row['the_most_improved'] ?? '').trim(),
    mostInspirational:       String(row['The Most Inspirational Trainee (OSJ/Y)'] ?? row['the_most_inspirational_trainee'] ?? '').trim(),
    mostDiscipline:          String(row['The Most Discipline (OSJ/Y)'] ?? row['the_most_discipline'] ?? '').trim(),
    mostInitiative:          String(row['The Most Initiative (OSJ/Y)'] ?? row['the_most_initiative'] ?? '').trim(),
    mostFavorite:            String(row['The Most Favorite (OSJ/Y)'] ?? row['the_most_favorite'] ?? '').trim(),
    bestHouseLeader:         String(row['Best House Leader (OSJ/Y)'] ?? row['best_house_leader'] ?? '').trim(),
    mannerAward:             String(row['SMLONE Manner Award (OSJ/Y)'] ?? row['smlone_manner_award'] ?? '').trim(),
    skillMannerLifeAward:    String(row['Skill Manner Life Award (OSJ/Y)'] ?? row['skill_manner_life_award'] ?? '').trim(),
    mostInitiativeApprentice:String(row['The Most Initiative Apprentice Trainee'] ?? row['the_most_initiative_apprentice_trainee'] ?? '').trim(),
    skillAwardSpeaking:      skillAward,
    lifeAward:               String(row['SMLONE Life Award (OSJ/Y)'] ?? row['smlone_life_award'] ?? '').trim(),
    osjTopScorer,
    osyTopScorer,
    disciplineApprentice:    String(row['The Most Discipline Apprentice Trainee (HIghest attendance)'] ?? row['the_most_discipline_apprentice_trainee'] ?? '').trim(),
    topHouse:                String(row['THE OSJ & OSY TOP HOUSE'] ?? row['the_osj_osy_top_house'] ?? '').trim()
  };
}

// ==========================================
// REAL-TIME SSE STREAM ENDPOINT
// GET /api/award-2025/stream or GET /api/award-2025/live
// ==========================================
const handleStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders && res.flushHeaders();

  sseClients.add(res);

  try {
    const result = await db.query(`
      SELECT 
        "No", "Trainee of the Season", "Most Active Trainee (OSJ/Y)", "The Most Creative Trainee (OSJ/Y)",
        "The Most Supportive Trainee (OSJ/Y)", "The Most Improved (OSJ/Y)", "The Most Inspirational Trainee (OSJ/Y)",
        "The Most Discipline (OSJ/Y)", "The Most Initiative (OSJ/Y)", "The Most Favorite (OSJ/Y)",
        "Best House Leader (OSJ/Y)", "SMLONE Manner Award (OSJ/Y)", "Skill Manner Life Award (OSJ/Y)",
        "The Most Initiative Apprentice Trainee",
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)" AS "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed)",
        "SMLONE Life Award (OSJ/Y)", "THE OSJ TOP SCORER (Highest  Gold Points)", "THE OSY TOP SCORER (Highest  Gold Points)",
        "The Most Discipline Apprentice Trainee (HIghest attendance)", "THE OSJ & OSY TOP HOUSE"
      FROM award_2025 
      ORDER BY "No" ASC 
      LIMIT 100
    `);
    const initPayload = {
      event: 'init',
      timestamp: new Date().toISOString(),
      data: result.rows
    };
    res.write(`event: init\ndata: ${JSON.stringify(initPayload)}\n\n`);
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
  }

  req.on('close', () => {
    sseClients.delete(res);
  });
};

router.get('/stream', handleStream);
router.get('/live', handleStream);

// ==========================================
// RESTful CRUD ENDPOINTS
// ==========================================

// 1. GET /api/award-2025 - Fetch all records (with pagination & search)
router.get('/', async (req, res) => {
  try {
    await ensureAward2025Table();
    const { search, page = 1, limit = 100, all } = req.query;

    let query = `
      SELECT 
        "No", "Trainee of the Season", "Most Active Trainee (OSJ/Y)", "The Most Creative Trainee (OSJ/Y)",
        "The Most Supportive Trainee (OSJ/Y)", "The Most Improved (OSJ/Y)", "The Most Inspirational Trainee (OSJ/Y)",
        "The Most Discipline (OSJ/Y)", "The Most Initiative (OSJ/Y)", "The Most Favorite (OSJ/Y)",
        "Best House Leader (OSJ/Y)", "SMLONE Manner Award (OSJ/Y)", "Skill Manner Life Award (OSJ/Y)",
        "The Most Initiative Apprentice Trainee",
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)" AS "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed)",
        "SMLONE Life Award (OSJ/Y)", "THE OSJ TOP SCORER (Highest  Gold Points)", "THE OSY TOP SCORER (Highest  Gold Points)",
        "The Most Discipline Apprentice Trainee (HIghest attendance)", "THE OSJ & OSY TOP HOUSE"
      FROM award_2025
      WHERE 1=1
    `;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`("No" ILIKE $${params.length} OR "Trainee of the Season" ILIKE $${params.length} OR "Most Active Trainee (OSJ/Y)" ILIKE $${params.length} OR "THE OSJ & OSY TOP HOUSE" ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "No" ASC`;

    const countQuery = `SELECT COUNT(*) FROM award_2025 WHERE 1=1` + (conditions.length > 0 ? ` AND ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params).catch(() => ({ rows: [{ count: 0 }] }));
    const totalItems = parseInt(countResult.rows[0]?.count || 0, 10);

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      return res.json({
        success: true,
        message: 'Berhasil mengambil semua data Award 2025.',
        total: totalItems,
        count: result.rows.length,
        data: result.rows
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
      message: 'Berhasil mengambil data Award 2025.',
      data: result.rows,
      count: result.rows.length,
      total: totalItems,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalItems / limitNum) || 1
      }
    });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({ success: true, data: [], total: 0 });
    }
    console.error('[Award 2025] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// 2. GET /api/award-2025/:no - Get single record by No
router.get('/:no', async (req, res) => {
  try {
    await ensureAward2025Table();
    const cleanNo = String(req.params.no).trim();

    const result = await db.query(`
      SELECT 
        "No", "Trainee of the Season", "Most Active Trainee (OSJ/Y)", "The Most Creative Trainee (OSJ/Y)",
        "The Most Supportive Trainee (OSJ/Y)", "The Most Improved (OSJ/Y)", "The Most Inspirational Trainee (OSJ/Y)",
        "The Most Discipline (OSJ/Y)", "The Most Initiative (OSJ/Y)", "The Most Favorite (OSJ/Y)",
        "Best House Leader (OSJ/Y)", "SMLONE Manner Award (OSJ/Y)", "Skill Manner Life Award (OSJ/Y)",
        "The Most Initiative Apprentice Trainee",
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)" AS "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed)",
        "SMLONE Life Award (OSJ/Y)", "THE OSJ TOP SCORER (Highest  Gold Points)", "THE OSY TOP SCORER (Highest  Gold Points)",
        "The Most Discipline Apprentice Trainee (HIghest attendance)", "THE OSJ & OSY TOP HOUSE"
      FROM award_2025
      WHERE "No" = $1
    `, [cleanNo]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Award 2025 dengan No "${cleanNo}" tidak ditemukan.`
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('[Award 2025] GET NO error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Award 2025.',
      error: error.message
    });
  }
});

// 3. POST /api/award-2025 - Create or Update Single Record
router.post('/', async (req, res) => {
  try {
    const fields = extractAward2025Fields(req.body);

    if (!fields.no) {
      return res.status(400).json({
        success: false,
        message: 'Field "No" wajib diisi.'
      });
    }

    const result = await db.query(`
      INSERT INTO award_2025 (
        "No", "Trainee of the Season", "Most Active Trainee (OSJ/Y)", "The Most Creative Trainee (OSJ/Y)",
        "The Most Supportive Trainee (OSJ/Y)", "The Most Improved (OSJ/Y)", "The Most Inspirational Trainee (OSJ/Y)",
        "The Most Discipline (OSJ/Y)", "The Most Initiative (OSJ/Y)", "The Most Favorite (OSJ/Y)",
        "Best House Leader (OSJ/Y)", "SMLONE Manner Award (OSJ/Y)", "Skill Manner Life Award (OSJ/Y)",
        "The Most Initiative Apprentice Trainee",
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)",
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed",
        "SMLONE Life Award (OSJ/Y)", "THE OSJ TOP SCORER (Highest  Gold Points)", "THE OSY TOP SCORER (Highest  Gold Points)",
        "The Most Discipline Apprentice Trainee (HIghest attendance)", "THE OSJ & OSY TOP HOUSE"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15, $16, $17, $18, $19, $20)
      ON CONFLICT ("No") DO UPDATE SET
        "Trainee of the Season"                                           = EXCLUDED."Trainee of the Season",
        "Most Active Trainee (OSJ/Y)"                                     = EXCLUDED."Most Active Trainee (OSJ/Y)",
        "The Most Creative Trainee (OSJ/Y)"                               = EXCLUDED."The Most Creative Trainee (OSJ/Y)",
        "The Most Supportive Trainee (OSJ/Y)"                             = EXCLUDED."The Most Supportive Trainee (OSJ/Y)",
        "The Most Improved (OSJ/Y)"                                       = EXCLUDED."The Most Improved (OSJ/Y)",
        "The Most Inspirational Trainee (OSJ/Y)"                          = EXCLUDED."The Most Inspirational Trainee (OSJ/Y)",
        "The Most Discipline (OSJ/Y)"                                     = EXCLUDED."The Most Discipline (OSJ/Y)",
        "The Most Initiative (OSJ/Y)"                                     = EXCLUDED."The Most Initiative (OSJ/Y)",
        "The Most Favorite (OSJ/Y)"                                       = EXCLUDED."The Most Favorite (OSJ/Y)",
        "Best House Leader (OSJ/Y)"                                       = EXCLUDED."Best House Leader (OSJ/Y)",
        "SMLONE Manner Award (OSJ/Y)"                                     = EXCLUDED."SMLONE Manner Award (OSJ/Y)",
        "Skill Manner Life Award (OSJ/Y)"                                 = EXCLUDED."Skill Manner Life Award (OSJ/Y)",
        "The Most Initiative Apprentice Trainee"                          = EXCLUDED."The Most Initiative Apprentice Trainee",
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)"          = EXCLUDED."SMLONE Skill Award (OSJ/Y) (Highest #speaking project)",
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed" = EXCLUDED."SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed",
        "SMLONE Life Award (OSJ/Y)"                                       = EXCLUDED."SMLONE Life Award (OSJ/Y)",
        "THE OSJ TOP SCORER (Highest  Gold Points)"                        = EXCLUDED."THE OSJ TOP SCORER (Highest  Gold Points)",
        "THE OSY TOP SCORER (Highest  Gold Points)"                        = EXCLUDED."THE OSY TOP SCORER (Highest  Gold Points)",
        "The Most Discipline Apprentice Trainee (HIghest attendance)"      = EXCLUDED."The Most Discipline Apprentice Trainee (HIghest attendance)",
        "THE OSJ & OSY TOP HOUSE"                                         = EXCLUDED."THE OSJ & OSY TOP HOUSE",
        updated_at                                                        = NOW()
      RETURNING *
    `, [
      fields.no, fields.traineeOfSeason, fields.mostActive, fields.mostCreative, fields.mostSupportive,
      fields.mostImproved, fields.mostInspirational, fields.mostDiscipline, fields.mostInitiative, fields.mostFavorite,
      fields.bestHouseLeader, fields.mannerAward, fields.skillMannerLifeAward, fields.mostInitiativeApprentice,
      fields.skillAwardSpeaking, fields.lifeAward, fields.osjTopScorer, fields.osyTopScorer, fields.disciplineApprentice, fields.topHouse
    ]);

    const newRecord = result.rows[0];
    broadcast('INSERT', newRecord);

    res.status(201).json({
      success: true,
      message: `Berhasil menyimpan data Award 2025 No ${fields.no}`,
      data: newRecord
    });
  } catch (error) {
    console.error('[Award 2025] POST error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data Award 2025.',
      error: error.message
    });
  }
});

// 4. POST /api/award-2025/push - Bulk Upsert Array
router.post('/push', async (req, res) => {
  try {
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kosong.' });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];
    const processedRows = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row !== 'object') {
        skippedCount++;
        continue;
      }

      const fields = extractAward2025Fields(row);

      if (!fields.no) {
        skippedCount++;
        continue;
      }

      try {
        const result = await db.query(`
          INSERT INTO award_2025 (
            "No", "Trainee of the Season", "Most Active Trainee (OSJ/Y)", "The Most Creative Trainee (OSJ/Y)",
            "The Most Supportive Trainee (OSJ/Y)", "The Most Improved (OSJ/Y)", "The Most Inspirational Trainee (OSJ/Y)",
            "The Most Discipline (OSJ/Y)", "The Most Initiative (OSJ/Y)", "The Most Favorite (OSJ/Y)",
            "Best House Leader (OSJ/Y)", "SMLONE Manner Award (OSJ/Y)", "Skill Manner Life Award (OSJ/Y)",
            "The Most Initiative Apprentice Trainee",
            "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)",
            "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed",
            "SMLONE Life Award (OSJ/Y)", "THE OSJ TOP SCORER (Highest  Gold Points)", "THE OSY TOP SCORER (Highest  Gold Points)",
            "The Most Discipline Apprentice Trainee (HIghest attendance)", "THE OSJ & OSY TOP HOUSE"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15, $16, $17, $18, $19, $20)
          ON CONFLICT ("No") DO UPDATE SET
            "Trainee of the Season"                                           = EXCLUDED."Trainee of the Season",
            "Most Active Trainee (OSJ/Y)"                                     = EXCLUDED."Most Active Trainee (OSJ/Y)",
            "The Most Creative Trainee (OSJ/Y)"                               = EXCLUDED."The Most Creative Trainee (OSJ/Y)",
            "The Most Supportive Trainee (OSJ/Y)"                             = EXCLUDED."The Most Supportive Trainee (OSJ/Y)",
            "The Most Improved (OSJ/Y)"                                       = EXCLUDED."The Most Improved (OSJ/Y)",
            "The Most Inspirational Trainee (OSJ/Y)"                          = EXCLUDED."The Most Inspirational Trainee (OSJ/Y)",
            "The Most Discipline (OSJ/Y)"                                     = EXCLUDED."The Most Discipline (OSJ/Y)",
            "The Most Initiative (OSJ/Y)"                                     = EXCLUDED."The Most Initiative (OSJ/Y)",
            "The Most Favorite (OSJ/Y)"                                       = EXCLUDED."The Most Favorite (OSJ/Y)",
            "Best House Leader (OSJ/Y)"                                       = EXCLUDED."Best House Leader (OSJ/Y)",
            "SMLONE Manner Award (OSJ/Y)"                                     = EXCLUDED."SMLONE Manner Award (OSJ/Y)",
            "Skill Manner Life Award (OSJ/Y)"                                 = EXCLUDED."Skill Manner Life Award (OSJ/Y)",
            "The Most Initiative Apprentice Trainee"                          = EXCLUDED."The Most Initiative Apprentice Trainee",
            "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)"          = EXCLUDED."SMLONE Skill Award (OSJ/Y) (Highest #speaking project)",
            "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed" = EXCLUDED."SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed",
            "SMLONE Life Award (OSJ/Y)"                                       = EXCLUDED."SMLONE Life Award (OSJ/Y)",
            "THE OSJ TOP SCORER (Highest  Gold Points)"                        = EXCLUDED."THE OSJ TOP SCORER (Highest  Gold Points)",
            "THE OSY TOP SCORER (Highest  Gold Points)"                        = EXCLUDED."THE OSY TOP SCORER (Highest  Gold Points)",
            "The Most Discipline Apprentice Trainee (HIghest attendance)"      = EXCLUDED."The Most Discipline Apprentice Trainee (HIghest attendance)",
            "THE OSJ & OSY TOP HOUSE"                                         = EXCLUDED."THE OSJ & OSY TOP HOUSE",
            updated_at                                                        = NOW()
          RETURNING *
        `, [
          fields.no, fields.traineeOfSeason, fields.mostActive, fields.mostCreative, fields.mostSupportive,
          fields.mostImproved, fields.mostInspirational, fields.mostDiscipline, fields.mostInitiative, fields.mostFavorite,
          fields.bestHouseLeader, fields.mannerAward, fields.skillMannerLifeAward, fields.mostInitiativeApprentice,
          fields.skillAwardSpeaking, fields.lifeAward, fields.osjTopScorer, fields.osyTopScorer, fields.disciplineApprentice, fields.topHouse
        ]);

        insertedCount++;
        processedRows.push(result.rows[0]);
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, no: fields.no, error: rowError.message });
      }
    }

    if (processedRows.length > 0) {
      broadcast('BULK_UPSERT', { count: processedRows.length, sample: processedRows.slice(0, 5) });
    }

    res.json({
      success: true,
      message: `Berhasil menyimpan/mengupdate ${insertedCount} data ke Award 2025, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('[Award 2025 Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// 5. PUT /api/award-2025/:no & PATCH /api/award-2025/:no - Update Single Record
const handleUpdate = async (req, res) => {
  try {
    const cleanNo = String(req.params.no).trim();
    const fields = extractAward2025Fields(req.body);

    const result = await db.query(`
      UPDATE award_2025 SET
        "Trainee of the Season"                                           = COALESCE(NULLIF($1, ''), "Trainee of the Season"),
        "Most Active Trainee (OSJ/Y)"                                     = COALESCE(NULLIF($2, ''), "Most Active Trainee (OSJ/Y)"),
        "The Most Creative Trainee (OSJ/Y)"                               = COALESCE(NULLIF($3, ''), "The Most Creative Trainee (OSJ/Y)"),
        "The Most Supportive Trainee (OSJ/Y)"                             = COALESCE(NULLIF($4, ''), "The Most Supportive Trainee (OSJ/Y)"),
        "The Most Improved (OSJ/Y)"                                       = COALESCE(NULLIF($5, ''), "The Most Improved (OSJ/Y)"),
        "The Most Inspirational Trainee (OSJ/Y)"                          = COALESCE(NULLIF($6, ''), "The Most Inspirational Trainee (OSJ/Y)"),
        "The Most Discipline (OSJ/Y)"                                     = COALESCE(NULLIF($7, ''), "The Most Discipline (OSJ/Y)"),
        "The Most Initiative (OSJ/Y)"                                     = COALESCE(NULLIF($8, ''), "The Most Initiative (OSJ/Y)"),
        "The Most Favorite (OSJ/Y)"                                       = COALESCE(NULLIF($9, ''), "The Most Favorite (OSJ/Y)"),
        "Best House Leader (OSJ/Y)"                                       = COALESCE(NULLIF($10, ''), "Best House Leader (OSJ/Y)"),
        "SMLONE Manner Award (OSJ/Y)"                                     = COALESCE(NULLIF($11, ''), "SMLONE Manner Award (OSJ/Y)"),
        "Skill Manner Life Award (OSJ/Y)"                                 = COALESCE(NULLIF($12, ''), "Skill Manner Life Award (OSJ/Y)"),
        "The Most Initiative Apprentice Trainee"                          = COALESCE(NULLIF($13, ''), "The Most Initiative Apprentice Trainee"),
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)"          = COALESCE(NULLIF($14, ''), "SMLONE Skill Award (OSJ/Y) (Highest #speaking project)"),
        "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed" = COALESCE(NULLIF($14, ''), "SMLONE Skill Award (OSJ/Y) (Highest #speaking project completed"),
        "SMLONE Life Award (OSJ/Y)"                                       = COALESCE(NULLIF($15, ''), "SMLONE Life Award (OSJ/Y)"),
        "THE OSJ TOP SCORER (Highest  Gold Points)"                        = COALESCE(NULLIF($16, ''), "THE OSJ TOP SCORER (Highest  Gold Points)"),
        "THE OSY TOP SCORER (Highest  Gold Points)"                        = COALESCE(NULLIF($17, ''), "THE OSY TOP SCORER (Highest  Gold Points)"),
        "The Most Discipline Apprentice Trainee (HIghest attendance)"      = COALESCE(NULLIF($18, ''), "The Most Discipline Apprentice Trainee (HIghest attendance)"),
        "THE OSJ & OSY TOP HOUSE"                                         = COALESCE(NULLIF($19, ''), "THE OSJ & OSY TOP HOUSE"),
        updated_at                                                        = NOW()
      WHERE "No" = $20
      RETURNING *
    `, [
      fields.traineeOfSeason, fields.mostActive, fields.mostCreative, fields.mostSupportive,
      fields.mostImproved, fields.mostInspirational, fields.mostDiscipline, fields.mostInitiative, fields.mostFavorite,
      fields.bestHouseLeader, fields.mannerAward, fields.skillMannerLifeAward, fields.mostInitiativeApprentice,
      fields.skillAwardSpeaking, fields.lifeAward, fields.osjTopScorer, fields.osyTopScorer, fields.disciplineApprentice, fields.topHouse,
      cleanNo
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data Award 2025 dengan No "${cleanNo}" tidak ditemukan.`
      });
    }

    const updatedRecord = result.rows[0];
    broadcast('UPDATE', updatedRecord);

    res.json({
      success: true,
      message: `Berhasil mengupdate data Award 2025 No ${cleanNo}`,
      data: updatedRecord
    });
  } catch (error) {
    console.error('[Award 2025] UPDATE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate data.',
      error: error.message
    });
  }
};

router.put('/:no', handleUpdate);
router.patch('/:no', handleUpdate);

// 6. DELETE /api/award-2025/truncate - Clear all table rows
router.delete('/truncate', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE award_2025');
    broadcast('TRUNCATE', { message: 'All award_2025 records cleared' });
    res.json({ success: true, message: 'Seluruh isi tabel award_2025 berhasil dikosongkan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengosongkan tabel.', error: error.message });
  }
});

// 7. DELETE /api/award-2025/:no - Delete single record by No
router.delete('/:no', async (req, res) => {
  const cleanNo = String(req.params.no).trim();
  try {
    const result = await db.query('DELETE FROM award_2025 WHERE "No" = $1 RETURNING *', [cleanNo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Tidak ada data Award 2025 dengan No: ${cleanNo}` });
    }

    broadcast('DELETE', { No: cleanNo });

    res.json({ success: true, message: `Data Award 2025 No ${cleanNo} berhasil dihapus.`, deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data.', error: error.message });
  }
});

module.exports = router;
