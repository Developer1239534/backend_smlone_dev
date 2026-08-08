const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// ============================================================
// Auto-create table on first load
// ============================================================
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS request_fitur (
        id SERIAL PRIMARY KEY,
        nama_pengaju VARCHAR(255) NOT NULL,
        no_whatsapp VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        nama_fitur VARCHAR(255) NOT NULL,
        deskripsi TEXT NOT NULL,
        prioritas VARCHAR(50) NOT NULL DEFAULT 'Medium',
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        catatan_admin TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table request_fitur ready.');
  } catch (err) {
    console.error('❌ Error creating request_fitur table:', err.message);
  }
})();

// ============================================================
// GET /  — Fetch all requests (with optional filters)
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { status, prioritas, search, page = 1, limit = 50 } = req.query;
    
    let conditions = [];
    let values = [];
    let idx = 1;

    if (status) {
      conditions.push(`status = $${idx}`);
      values.push(status);
      idx++;
    }

    if (prioritas) {
      conditions.push(`prioritas = $${idx}`);
      values.push(prioritas);
      idx++;
    }

    if (search) {
      conditions.push(`(
        LOWER(nama_pengaju) LIKE $${idx} OR 
        LOWER(nama_fitur) LIKE $${idx} OR 
        LOWER(deskripsi) LIKE $${idx} OR
        LOWER(email) LIKE $${idx}
      )`);
      values.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countResult = await db.query(
      `SELECT COUNT(*) FROM request_fitur ${whereClause}`, values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Paginated data
    const offset = (parseInt(page) - 1) * parseInt(limit);
    values.push(parseInt(limit));
    values.push(offset);

    const result = await db.query(
      `SELECT * FROM request_fitur ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      values
    );

    res.json({
      success: true,
      message: `Berhasil mengambil ${result.rows.length} request fitur.`,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data request.', error: error.message });
  }
});

// ============================================================
// GET /:id  — Fetch single request by ID
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM request_fitur WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request tidak ditemukan.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching request:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil data request.', error: error.message });
  }
});

// ============================================================
// POST /  — Create new feature request
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { nama_pengaju, no_whatsapp, email, nama_fitur, deskripsi, prioritas } = req.body;

    // Validation
    if (!nama_pengaju || !no_whatsapp || !email || !nama_fitur || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi: nama_pengaju, no_whatsapp, email, nama_fitur, deskripsi.'
      });
    }

    const validPrioritas = ['Low', 'Medium', 'High', 'Critical'];
    const finalPrioritas = validPrioritas.includes(prioritas) ? prioritas : 'Medium';

    const result = await db.query(
      `INSERT INTO request_fitur (nama_pengaju, no_whatsapp, email, nama_fitur, deskripsi, prioritas)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nama_pengaju.trim(), no_whatsapp.trim(), email.trim(), nama_fitur.trim(), deskripsi.trim(), finalPrioritas]
    );

    res.status(201).json({
      success: true,
      message: 'Request fitur berhasil dikirim.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating request:', error.message);
    res.status(500).json({ success: false, message: 'Gagal menyimpan request fitur.', error: error.message });
  }
});

// ============================================================
// PUT /:id  — Update a request (full update)
// ============================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_pengaju, no_whatsapp, email, nama_fitur, deskripsi, prioritas, status, catatan_admin } = req.body;

    // Check exists
    const existing = await db.query('SELECT id FROM request_fitur WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request tidak ditemukan.' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (nama_pengaju !== undefined) { updates.push(`nama_pengaju = $${idx}`); values.push(nama_pengaju.trim()); idx++; }
    if (no_whatsapp !== undefined) { updates.push(`no_whatsapp = $${idx}`); values.push(no_whatsapp.trim()); idx++; }
    if (email !== undefined) { updates.push(`email = $${idx}`); values.push(email.trim()); idx++; }
    if (nama_fitur !== undefined) { updates.push(`nama_fitur = $${idx}`); values.push(nama_fitur.trim()); idx++; }
    if (deskripsi !== undefined) { updates.push(`deskripsi = $${idx}`); values.push(deskripsi.trim()); idx++; }
    if (prioritas !== undefined) { updates.push(`prioritas = $${idx}`); values.push(prioritas); idx++; }
    if (status !== undefined) { updates.push(`status = $${idx}`); values.push(status); idx++; }
    if (catatan_admin !== undefined) { updates.push(`catatan_admin = $${idx}`); values.push(catatan_admin); idx++; }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diupdate.' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await db.query(
      `UPDATE request_fitur SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Request fitur berhasil diupdate.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating request:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengupdate request.', error: error.message });
  }
});

// ============================================================
// PATCH /:id/status  — Quick status update only
// ============================================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    const validStatuses = ['Pending', 'In Review', 'Approved', 'In Progress', 'Done', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`
      });
    }

    const result = await db.query(
      `UPDATE request_fitur SET status = $1, catatan_admin = COALESCE($2, catatan_admin), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, catatan_admin || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Status request berhasil diubah ke "${status}".`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating status:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengubah status.', error: error.message });
  }
});

// ============================================================
// DELETE /:id  — Delete a request
// ============================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM request_fitur WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Request fitur berhasil dihapus.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting request:', error.message);
    res.status(500).json({ success: false, message: 'Gagal menghapus request.', error: error.message });
  }
});

// ============================================================
// GET /stats/summary  — Dashboard stats
// ============================================================
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'In Review') AS in_review,
        COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'Done') AS done,
        COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected,
        COUNT(*) FILTER (WHERE prioritas = 'Critical') AS critical,
        COUNT(*) FILTER (WHERE prioritas = 'High') AS high
      FROM request_fitur
    `);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik.', error: error.message });
  }
});

module.exports = router;
