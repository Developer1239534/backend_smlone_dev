const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// GET / - Ambil semua data feedback
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sml_feedback ORDER BY created_at DESC');
    res.json({
      success: true,
      message: 'Berhasil mengambil data SML Feedback.',
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('[SML Feedback] GET error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// GET /:id - Ambil data feedback berdasarkan trainee_id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM sml_feedback WHERE trainee_id = $1 ORDER BY created_at DESC',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data feedback untuk trainee ID: ${id}`
      });
    }
    res.json({
      success: true,
      message: 'Berhasil mengambil data feedback trainee.',
      data: result.rows
    });
  } catch (error) {
    console.error('[SML Feedback] GET by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dari database.',
      error: error.message
    });
  }
});

// DEBUG endpoint: Echo data dari n8n
router.post('/debug', (req, res) => {
  const body = req.body;
  const isArray = Array.isArray(body);
  const sample = isArray ? body[0] : body;
  res.json({
    is_array: isArray,
    total_items: isArray ? body.length : 1,
    sample_keys: sample ? Object.keys(sample) : [],
    sample_first_item: sample || null
  });
});

// POST /push - Terima dan simpan data dari n8n (bulk upsert)
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

    console.log(`[SML Feedback Push] Received ${data.length} items`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || typeof row !== 'object') {
        console.warn(`[SML Feedback Push] Skipping invalid row at index ${i}`);
        skippedCount++;
        continue;
      }

      // Map kolom dari Google Sheets / n8n ke kolom database
      const student_name   = row['Student Name']           || row['student_name']           || '';
      const trainee_id     = row['ID']                     || row['trainee_id']              || '';
      const house          = row['House']                  || row['house']                   || '';
      const class_trainers = row['Class Trainers']         || row['class_trainers']          || '';
      const date_str       = row['Date']                   || row['date']                    || '';
      const coach_feedback = row['Coach Feedback']         || row['coach_feedback']          || '';
      const challenge      = row['Challenge']              || row['challenge']               || '';
      const speaking_proj  = row['Speaking Project']       || row['speaking_project']        || '';
      const role_2         = row['Role 2']                 || row['role_2']                  || '';
      const role_3         = row['Role 3']                 || row['role_3']                  || '';
      const role_4         = row['Role 4']                 || row['role_4']                  || '';
      const life_project   = row['Life Project']           || row['life_project']            || '';
      const win            = row['Win']                    || row['win']                     || '';
      const fav            = row['Fav']                    || row['fav']                     || '';
      const total_gold     = row['Total Gold']             || row['total_gold']              || '';
      const level          = row['Level']                  || row['level']                   || '';
      const latest_speaking_project = row['Latest Speaking Project'] || row['latest_speaking_project'] || '';
      const last_time_speaking      = row['Last Time Speaking']       || row['last_time_speaking']       || '';
      const class_name     = row['Class']                  || row['class_name']              || '';
      const raw_data       = JSON.stringify(row);

      // Wajib ada student_name dan trainee_id
      if (!student_name && !trainee_id) {
        console.warn(`[SML Feedback Push] Skipping row ${i}: missing student_name AND trainee_id`);
        skippedCount++;
        continue;
      }

      try {
        await db.query(
          `INSERT INTO sml_feedback (
             student_name, trainee_id, house, class_trainers, date_str,
             coach_feedback, challenge, speaking_project, role_2, role_3,
             role_4, life_project, win, fav, total_gold, level,
             latest_speaking_project, last_time_speaking, class_name, raw_data
           ) VALUES (
             $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
             $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
           )
           ON CONFLICT (trainee_id) DO UPDATE SET
             student_name            = EXCLUDED.student_name,
             house                   = EXCLUDED.house,
             class_trainers          = EXCLUDED.class_trainers,
             date_str                = EXCLUDED.date_str,
             coach_feedback          = EXCLUDED.coach_feedback,
             challenge               = EXCLUDED.challenge,
             speaking_project        = EXCLUDED.speaking_project,
             role_2                  = EXCLUDED.role_2,
             role_3                  = EXCLUDED.role_3,
             role_4                  = EXCLUDED.role_4,
             life_project            = EXCLUDED.life_project,
             win                     = EXCLUDED.win,
             fav                     = EXCLUDED.fav,
             total_gold              = EXCLUDED.total_gold,
             level                   = EXCLUDED.level,
             latest_speaking_project = EXCLUDED.latest_speaking_project,
             last_time_speaking      = EXCLUDED.last_time_speaking,
             class_name              = EXCLUDED.class_name,
             raw_data                = EXCLUDED.raw_data`,
          [
            student_name, trainee_id, house, class_trainers, date_str,
            coach_feedback, challenge, speaking_proj, role_2, role_3,
            role_4, life_project, win, fav, total_gold, level,
            latest_speaking_project, last_time_speaking, class_name, raw_data
          ]
        );
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({
          index: i,
          trainee_id,
          student_name,
          error: rowError.message
        });
        console.error(`[SML Feedback Push] Error row ${i} (${student_name} / ${trainee_id}):`, rowError.message);
      }
    }

    console.log(`[SML Feedback Push] Done: inserted=${insertedCount}, skipped=${skippedCount}, errors=${errorCount}`);

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { insertedCount, skippedCount, errorCount, errors: errors.slice(0, 10) }
    });

  } catch (error) {
    console.error('[SML Feedback Push] Fatal error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi error saat menyimpan data.',
      error: error.message
    });
  }
});

// DELETE /:id - Hapus data berdasarkan trainee_id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM sml_feedback WHERE trainee_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada data feedback untuk trainee ID: ${id}`
      });
    }
    res.json({
      success: true,
      message: `Data feedback trainee ID ${id} berhasil dihapus.`,
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('[SML Feedback] DELETE error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data.',
      error: error.message
    });
  }
});

module.exports = router;
