const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET /api/gold-point-rankings - List with filter, search, pagination from monthly_gold_point table
router.get('/', async (req, res) => {
  try {
    const { id, trainee_id, student_id, search, branch, cabang, category, house, level, junior_youth, program, kategori, page = 1, limit = 100, all } = req.query;

    let query = `
      SELECT 
        "ID", 
        "Nama", 
        "Active/Expired", 
        "Level", 
        "House", 
        "Class", 
        "Branch", 
        "Total Gold/Periode", 
        "Junior/Youth", 
        "Rank/ID" 
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
      conditions.push(`("ID" ILIKE $${params.length} OR "Nama" ILIKE $${params.length} OR "Class" ILIKE $${params.length} OR "House" ILIKE $${params.length})`);
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

    const mapRow = (r) => {
      const nameVal = r['Nama'] || r['Nama Trainee'] || '';
      const rankVal = r['Rank/ID'] || r['RANK/ID'] || '0';
      return {
        ID: r.ID,
        id: r.ID,
        trainee_id: r.ID,
        Nama: nameVal,
        nama: nameVal,
        'Nama Trainee': nameVal,
        nama_trainee: nameVal,
        trainee_name: nameVal,
        name: nameVal,
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
        'Rank/ID': rankVal,
        'RANK/ID': rankVal,
        rank: parseInt(rankVal || '0', 10),
        ranking: parseInt(rankVal || '0', 10)
      };
    };

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
        "ID", "Nama", "Active/Expired", "Level", "House",
        "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "Rank/ID"
      FROM monthly_gold_point
      WHERE "ID" = $1
    `, [cleanId]);

    if (result.rows.length > 0) {
      const r = result.rows[0];
      const nameVal = r['Nama'] || r['Nama Trainee'] || '';
      const rankVal = r['Rank/ID'] || r['RANK/ID'] || '0';
      const formatted = {
        ID: r.ID,
        id: r.ID,
        trainee_id: r.ID,
        Nama: nameVal,
        nama: nameVal,
        'Nama Trainee': nameVal,
        nama_trainee: nameVal,
        trainee_name: nameVal,
        name: nameVal,
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
        'Rank/ID': rankVal,
        'RANK/ID': rankVal,
        rank: parseInt(rankVal || '0', 10),
        ranking: parseInt(rankVal || '0', 10)
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

module.exports = router;
