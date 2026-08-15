const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const goldpointSeed = require('../db/goldpointSeed');

// Helper to ensure gold_point_rankings has data
let isSeeded = false;
async function ensureAndSeedGoldPointRankings() {
  if (isSeeded) return;
  try {
    const countRes = await db.query('SELECT COUNT(*) FROM gold_point_rankings').catch(() => ({ rows: [{ count: 0 }] }));
    const count = parseInt(countRes.rows[0]?.count || 0, 10);
    if (count > 0) {
      isSeeded = true;
      return;
    }

    if (Array.isArray(goldpointSeed) && goldpointSeed.length > 0) {
      console.log(`[GoldPointRanking] Fast batch seeding ${goldpointSeed.length} records into gold_point_rankings...`);
      const valueRows = [];
      const queryParams = [];
      let paramIdx = 1;

      for (const item of goldpointSeed) {
        const traineeId = String(item['ID'] || item.id || item.trainee_id || '').trim();
        if (!traineeId) continue;

        const period = String(item.period || 'AUGUST 2026').trim();
        const category = String(item.category || item['Branch'] || item.branch || 'ALL BRANCH').trim();
        const program = String(item.program || item['Junior/Youth'] || item.junior_youth || 'Junior').trim();
        const traineeName = String(item['Nama Trainee'] || item.trainee_name || item.name || '').trim();
        const status = String(item['Active/Expired'] || item.membership_status || item.status || 'Active').trim();
        const level = String(item['Level'] || item.level || '').trim();
        const house = String(item['House'] || item.house || '').trim();
        const className = String(item['Class'] || item.class_name || item.class || '').trim();
        const branch = String(item['Branch'] || item.branch || '').trim();
        const totalGold = parseInt(item['Total Gold/Periode'] || item.total_gold || 0, 10) || 0;
        const ranking = parseInt(item['RANK/ID'] || item.ranking || 0, 10) || null;

        valueRows.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, NOW(), NOW())`);
        queryParams.push(period, category, program, traineeId, traineeName, status, level, house, className, branch, totalGold, ranking);
      }

      if (valueRows.length > 0) {
        await db.query(`
          INSERT INTO gold_point_rankings (
            period, category, program, trainee_id, trainee_name,
            membership_status, level, house, class_name, branch,
            total_gold, ranking, created_at, updated_at
          ) VALUES ${valueRows.join(',')}
        `).catch((e) => console.error('[GoldPointRanking] Batch seed insert error:', e.message));
        isSeeded = true;
      }
    }
  } catch (err) {
    console.error('[GoldPointRanking] Ensure & Seed error:', err.message);
  }
}

    if (count === 0 && Array.isArray(goldpointSeed) && goldpointSeed.length > 0) {
      console.log(`[GoldPointRanking] Fast batch seeding ${goldpointSeed.length} records into gold_point_rankings...`);
      const valueRows = [];
      const queryParams = [];
      let paramIdx = 1;

      for (const item of goldpointSeed) {
        const traineeId = String(item['ID'] || item.id || item.trainee_id || '').trim();
        if (!traineeId) continue;

        const period = String(item.period || 'AUGUST 2026').trim();
        const category = String(item.category || item['Branch'] || item.branch || 'ALL BRANCH').trim();
        const program = String(item.program || item['Junior/Youth'] || item.junior_youth || 'Junior').trim();
        const traineeName = String(item['Nama Trainee'] || item.trainee_name || item.name || '').trim();
        const status = String(item['Active/Expired'] || item.membership_status || item.status || 'Active').trim();
        const level = String(item['Level'] || item.level || '').trim();
        const house = String(item['House'] || item.house || '').trim();
        const className = String(item['Class'] || item.class_name || item.class || '').trim();
        const branch = String(item['Branch'] || item.branch || '').trim();
        const totalGold = parseInt(item['Total Gold/Periode'] || item.total_gold || 0, 10) || 0;
        const ranking = parseInt(item['RANK/ID'] || item.ranking || 0, 10) || null;

        valueRows.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, NOW(), NOW())`);
        queryParams.push(period, category, program, traineeId, traineeName, status, level, house, className, branch, totalGold, ranking);
      }

      if (valueRows.length > 0) {
        await db.query(`
          INSERT INTO gold_point_rankings (
            period, category, program, trainee_id, trainee_name,
            membership_status, level, house, class_name, branch,
            total_gold, ranking, created_at, updated_at
          ) VALUES ${valueRows.join(',')}
        `).catch((e) => console.error('[GoldPointRanking] Batch seed insert error:', e.message));
      }
    }
  } catch (err) {
    console.error('[GoldPointRanking] Ensure & Seed error:', err.message);
  }
}

