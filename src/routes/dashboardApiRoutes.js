const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// Helper to fetch trainee and handle errors
async function getTraineeOrError(id, res) {
  try {
    const result = await db.query(
      `SELECT * FROM dashboard_trainne WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: `Trainee dengan ID ${id} tidak ditemukan.` });
      return null;
    }
    return result.rows[0];
  } catch (err) {
    console.error(`[Dashboard API Error] ID: ${id}:`, err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    return null;
  }
}

// 1. GET /dashboard/profile/:id
router.get('/profile/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      program: trainee.program,
      class: trainee.class,
      level: trainee.level,
      membership_expiry: trainee.membership_expiry,
      profile_picture: trainee.profile_picture,
      phone: trainee.phone,
      tanggal_lahir: trainee.tanggal_lahir
    }
  });
});

// 1.5 PATCH /dashboard/profile/:id - User updates their own profile
router.patch('/profile/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Explicitly prevent updating ID and Trainee Name (Read-Only)
  delete updates.id;
  delete updates.trainee_name;

  // Handle frontend camelCase aliases
  if (updates.tanggalLahir !== undefined) updates.tanggal_lahir = updates.tanggalLahir;
  if (updates.profilePicture !== undefined) updates.profile_picture = updates.profilePicture;
  if (updates.oldPassword !== undefined) updates.old_password = updates.oldPassword;

  // List of fields that a USER is allowed to update
  const allowedFields = ['profile_picture', 'phone', 'tanggal_lahir', 'password', 'old_password'];
  
  const updateData = {};
  for (const field of allowedFields) {
    // Only update if the field is actually provided and not an empty string
    if (updates[field] !== undefined && updates[field] !== '') {
      updateData[field] = updates[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, message: 'Tidak ada data valid yang diubah.' });
  }

  try {
    const check = await db.query('SELECT password FROM dashboard_trainne WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trainee tidak ditemukan.' });
    }

    const currentTrainee = check.rows[0];

    // Password Update Logic with Old Password Verification
    if (updateData.password) {
      if (!updateData.old_password) {
        return res.status(400).json({ success: false, message: 'Password lama (old_password) wajib diisi untuk mengubah password.' });
      }

      const bcrypt = require('bcryptjs');
      
      let isMatch = false;
      if (currentTrainee.password) {
        isMatch = await bcrypt.compare(updateData.old_password, currentTrainee.password);
      }
      
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Password lama yang Anda masukkan salah.' });
      }

      updateData.plain_password = updateData.password; // save plain version for admin visibility
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remove old_password from updateData so it doesn't try to save it to DB
    delete updateData.old_password;

    // If only old_password was sent but no new password, we have nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data valid yang diubah.' });
    }

    const keys = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
    const query = `UPDATE dashboard_trainne SET ${setClause} WHERE id = $${keys.length + 1} RETURNING id, trainee_name, profile_picture, phone, tanggal_lahir`;
    
    const result = await db.query(query, [...values, id]);
    res.json({ success: true, message: 'Profil berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error(`[Dashboard API] PATCH Profile Error (ID: ${id}):`, err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// 2. GET /dashboard/progress/:id
router.get('/progress/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      progress_ke_next_level: trainee.progress_ke_next_level,
      progress_video: trainee.progress_video
    }
  });
});

// 3. GET /dashboard/highlights/:id
router.get('/highlights/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      highlight_terbaru: trainee.highlight_terbaru,
      pengumuman: trainee.pengumuman
    }
  });
});

// 4. GET /dashboard/reports/:id
router.get('/reports/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      weekly_report: trainee.weekly_report,
      quarterly_report: trainee.quarterly_report
    }
  });
});

// 5. GET /dashboard/rankings/:id
router.get('/rankings/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      gold_rank: trainee.gold_rank,
      referral_code: trainee.referral_code
    }
  });
});

// 6. GET /dashboard/speaking-projects/:id
router.get('/speaking-projects/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      last_speaking_project: trainee.last_speaking_project,
      completed_speaking_project: trainee.completed_speaking_project
    }
  });
});

// 7. GET /dashboard/reports/previous/:id
router.get('/reports/previous/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      laporan_sebelumnya: trainee.laporan_sebelumnya,
      laporan_quarter_sebelumnya: trainee.laporan_quarter_sebelumnya
    }
  });
});

// 8. GET /contact/:id (Can be accessed via /contact/:id or /dashboard/contact/:id)
router.get('/contact/:id', async (req, res) => {
  const trainee = await getTraineeOrError(req.params.id, res);
  if (!trainee) return;

  res.json({
    success: true,
    data: {
      id_trainee: trainee.id,
      nama_trainee: trainee.trainee_name,
      hubungi_kami: trainee.hubungi_kami
    }
  });
});

module.exports = router;
