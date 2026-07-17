
const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');

// N8N Webhook - Upsert data
router.post('/push', async (req, res) => {
  try {
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }
    
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const trainee_id = row['ID'] || '';
      const student_name = row['Student Name'] || '';
      const house = row['House'] || '';
      const class_trainers = row['Class Trainers'] || '';
      const date = row['Date'] || '';
      const coach_feedback = row['Coach Feedback'] || '';
      const challenge = row['Challenge'] || '';
      const speaking_project = row['Speaking Project'] || '';
      const role_2 = row['Role 2'] || '';
      const role_3 = row['Role 3'] || '';
      const role_4 = row['Role 4'] || '';
      const life_project = row['Life Project'] || '';
      const win = row['Win'] || '';
      const fav = row['Fav'] || '';
      const total_gold = row['Total Gold'] || '';
      const level = row['Level'] || '';
      const latest_speaking_project = row['Latest Speaking Project'] || '';
      const last_time_speaking = row['Last Time Speaking'] || '';
      const class_name = row['Class'] || '';
      const raw_data = JSON.stringify(row);

      if (!trainee_id && !student_name) {
        console.warn(`[n8n Push L3 Feedback] Skipping row ${i}: empty ID and Name.`);
        skippedCount++;
        continue;
      }

      try {
        const upsertQuery = `
          INSERT INTO level_3_students_feedback (
            trainee_id, student_name, house, class_trainers, date, coach_feedback, challenge, speaking_project, role_2, role_3, role_4, life_project, win, fav, total_gold, level, latest_speaking_project, last_time_speaking, class_name, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
          ) ON CONFLICT (trainee_id) DO UPDATE SET
            student_name = EXCLUDED.student_name,
            house = EXCLUDED.house,
            class_trainers = EXCLUDED.class_trainers,
            date = EXCLUDED.date,
            coach_feedback = EXCLUDED.coach_feedback,
            challenge = EXCLUDED.challenge,
            speaking_project = EXCLUDED.speaking_project,
            role_2 = EXCLUDED.role_2,
            role_3 = EXCLUDED.role_3,
            role_4 = EXCLUDED.role_4,
            life_project = EXCLUDED.life_project,
            win = EXCLUDED.win,
            fav = EXCLUDED.fav,
            total_gold = EXCLUDED.total_gold,
            level = EXCLUDED.level,
            latest_speaking_project = EXCLUDED.latest_speaking_project,
            last_time_speaking = EXCLUDED.last_time_speaking,
            class_name = EXCLUDED.class_name,
            raw_data = EXCLUDED.raw_data,
            created_at = CURRENT_TIMESTAMP;
        `;

        await db.query(upsertQuery, [
          trainee_id, student_name, house, class_trainers, date, coach_feedback, challenge, speaking_project, role_2, role_3, role_4, life_project, win, fav, total_gold, level, latest_speaking_project, last_time_speaking, class_name, raw_data
        ]);
        
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: student_name, error: rowError.message });
        console.error(`[n8n Push L3 Feedback] Error on row ${i} (${student_name} / ${trainee_id}):`, rowError.message);
      }
    }

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { inserted: insertedCount, skipped: skippedCount, errors: errorCount, error_list: errors }
    });

  } catch (error) {
    console.error('[n8n Push L3 Feedback] Fatal error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Admin Panel - GET All
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM level_3_students_feedback ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching L3 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - PUT (Update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Allow updating all columns except id and raw_data/created_at
    const allowedColumns = ['trainee_id', 'student_name', 'house', 'class_trainers', 'date', 'coach_feedback', 'challenge', 'speaking_project', 'role_2', 'role_3', 'role_4', 'life_project', 'win', 'fav', 'total_gold', 'level', 'latest_speaking_project', 'last_time_speaking', 'class_name'];
    
    const setQuery = [];
    const values = [];
    let queryIndex = 1;

    for (const key of Object.keys(updates)) {
      if (allowedColumns.includes(key)) {
        setQuery.push(`"${key}" = $${queryIndex}`);
        values.push(updates[key]);
        queryIndex++;
      }
    }

    if (setQuery.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    values.push(id);
    const updateQueryString = `
      UPDATE level_3_students_feedback 
      SET ${setQuery.join(', ')} 
      WHERE id = $${queryIndex} RETURNING *
    `;

    const result = await db.query(updateQueryString, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating L3 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM level_3_students_feedback WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    
    res.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting L3 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
