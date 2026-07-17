
const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const crypto = require('crypto');

// N8N Webhook - Insert data
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
      const student_name = (row['Student Name'] !== undefined ? row['Student Name'] : row['Student Name']) || '';
      const trainee_id = (row['ID'] !== undefined ? row['ID'] : row['ID']) || '';
      const house_1 = (row['House'] !== undefined ? row['House'] : row['House']) || '';
      const class_trainers = (row['Class Trainers'] !== undefined ? row['Class Trainers'] : row['Class Trainers']) || '';
      const date_text = (row['Date'] !== undefined ? row['Date'] : row['Date']) || '';
      const coach_feedback = (row['Coach Feedback'] !== undefined ? row['Coach Feedback'] : row['Coach Feedback']) || '';
      const challenge = (row['Challenge'] !== undefined ? row['Challenge'] : row['Challenge']) || '';
      const speaking_project = (row['Speaking Project'] !== undefined ? row['Speaking Project'] : row['Speaking Project']) || '';
      const role_2 = (row['Role 2'] !== undefined ? row['Role 2'] : row['Role 2']) || '';
      const role_3 = (row['Role 3'] !== undefined ? row['Role 3'] : row['Role 3']) || '';
      const role_4 = (row['Role 4'] !== undefined ? row['Role 4'] : row['Role 4']) || '';
      const life_project = (row['Life Project'] !== undefined ? row['Life Project'] : row['Life Project']) || '';
      const win = (row['Win'] !== undefined ? row['Win'] : row['Win']) || '';
      const fav = (row['Fav'] !== undefined ? row['Fav'] : row['Fav']) || '';
      const total_gold = (row['Total Gold'] !== undefined ? row['Total Gold'] : row['Total Gold']) || '';
      const house_2 = (row['House 2'] !== undefined ? row['House 2'] : row['House2']) || '';
      const level = (row['Level'] !== undefined ? row['Level'] : row['Level']) || '';
      const latest_speaking_project = (row['Latest Speaking Project'] !== undefined ? row['Latest Speaking Project'] : row['Latest Speaking Project']) || '';
      const last_time_speaking = (row['Last Time Speaking'] !== undefined ? row['Last Time Speaking'] : row['Last Time Speaking']) || '';
      const class_name = (row['Class'] !== undefined ? row['Class'] : row['Class']) || '';
      const raw_data = JSON.stringify(row);
      const row_hash = crypto.createHash('sha256').update(raw_data).digest('hex');

      if (!trainee_id && !student_name) {
        console.warn(`[n8n Push L2 Feedback] Skipping row ${i}: empty ID and Name.`);
        skippedCount++;
        continue;
      }

      try {
        const insertQuery = `
          INSERT INTO level_2_feedback_students (
            row_hash, student_name, trainee_id, house_1, class_trainers, date_text, coach_feedback, challenge, speaking_project, role_2, role_3, role_4, life_project, win, fav, total_gold, house_2, level, latest_speaking_project, last_time_speaking, class_name, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
          ) ON CONFLICT (row_hash) DO NOTHING;
        `;

        const result = await db.query(insertQuery, [
          row_hash, student_name, trainee_id, house_1, class_trainers, date_text, coach_feedback, challenge, speaking_project, role_2, role_3, role_4, life_project, win, fav, total_gold, house_2, level, latest_speaking_project, last_time_speaking, class_name, raw_data
        ]);
        
        if (result.rowCount > 0) {
            insertedCount++;
        } else {
            skippedCount++; // Duplicate based on hash
        }
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: student_name, error: rowError.message });
        console.error(`[n8n Push L2 Feedback] Error on row ${i} (${student_name} / ${trainee_id}):`, rowError.message);
      }
    }

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data baru, ${skippedCount} di-skip (kosong/duplikat), ${errorCount} error.`,
      details: { inserted: insertedCount, skipped: skippedCount, errors: errorCount, error_list: errors }
    });

  } catch (error) {
    console.error('[n8n Push L2 Feedback] Fatal error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Admin Panel - GET All
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM level_2_feedback_students ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching L2 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - PUT (Update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedColumns = ['student_name', 'trainee_id', 'house_1', 'class_trainers', 'date_text', 'coach_feedback', 'challenge', 'speaking_project', 'role_2', 'role_3', 'role_4', 'life_project', 'win', 'fav', 'total_gold', 'house_2', 'level', 'latest_speaking_project', 'last_time_speaking', 'class_name'];
    
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
      UPDATE level_2_feedback_students 
      SET ${setQuery.join(', ')} 
      WHERE id = $${queryIndex} RETURNING *
    `;

    const result = await db.query(updateQueryString, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating L2 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM level_2_feedback_students WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    
    res.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting L2 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
