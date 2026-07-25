const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const verifyToken = require('../middleware/authMiddleware');

// ========================================================
// PUBLIC GET (Portal & Admin)
// ========================================================
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM news_announcements ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[News API] GET News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ========================================================
// PROTECTED ROUTES (Admin Only)
// ========================================================

// POST /goldpoint-trainee or POST / with goldpoint payload
router.post('/goldpoint-trainee', async (req, res) => {
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

    for (const item of itemsToProcess) {
      const id = String(item.id || item.trainee_id || '').trim();
      const name = String(item.nama_trainee || item.name || item.trainee_name || '').trim();
      const status = item.status || 'Active';
      const level = item.level || 'Sergeant';
      const house = item.house || item.house_sml || 'House of Thenova';
      const className = item.class || item.nama_kelas || 'Gladwell';
      const branch = item.branch || item.cabang || 'TIMOR';
      const totalGold = parseInt(item.total_gold || item.total_gold_periode || item.gp_month || '0') || 0;
      const kategori = item.kategori || item.junior_youth || 'Junior';
      const rank = parseInt(item.rank || '0') || 0;

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

      const result = await db.query(queryText, [id, name, status, level, house, className, branch, totalGold, totalGold, kategori, rank]);

      // Connect & Sync with portal_trainee table
      await db.query(`
        UPDATE portal_trainee 
        SET name = $2, house = $3, class = $4, branch_id = $5
        WHERE trainee_id = $1 OR id = $1
      `, [id, name, house, className, branch]).catch(() => null);

      updatedRecords.push(result.rows[0]);
    }

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

// POST - Create news
router.post('/', async (req, res) => {
  const { category, title, date_string, time_string, description, contacts, image_url } = req.body;
  if (!title) {
    if (Array.isArray(req.body) || req.body.daftar_siswa || req.body.group_key || req.body.total_gold !== undefined) {
      // Forward to goldpoint-trainee
      let itemsToProcess = [];
      if (Array.isArray(req.body)) itemsToProcess = req.body;
      else if (req.body && Array.isArray(req.body.daftar_siswa)) itemsToProcess = req.body.daftar_siswa;
      else itemsToProcess = [req.body];

      const updatedRecords = [];

      for (const item of itemsToProcess) {
        const id = String(item.id || item.trainee_id || '').trim();
        const name = String(item.nama_trainee || item.name || item.trainee_name || '').trim();
        const status = item.status || 'Active';
        const level = item.level || 'Sergeant';
        const house = item.house || item.house_sml || 'House of Thenova';
        const className = item.class || item.nama_kelas || 'Gladwell';
        const branch = item.branch || item.cabang || 'TIMOR';
        const totalGold = parseInt(item.total_gold || item.total_gold_periode || item.gp_month || '0') || 0;
        const kategori = item.kategori || item.junior_youth || 'Junior';
        const rank = parseInt(item.rank || '0') || 0;

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

        const result = await db.query(queryText, [id, name, status, level, house, className, branch, totalGold, totalGold, kategori, rank]);

        await db.query(`
          UPDATE portal_trainee 
          SET name = $2, house = $3, class = $4, branch_id = $5
          WHERE trainee_id = $1 OR id = $1
        `, [id, name, house, className, branch]).catch(() => null);

        updatedRecords.push(result.rows[0]);
      }

      return res.json({
        success: true,
        count: updatedRecords.length,
        data: updatedRecords
      });
    }
    return res.status(400).json({ success: false, message: 'Title wajib diisi.' });
  }
  
  try {
    const result = await db.query(
      `INSERT INTO news_announcements (category, title, date_string, time_string, description, contacts, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [category, title, date_string, time_string, description, contacts, image_url]
    );
    res.status(201).json({ success: true, message: 'Berita berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error('[News API] POST News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT - Edit news
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { category, title, date_string, time_string, description, contacts, image_url } = req.body;
  
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title wajib diisi.' });
  }

  try {
    const check = await db.query('SELECT 1 FROM news_announcements WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan.' });
    }

    const result = await db.query(
      `UPDATE news_announcements 
       SET category = $1, title = $2, date_string = $3, time_string = $4, description = $5, contacts = $6, image_url = $7
       WHERE id = $8 RETURNING *`,
      [category, title, date_string, time_string, description, contacts, image_url, id]
    );
    res.json({ success: true, message: 'Berita berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error('[News API] PUT News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE - Delete news
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM news_announcements WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Berita tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Berita berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error('[News API] DELETE News error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
