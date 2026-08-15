const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

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

// GET /api/gold-point-rankings - List with filter, search, pagination from monthly_gold_point table
router.get('/', async (req, res) => {
  try {
    const { id, trainee_id, student_id, search, branch, cabang, category, house, level, junior_youth, program, kategori, page = 1, limit = 100, all } = req.query;

    let query = `
      SELECT 
        "ID", 
        "Nama Trainee", 
        "Active/Expired", 
        "Level", 
        "House", 
        "Class", 
        "Branch", 
        "Total Gold/Periode", 
        "Junior/Youth", 
        "RANK/ID" 
      FROM monthly_gold_point
      WHERE 1=1
    `;
    const conditions = [];
    const params = [];

    const targetId = id || trainee_id || student_id;
    if (targetId) {
      params.push(String(targetId).trim());
      conditions.push(`"ID" = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      conditions.push(`("ID" ILIKE $${params.length} OR "Nama Trainee" ILIKE $${params.length} OR "Class" ILIKE $${params.length} OR "House" ILIKE $${params.length})`);
    }

    const targetBranch = branch || cabang || category;
    if (targetBranch && targetBranch.toUpperCase() !== 'ALL' && targetBranch.toUpperCase() !== 'ALL BRANCH') {
      params.push(targetBranch.trim());
      conditions.push(`"Branch" ILIKE $${params.length}`);
    }

    if (house) {
      params.push(house.trim());
      conditions.push(`"House" ILIKE $${params.length}`);
    }

    if (level) {
      params.push(level.trim());
      conditions.push(`"Level" ILIKE $${params.length}`);
    }

    const targetProgram = junior_youth || program || kategori;
    if (targetProgram && targetProgram.toUpperCase() !== 'ALL') {
      params.push(targetProgram.trim());
      conditions.push(`"Junior/Youth" ILIKE $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ');
    }

    query += ` ORDER BY "ID" ASC`;

    const countQuery = `SELECT COUNT(*) FROM monthly_gold_point WHERE 1=1` + (conditions.length > 0 ? ` AND ` + conditions.join(' AND ') : '');
    const countResult = await db.query(countQuery, params).catch(() => ({ rows: [{ count: 0 }] }));
    const totalItems = parseInt(countResult.rows[0]?.count || 0, 10);

    const mapRow = (r) => ({
      ID: r.ID,
      id: r.ID,
      trainee_id: r.ID,
      'Nama Trainee': r['Nama Trainee'],
      nama_trainee: r['Nama Trainee'],
      trainee_name: r['Nama Trainee'],
      'Active/Expired': r['Active/Expired'],
      membership_status: r['Active/Expired'],
      status: r['Active/Expired'],
      Level: r.Level,
      level: r.Level,
      House: r.House,
      house: r.House,
      Class: r.Class,
      class_name: r.Class,
      class: r.Class,
      nama_kelas: r.Class,
      Branch: r.Branch,
      branch: r.Branch,
      cabang: r.Branch,
      'Total Gold/Periode': r['Total Gold/Periode'],
      total_gold_periode: parseInt(r['Total Gold/Periode'] || '0', 10),
      total_gold: parseInt(r['Total Gold/Periode'] || '0', 10),
      gp_month: parseInt(r['Total Gold/Periode'] || '0', 10),
      'Junior/Youth': r['Junior/Youth'],
      program: r['Junior/Youth'],
      kategori: r['Junior/Youth'],
      junior_youth: r['Junior/Youth'],
      'RANK/ID': r['RANK/ID'],
      rank: parseInt(r['RANK/ID'] || '0', 10),
      ranking: parseInt(r['RANK/ID'] || '0', 10)
    });

    if (all === 'true' || all === '1' || limit === '0') {
      const result = await db.query(query, params);
      const formatted = result.rows.map(mapRow);
      return res.json({
        success: true,
        data: formatted,
        total: formatted.length,
        count: formatted.length
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
      count: formatted.length,
      total: totalItems,
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
      message: 'Gagal mengambil data monthly_gold_point',
      error: error.message
    });
  }
});

// GET /api/gold-point-ranking/:id - Single item by ID from monthly_gold_point
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).trim();

    const result = await db.query(`
      SELECT 
        "ID", "Nama Trainee", "Active/Expired", "Level", "House",
        "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "RANK/ID"
      FROM monthly_gold_point
      WHERE "ID" = $1
    `, [cleanId]);

    if (result.rows.length > 0) {
      const r = result.rows[0];
      const formatted = {
        ID: r.ID,
        id: r.ID,
        trainee_id: r.ID,
        'Nama Trainee': r['Nama Trainee'],
        nama_trainee: r['Nama Trainee'],
        trainee_name: r['Nama Trainee'],
        'Active/Expired': r['Active/Expired'],
        membership_status: r['Active/Expired'],
        status: r['Active/Expired'],
        Level: r.Level,
        level: r.Level,
        House: r.House,
        house: r.House,
        Class: r.Class,
        class_name: r.Class,
        class: r.Class,
        nama_kelas: r.Class,
        Branch: r.Branch,
        branch: r.Branch,
        cabang: r.Branch,
        'Total Gold/Periode': r['Total Gold/Periode'],
        total_gold_periode: parseInt(r['Total Gold/Periode'] || '0', 10),
        total_gold: parseInt(r['Total Gold/Periode'] || '0', 10),
        gp_month: parseInt(r['Total Gold/Periode'] || '0', 10),
        'Junior/Youth': r['Junior/Youth'],
        program: r['Junior/Youth'],
        kategori: r['Junior/Youth'],
        junior_youth: r['Junior/Youth'],
        'RANK/ID': r['RANK/ID'],
        rank: parseInt(r['RANK/ID'] || '0', 10),
        ranking: parseInt(r['RANK/ID'] || '0', 10)
      };
      return res.json({ success: true, data: formatted });
    }

    return res.status(404).json({ success: false, message: `Data Monthly Gold Point ID ${cleanId} tidak ditemukan.` });
  } catch (error) {
    console.error('[GoldPointRanking] GET Single Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data single monthly_gold_point',
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