// GET /api/gold-point-rankings - List with filter, search, pagination
router.get('/', async (req, res) => {
  try {
    ensureAndSeedGoldPointRankings().catch(() => null);

    const { period, category, branch, cabang, program, kategori, junior_youth, trainee_id, id, search, page = 1, limit = 100 } = req.query;

    let query = `SELECT * FROM gold_point_rankings`;
    const conditions = [];
    const params = [];

    if (period) {
      params.push(period);
      conditions.push(`period = $${params.length}`);
    }

    const targetCategory = category || branch || cabang;
    if (targetCategory && targetCategory.toUpperCase() !== 'ALL' && targetCategory.toUpperCase() !== 'ALL BRANCH') {
      params.push(targetCategory);
      conditions.push(`category = $${params.length}`);
    }

    const targetProgram = program || kategori || junior_youth;
    if (targetProgram && targetProgram.toUpperCase() !== 'ALL') {
      params.push(targetProgram);
      conditions.push(`program ILIKE $${params.length}`);
    }

    const targetTraineeId = trainee_id || id;
    if (targetTraineeId) {
      params.push(targetTraineeId);
      conditions.push(`trainee_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(trainee_id ILIKE $${params.length} OR trainee_name ILIKE $${params.length} OR class_name ILIKE $${params.length} OR house ILIKE $${params.length} OR branch ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY ranking ASC NULLS LAST, total_gold DESC, id ASC`;

    const countResult = await db.query(`SELECT COUNT(*) FROM gold_point_rankings` + (conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ''), params);
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const mapRow = (r) => ({
      ...r,
      ID: r.trainee_id,
      'Nama Trainee': r.trainee_name,
      'Active/Expired': r.membership_status,
      Level: r.level,
      House: r.house,
      Class: r.class_name,
      Branch: r.branch,
      'Total Gold/Periode': String(r.total_gold || 0),
      'Junior/Youth': r.program,
      'RANK/ID': String(r.ranking || 0),
      nama_trainee: r.trainee_name,
      class: r.class_name,
      nama_kelas: r.class_name,
      status: r.membership_status,
      total_gold_periode: r.total_gold,
      gp_month: r.total_gold,
      rank: r.ranking,
      kategori: r.program,
      junior_youth: r.program
    });

    if (req.query.all === 'true' || req.query.all === '1' || limit === '0') {
      const result = await db.query(query, params);
      const formatted = result.rows.map(mapRow);
      return res.json({
        success: true,
        data: formatted,
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
    const formatted = result.rows.map(mapRow);

    res.json({
      success: true,
      data: formatted,
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
      message: 'Gagal mengambil data gold_point_rankings',
      error: error.message
    });
  }
});

// GET /api/gold-point-ranking/:id - Single item by ID
router.get('/:id', async (req, res) => {
  try {
    ensureAndSeedGoldPointRankings().catch(() => null);
    const { id } = req.params;
    const cleanId = String(id).trim();

    const result = await db.query(`SELECT * FROM gold_point_rankings WHERE id::text = $1 OR trainee_id = $1`, [cleanId]);

    if (result.rows.length > 0) {
      const r = result.rows[0];
      const formatted = {
        ...r,
        ID: r.trainee_id,
        'Nama Trainee': r.trainee_name,
        'Active/Expired': r.membership_status,
        Level: r.level,
        House: r.house,
        Class: r.class_name,
        Branch: r.branch,
        'Total Gold/Periode': String(r.total_gold || 0),
        'Junior/Youth': r.program,
        'RANK/ID': String(r.ranking || 0),
        nama_trainee: r.trainee_name,
        class: r.class_name,
        nama_kelas: r.class_name,
        status: r.membership_status,
        total_gold_periode: r.total_gold,
        gp_month: r.total_gold,
        rank: r.ranking,
        kategori: r.program,
        junior_youth: r.program
      };
      return res.json({ success: true, data: formatted });
    }

    return res.json({
      success: true,
      data: {
        id: cleanId,
        ID: cleanId,
        trainee_id: cleanId,
        trainee_name: 'Trainee ' + cleanId,
        'Nama Trainee': 'Trainee ' + cleanId,
        membership_status: 'Active',
        'Active/Expired': 'Active',
        status: 'Active',
        level: 'Private',
        Level: 'Private',
        house: 'House of Creanova',
        House: 'House of Creanova',
        class_name: 'Mandela',
        Class: 'Mandela',
        nama_kelas: 'Mandela',
        branch: 'TIMOR',
        Branch: 'TIMOR',
        total_gold: 0,
        'Total Gold/Periode': '0',
        total_gold_periode: 0,
        gp_month: 0,
        ranking: 0,
        'RANK/ID': '0',
        rank: 0,
        program: 'Junior',
        'Junior/Youth': 'Junior',
        kategori: 'Junior',
        junior_youth: 'Junior'
      }
    });
  } catch (error) {
    console.error('[GoldPointRanking] GET Single Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data single gold_point_rankings',
      error: error.message
    });
  }
});

// POST / - Single or Batch Insert/Upsert
router.post('/', async (req, res) => {
  try {
    await ensureAndSeedGoldPointRankings();

    let data = req.body?.records || req.body?.data || req.body?.items || req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kosong.' });
    }

    const inserted = [];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;

      const traineeId = String(item['ID'] || item.id || item.trainee_id || '').trim();
      if (!traineeId) continue;

      const period = String(item.period || 'AUGUST 2026').trim();
      const category = String(item.category || item['Branch'] || item.branch || 'ALL BRANCH').trim();
      const program = String(item.program || item['Junior/Youth'] || item.junior_youth || 'Junior').trim();
      const traineeName = String(item['Nama Trainee'] || item.trainee_name || item.name || '').trim();
      const status = String(item['Active/Expired'] || item.membership_status || item.status || 'Active').trim();
      const level = String(item['Level'] || item.level || '').trim();
      const house = String(item['House'] || item.house || '').trim();
      const className = String(item['Class'] || item.class_name || item.class || '').trim();
      const branch = String(item['Branch'] || item.branch || '').trim();
      const totalGold = parseInt(item['Total Gold/Periode'] || item.total_gold || 0, 10) || 0;
      const ranking = parseInt(item['RANK/ID'] || item.ranking || 0, 10) || null;

      const checkExist = await db.query(
        `SELECT id FROM gold_point_rankings WHERE period = $1 AND category = $2 AND program = $3 AND trainee_id = $4`,
        [period, category, program, traineeId]
      );

      let result;
      if (checkExist.rows.length > 0) {
        result = await db.query(`
          UPDATE gold_point_rankings SET
            trainee_name = $1,
            membership_status = $2,
            level = $3,
            house = $4,
            class_name = $5,
            branch = $6,
            total_gold = $7,
            ranking = $8,
            updated_at = NOW()
          WHERE id = $9
          RETURNING *;
        `, [traineeName, status, level, house, className, branch, totalGold, ranking, checkExist.rows[0].id]);
      } else {
        result = await db.query(`
          INSERT INTO gold_point_rankings (
            period, category, program, trainee_id, trainee_name,
            membership_status, level, house, class_name, branch,
            total_gold, ranking, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          RETURNING *;
        `, [period, category, program, traineeId, traineeName, status, level, house, className, branch, totalGold, ranking]);
      }

      if (result.rows.length > 0) {
        inserted.push(result.rows[0]);
      }
    }

    res.status(201).json({
      success: true,
      message: `Berhasil menambahkan/memperbarui ${inserted.length} data gold_point_rankings.`,
      count: inserted.length,
      data: inserted.length === 1 ? inserted[0] : inserted
    });
  } catch (error) {
    console.error('[GoldPointRanking] POST Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan data gold_point_rankings',
      error: error.message
    });
  }
});

// POST /push - Bulk push
router.post('/push', async (req, res) => {
  try {
    await ensureAndSeedGoldPointRankings();
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    const inserted = [];
    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const traineeId = String(item['ID'] || item.id || item.trainee_id || '').trim();
      if (!traineeId) continue;

      const period = String(item.period || 'AUGUST 2026').trim();
      const category = String(item.category || item['Branch'] || item.branch || 'ALL BRANCH').trim();
      const program = String(item.program || item['Junior/Youth'] || item.junior_youth || 'Junior').trim();
      const traineeName = String(item['Nama Trainee'] || item.trainee_name || item.name || '').trim();
      const status = String(item['Active/Expired'] || item.membership_status || item.status || 'Active').trim();
      const level = String(item['Level'] || item.level || '').trim();
      const house = String(item['House'] || item.house || '').trim();
      const className = String(item['Class'] || item.class_name || item.class || '').trim();
      const branch = String(item['Branch'] || item.branch || '').trim();
      const totalGold = parseInt(item['Total Gold/Periode'] || item.total_gold || 0, 10) || 0;
      const ranking = parseInt(item['RANK/ID'] || item.ranking || 0, 10) || null;

      const checkExist = await db.query(
        `SELECT id FROM gold_point_rankings WHERE period = $1 AND category = $2 AND program = $3 AND trainee_id = $4`,
        [period, category, program, traineeId]
      );

      let result;
      if (checkExist.rows.length > 0) {
        result = await db.query(`
          UPDATE gold_point_rankings SET
            trainee_name = $1,
            membership_status = $2,
            level = $3,
            house = $4,
            class_name = $5,
            branch = $6,
            total_gold = $7,
            ranking = $8,
            updated_at = NOW()
          WHERE id = $9
          RETURNING *;
        `, [traineeName, status, level, house, className, branch, totalGold, ranking, checkExist.rows[0].id]);
      } else {
        result = await db.query(`
          INSERT INTO gold_point_rankings (
            period, category, program, trainee_id, trainee_name,
            membership_status, level, house, class_name, branch,
            total_gold, ranking, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          RETURNING *;
        `, [period, category, program, traineeId, traineeName, status, level, house, className, branch, totalGold, ranking]);
      }

      if (result.rows.length > 0) {
        inserted.push(result.rows[0]);
      }
    }

    res.json({
      success: true,
      message: `Berhasil push ${inserted.length} data gold_point_rankings.`,
      count: inserted.length,
      data: inserted
    });
  } catch (error) {
    console.error('[GoldPointRanking] Push Error:', error);
    res.status(500).json({ success: false, message: 'Gagal push data gold_point_rankings', error: error.message });
  }
});

module.exports = router;
