const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to check if a trainee exists
async function traineeExists(id) {
  const result = await db.query('SELECT 1 FROM dashboard_trainne WHERE id = $1', [id]);
  return result.rows.length > 0;
}

// 1. POST /admin/announcements - Tambah Pengumuman
// Body: { id, announcement } atau { studentId, announcement }
router.post('/announcements', async (req, res) => {
  const id = req.body.id || req.body.studentId;
  const { announcement } = req.body;

  if (!id || announcement === undefined) {
    return res.status(400).json({ success: false, message: 'ID trainee dan announcement wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET pengumuman = $1 WHERE id = $2`,
      [announcement, id]
    );

    res.json({ success: true, message: 'Pengumuman berhasil ditambahkan.', data: { id, announcement } });
  } catch (err) {
    console.error('[Admin] Add Announcement error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 2. PATCH /admin/announcements/:id - Edit Pengumuman
// Body: { announcement }
router.patch('/announcements/:id', async (req, res) => {
  const { id } = req.params;
  const { announcement } = req.body;

  if (announcement === undefined) {
    return res.status(400).json({ success: false, message: 'announcement wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET pengumuman = $1 WHERE id = $2`,
      [announcement, id]
    );

    res.json({ success: true, message: 'Pengumuman berhasil diperbarui.', data: { id, announcement } });
  } catch (err) {
    console.error('[Admin] Edit Announcement error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 3. DELETE /admin/announcements/:id - Hapus Pengumuman
router.delete('/announcements/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET pengumuman = NULL WHERE id = $1`,
      [id]
    );

    res.json({ success: true, message: 'Pengumuman berhasil dihapus.', data: { id } });
  } catch (err) {
    console.error('[Admin] Delete Announcement error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 4. POST /admin/highlights - Tambah Highlight
// Body: { id, highlight } atau { studentId, highlight }
router.post('/highlights', async (req, res) => {
  const id = req.body.id || req.body.studentId;
  const highlight = req.body.highlight || req.body.highlight_terbaru;

  if (!id || highlight === undefined) {
    return res.status(400).json({ success: false, message: 'ID trainee dan highlight wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET highlight_terbaru = $1 WHERE id = $2`,
      [highlight, id]
    );

    res.json({ success: true, message: 'Highlight berhasil ditambahkan.', data: { id, highlight } });
  } catch (err) {
    console.error('[Admin] Add Highlight error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 5. PATCH /admin/highlights/:id - Edit Highlight
// Body: { highlight }
router.patch('/highlights/:id', async (req, res) => {
  const { id } = req.params;
  const highlight = req.body.highlight || req.body.highlight_terbaru;

  if (highlight === undefined) {
    return res.status(400).json({ success: false, message: 'highlight wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET highlight_terbaru = $1 WHERE id = $2`,
      [highlight, id]
    );

    res.json({ success: true, message: 'Highlight berhasil diperbarui.', data: { id, highlight } });
  } catch (err) {
    console.error('[Admin] Edit Highlight error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 6. POST /admin/reports/weekly - Upload Weekly Report
// Body: { id, weekly_report } atau { studentId, weekly_report }
router.post('/reports/weekly', async (req, res) => {
  const id = req.body.id || req.body.studentId;
  const weekly_report = req.body.weekly_report || req.body.url;

  if (!id || weekly_report === undefined) {
    return res.status(400).json({ success: false, message: 'ID trainee dan weekly_report / url wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET weekly_report = $1 WHERE id = $2`,
      [weekly_report, id]
    );

    res.json({ success: true, message: 'Weekly Report berhasil diupload/diperbarui.', data: { id, weekly_report } });
  } catch (err) {
    console.error('[Admin] Upload Weekly Report error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 7. POST /admin/reports/quarterly - Upload Quarterly Report
// Body: { id, quarterly_report } atau { studentId, quarterly_report }
router.post('/reports/quarterly', async (req, res) => {
  const id = req.body.id || req.body.studentId;
  const quarterly_report = req.body.quarterly_report || req.body.url;

  if (!id || quarterly_report === undefined) {
    return res.status(400).json({ success: false, message: 'ID trainee dan quarterly_report / url wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET quarterly_report = $1 WHERE id = $2`,
      [quarterly_report, id]
    );

    res.json({ success: true, message: 'Quarterly Report berhasil diupload/diperbarui.', data: { id, quarterly_report } });
  } catch (err) {
    console.error('[Admin] Upload Quarterly Report error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 8. PATCH /admin/students/:id/progress - Update Progress Student
// Body: { progress_ke_next_level, progress_video }
router.patch('/students/:id/progress', async (req, res) => {
  const { id } = req.params;
  const progress_ke_next_level = req.body.progress_ke_next_level || req.body.progress;
  const { progress_video } = req.body;

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    // Dynamic update depending on fields provided
    let query = 'UPDATE dashboard_trainne SET ';
    const params = [];
    const fields = [];

    if (progress_ke_next_level !== undefined) {
      params.push(progress_ke_next_level);
      fields.push(`progress_ke_next_level = $${params.length}`);
    }
    if (progress_video !== undefined) {
      params.push(progress_video);
      fields.push(`progress_video = $${params.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data progress yang dikirim untuk diupdate.' });
    }

    params.push(id);
    query += fields.join(', ') + ` WHERE id = $${params.length}`;

    await db.query(query, params);

    res.json({ success: true, message: 'Progress student berhasil diperbarui.', data: { id, progress_ke_next_level, progress_video } });
  } catch (err) {
    console.error('[Admin] Update Progress error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 9. PATCH /admin/students/:id/level - Update Level Student
// Body: { level }
router.patch('/students/:id/level', async (req, res) => {
  const { id } = req.params;
  const { level } = req.body;

  if (level === undefined) {
    return res.status(400).json({ success: false, message: 'level wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET level = $1 WHERE id = $2`,
      [level, id]
    );

    res.json({ success: true, message: 'Level student berhasil diperbarui.', data: { id, level } });
  } catch (err) {
    console.error('[Admin] Update Level error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 10. PATCH /admin/students/:id/membership - Update Membership Expiry
// Body: { membership_expiry }
router.patch('/students/:id/membership', async (req, res) => {
  const { id } = req.params;
  const { membership_expiry } = req.body;

  if (membership_expiry === undefined) {
    return res.status(400).json({ success: false, message: 'membership_expiry wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    await db.query(
      `UPDATE dashboard_trainne SET membership_expiry = $1 WHERE id = $2`,
      [membership_expiry, id]
    );

    res.json({ success: true, message: 'Membership expiry berhasil diperbarui.', data: { id, membership_expiry } });
  } catch (err) {
    console.error('[Admin] Update Membership error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// 11. POST /admin/speaking-projects - Tambah Speaking Project
// Body: { id, last_speaking_project, completed_speaking_project } atau { studentId, ... }
router.post('/speaking-projects', async (req, res) => {
  const id = req.body.id || req.body.studentId;
  const { last_speaking_project, completed_speaking_project } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID trainee wajib diisi.' });
  }

  try {
    const exists = await traineeExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
    }

    let query = 'UPDATE dashboard_trainne SET ';
    const params = [];
    const fields = [];

    if (last_speaking_project !== undefined) {
      params.push(last_speaking_project);
      fields.push(`last_speaking_project = $${params.length}`);
    }
    if (completed_speaking_project !== undefined) {
      params.push(completed_speaking_project);
      fields.push(`completed_speaking_project = $${params.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data speaking project yang dikirim.' });
    }

    params.push(id);
    query += fields.join(', ') + ` WHERE id = $${params.length}`;

    await db.query(query, params);

    res.json({ success: true, message: 'Speaking Project berhasil ditambahkan/diperbarui.', data: { id, last_speaking_project, completed_speaking_project } });
  } catch (err) {
    console.error('[Admin] Speaking Project error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
