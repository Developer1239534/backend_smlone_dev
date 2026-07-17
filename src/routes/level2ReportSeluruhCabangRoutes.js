
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
      const name = row['Name'] || '';
      const branch = row['BRANCH'] || '';
      const membership_expiry_date = row['Membership Expiry Date'] || '';
      const active_expired = row['Active/ Expired'] || '';
      const cleaned_program = row['Cleaned Program'] || '';
      const cleaned_class = row['Cleaned Class'] || '';
      const house = row['House'] || '';
      const students_report_link = row['Students Report Link'] || '';
      const id_vs_student_report_link = row['ID vs Student Report Link'] || '';
      const total_gold = row['Total Gold'] || '';
      const level = row['Level'] || '';
      const l1_sproject_1 = row['L1. S.Project 1'] || '';
      const l1_sproject_2 = row['L1. S.Project 2'] || '';
      const l1_sproject_3 = row['L1. S.Project 3'] || '';
      const l1_sproject_4 = row['L1. S.Project 4'] || '';
      const l1_sproject_5 = row['L1. S.Project 5'] || '';
      const l1_sproject_6 = row['L1. S.Project 6'] || '';
      const l1_sproject_7 = row['L1. S.Project 7'] || '';
      const l1_sproject_8 = row['L1. S.Project 8'] || '';
      const l2_sproject_1 = row['L2. S.Project 1'] || '';
      const l2_sproject_2 = row['L2. S.Project 2'] || '';
      const l2_sproject_3 = row['L2. S.Project 3'] || '';
      const l2_sproject_4 = row['L2. S.Project 4'] || '';
      const l2_sproject_5 = row['L2. S.Project 5'] || '';
      const l2_sproject_6 = row['L2. S.Project 6'] || '';
      const l2_sproject_7 = row['L2. S.Project 7'] || '';
      const l2_sproject_8 = row['L2. S.Project 8'] || '';
      const l2_sproject_9 = row['L2. S.Project 9'] || '';
      const l2_sproject_10 = row['L2. S.Project 10'] || '';
      const l3_sproject_1 = row['L3. S.Project 1'] || '';
      const l3_sproject_2 = row['L3. S.Project 2'] || '';
      const l3_sproject_3 = row['L3. S.Project 3'] || '';
      const l3_sproject_4 = row['L3. S.Project 4'] || '';
      const l3_sproject_5 = row['L3. S.Project 5'] || '';
      const l3_sproject_6 = row['L3. S.Project 6'] || '';
      const l3_sproject_7 = row['L3. S.Project 7'] || '';
      const l3_sproject_8 = row['L3. S.Project 8'] || '';
      const l3_sproject_9 = row['L3. S.Project 9'] || '';
      const l3_sproject_10 = row['L3. S.Project 10'] || '';
      const l4_sproject_1 = row['L4. S.Project 1'] || '';
      const l4_sproject_2 = row['L4. S.Project 2'] || '';
      const l4_sproject_3 = row['L4. S.Project 3'] || '';
      const l4_sproject_4 = row['L4. S.Project 4'] || '';
      const l4_sproject_5 = row['L4. S.Project 5'] || '';
      const l4_sproject_6 = row['L4. S.Project 6'] || '';
      const l4_sproject_7 = row['L4. S.Project 7'] || '';
      const l4_sproject_8 = row['L4. S.Project 8'] || '';
      const l4_sproject_9 = row['L4. S.Project 9'] || '';
      const l4_sproject_10 = row['L4. S.Project 10'] || '';
      const l5_sproject_1 = row['L5. S.Project 1'] || '';
      const l5_sproject_2 = row['L5. S.Project 2'] || '';
      const l5_sproject_3 = row['L5. S.Project 3'] || '';
      const l5_sproject_4 = row['L5. S.Project 4'] || '';
      const l5_sproject_5 = row['L5. S.Project 5'] || '';
      const l5_sproject_6 = row['L5. S.Project 6'] || '';
      const l5_sproject_7 = row['L5. S.Project 7'] || '';
      const l5_sproject_8 = row['L5. S.Project 8'] || '';
      const l5_sproject_9 = row['L5. S.Project 9'] || '';
      const l5_sproject_10 = row['L5. S.Project 10'] || '';
      const l6_sproject_1 = row['L6. S.Project 1'] || '';
      const l6_sproject_2 = row['L6. S.Project 2'] || '';
      const l6_sproject_3 = row['L6. S.Project 3'] || '';
      const l6_sproject_4 = row['L6. S.Project 4'] || '';
      const l6_sproject_5 = row['L6. S.Project 5'] || '';
      const l6_sproject_6 = row['L6. S.Project 6'] || '';
      const l6_sproject_7 = row['L6. S.Project 7'] || '';
      const l6_sproject_8 = row['L6. S.Project 8'] || '';
      const l6_sproject_9 = row['L6. S.Project 9'] || '';
      const l6_sproject_10 = row['L6. S.Project 10'] || '';
      const latest_speaking_project = row['Latest Speaking Project'] || '';
      const speaking_project_to_next_level = row['Speaking Project to Next Level'] || '';
      const level_6_link = row['Level 6 Link'] || '';
      const last_speaker_date = row['Last Speaker date'] || '';
      const last_life_project_date = row['Last Life Project date'] || '';
      const last_life_project = row['Last Life Project'] || '';
      const last_attendance = row['Last Attendance'] || '';
      const raw_data = JSON.stringify(row);

      if (!trainee_id && !name) {
        console.warn(`[n8n Push L2 Report] Skipping row ${i}: empty ID and Name.`);
        skippedCount++;
        continue;
      }

      try {
        const upsertQuery = `
          INSERT INTO level_2_report_seluruh_cabang (
            trainee_id, name, branch, membership_expiry_date, active_expired, cleaned_program, cleaned_class, house, students_report_link, id_vs_student_report_link, total_gold, level, l1_sproject_1, l1_sproject_2, l1_sproject_3, l1_sproject_4, l1_sproject_5, l1_sproject_6, l1_sproject_7, l1_sproject_8, l2_sproject_1, l2_sproject_2, l2_sproject_3, l2_sproject_4, l2_sproject_5, l2_sproject_6, l2_sproject_7, l2_sproject_8, l2_sproject_9, l2_sproject_10, l3_sproject_1, l3_sproject_2, l3_sproject_3, l3_sproject_4, l3_sproject_5, l3_sproject_6, l3_sproject_7, l3_sproject_8, l3_sproject_9, l3_sproject_10, l4_sproject_1, l4_sproject_2, l4_sproject_3, l4_sproject_4, l4_sproject_5, l4_sproject_6, l4_sproject_7, l4_sproject_8, l4_sproject_9, l4_sproject_10, l5_sproject_1, l5_sproject_2, l5_sproject_3, l5_sproject_4, l5_sproject_5, l5_sproject_6, l5_sproject_7, l5_sproject_8, l5_sproject_9, l5_sproject_10, l6_sproject_1, l6_sproject_2, l6_sproject_3, l6_sproject_4, l6_sproject_5, l6_sproject_6, l6_sproject_7, l6_sproject_8, l6_sproject_9, l6_sproject_10, latest_speaking_project, speaking_project_to_next_level, level_6_link, last_speaker_date, last_life_project_date, last_life_project, last_attendance, raw_data
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78
          ) ON CONFLICT (trainee_id) DO UPDATE SET
            name = EXCLUDED.name,
            branch = EXCLUDED.branch,
            membership_expiry_date = EXCLUDED.membership_expiry_date,
            active_expired = EXCLUDED.active_expired,
            cleaned_program = EXCLUDED.cleaned_program,
            cleaned_class = EXCLUDED.cleaned_class,
            house = EXCLUDED.house,
            students_report_link = EXCLUDED.students_report_link,
            id_vs_student_report_link = EXCLUDED.id_vs_student_report_link,
            total_gold = EXCLUDED.total_gold,
            level = EXCLUDED.level,
            l1_sproject_1 = EXCLUDED.l1_sproject_1,
            l1_sproject_2 = EXCLUDED.l1_sproject_2,
            l1_sproject_3 = EXCLUDED.l1_sproject_3,
            l1_sproject_4 = EXCLUDED.l1_sproject_4,
            l1_sproject_5 = EXCLUDED.l1_sproject_5,
            l1_sproject_6 = EXCLUDED.l1_sproject_6,
            l1_sproject_7 = EXCLUDED.l1_sproject_7,
            l1_sproject_8 = EXCLUDED.l1_sproject_8,
            l2_sproject_1 = EXCLUDED.l2_sproject_1,
            l2_sproject_2 = EXCLUDED.l2_sproject_2,
            l2_sproject_3 = EXCLUDED.l2_sproject_3,
            l2_sproject_4 = EXCLUDED.l2_sproject_4,
            l2_sproject_5 = EXCLUDED.l2_sproject_5,
            l2_sproject_6 = EXCLUDED.l2_sproject_6,
            l2_sproject_7 = EXCLUDED.l2_sproject_7,
            l2_sproject_8 = EXCLUDED.l2_sproject_8,
            l2_sproject_9 = EXCLUDED.l2_sproject_9,
            l2_sproject_10 = EXCLUDED.l2_sproject_10,
            l3_sproject_1 = EXCLUDED.l3_sproject_1,
            l3_sproject_2 = EXCLUDED.l3_sproject_2,
            l3_sproject_3 = EXCLUDED.l3_sproject_3,
            l3_sproject_4 = EXCLUDED.l3_sproject_4,
            l3_sproject_5 = EXCLUDED.l3_sproject_5,
            l3_sproject_6 = EXCLUDED.l3_sproject_6,
            l3_sproject_7 = EXCLUDED.l3_sproject_7,
            l3_sproject_8 = EXCLUDED.l3_sproject_8,
            l3_sproject_9 = EXCLUDED.l3_sproject_9,
            l3_sproject_10 = EXCLUDED.l3_sproject_10,
            l4_sproject_1 = EXCLUDED.l4_sproject_1,
            l4_sproject_2 = EXCLUDED.l4_sproject_2,
            l4_sproject_3 = EXCLUDED.l4_sproject_3,
            l4_sproject_4 = EXCLUDED.l4_sproject_4,
            l4_sproject_5 = EXCLUDED.l4_sproject_5,
            l4_sproject_6 = EXCLUDED.l4_sproject_6,
            l4_sproject_7 = EXCLUDED.l4_sproject_7,
            l4_sproject_8 = EXCLUDED.l4_sproject_8,
            l4_sproject_9 = EXCLUDED.l4_sproject_9,
            l4_sproject_10 = EXCLUDED.l4_sproject_10,
            l5_sproject_1 = EXCLUDED.l5_sproject_1,
            l5_sproject_2 = EXCLUDED.l5_sproject_2,
            l5_sproject_3 = EXCLUDED.l5_sproject_3,
            l5_sproject_4 = EXCLUDED.l5_sproject_4,
            l5_sproject_5 = EXCLUDED.l5_sproject_5,
            l5_sproject_6 = EXCLUDED.l5_sproject_6,
            l5_sproject_7 = EXCLUDED.l5_sproject_7,
            l5_sproject_8 = EXCLUDED.l5_sproject_8,
            l5_sproject_9 = EXCLUDED.l5_sproject_9,
            l5_sproject_10 = EXCLUDED.l5_sproject_10,
            l6_sproject_1 = EXCLUDED.l6_sproject_1,
            l6_sproject_2 = EXCLUDED.l6_sproject_2,
            l6_sproject_3 = EXCLUDED.l6_sproject_3,
            l6_sproject_4 = EXCLUDED.l6_sproject_4,
            l6_sproject_5 = EXCLUDED.l6_sproject_5,
            l6_sproject_6 = EXCLUDED.l6_sproject_6,
            l6_sproject_7 = EXCLUDED.l6_sproject_7,
            l6_sproject_8 = EXCLUDED.l6_sproject_8,
            l6_sproject_9 = EXCLUDED.l6_sproject_9,
            l6_sproject_10 = EXCLUDED.l6_sproject_10,
            latest_speaking_project = EXCLUDED.latest_speaking_project,
            speaking_project_to_next_level = EXCLUDED.speaking_project_to_next_level,
            level_6_link = EXCLUDED.level_6_link,
            last_speaker_date = EXCLUDED.last_speaker_date,
            last_life_project_date = EXCLUDED.last_life_project_date,
            last_life_project = EXCLUDED.last_life_project,
            last_attendance = EXCLUDED.last_attendance,
            raw_data = EXCLUDED.raw_data,
            created_at = CURRENT_TIMESTAMP;
        `;

        await db.query(upsertQuery, [
          trainee_id, name, branch, membership_expiry_date, active_expired, cleaned_program, cleaned_class, house, students_report_link, id_vs_student_report_link, total_gold, level, l1_sproject_1, l1_sproject_2, l1_sproject_3, l1_sproject_4, l1_sproject_5, l1_sproject_6, l1_sproject_7, l1_sproject_8, l2_sproject_1, l2_sproject_2, l2_sproject_3, l2_sproject_4, l2_sproject_5, l2_sproject_6, l2_sproject_7, l2_sproject_8, l2_sproject_9, l2_sproject_10, l3_sproject_1, l3_sproject_2, l3_sproject_3, l3_sproject_4, l3_sproject_5, l3_sproject_6, l3_sproject_7, l3_sproject_8, l3_sproject_9, l3_sproject_10, l4_sproject_1, l4_sproject_2, l4_sproject_3, l4_sproject_4, l4_sproject_5, l4_sproject_6, l4_sproject_7, l4_sproject_8, l4_sproject_9, l4_sproject_10, l5_sproject_1, l5_sproject_2, l5_sproject_3, l5_sproject_4, l5_sproject_5, l5_sproject_6, l5_sproject_7, l5_sproject_8, l5_sproject_9, l5_sproject_10, l6_sproject_1, l6_sproject_2, l6_sproject_3, l6_sproject_4, l6_sproject_5, l6_sproject_6, l6_sproject_7, l6_sproject_8, l6_sproject_9, l6_sproject_10, latest_speaking_project, speaking_project_to_next_level, level_6_link, last_speaker_date, last_life_project_date, last_life_project, last_attendance, raw_data
        ]);
        
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: name, error: rowError.message });
        console.error(`[n8n Push L2 Report] Error on row ${i} (${name} / ${trainee_id}):`, rowError.message);
      }
    }

    res.json({
      success: true,
      message: `Berhasil menyimpan ${insertedCount} data, ${skippedCount} di-skip, ${errorCount} error.`,
      details: { inserted: insertedCount, skipped: skippedCount, errors: errorCount, error_list: errors }
    });

  } catch (error) {
    console.error('[n8n Push L2 Report] Fatal error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Admin Panel - GET All
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM level_2_report_seluruh_cabang ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching L2 reports:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - PUT (Update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Allow updating all columns except id and raw_data/created_at
    const allowedColumns = ['trainee_id', 'name', 'branch', 'membership_expiry_date', 'active_expired', 'cleaned_program', 'cleaned_class', 'house', 'students_report_link', 'id_vs_student_report_link', 'total_gold', 'level', 'l1_sproject_1', 'l1_sproject_2', 'l1_sproject_3', 'l1_sproject_4', 'l1_sproject_5', 'l1_sproject_6', 'l1_sproject_7', 'l1_sproject_8', 'l2_sproject_1', 'l2_sproject_2', 'l2_sproject_3', 'l2_sproject_4', 'l2_sproject_5', 'l2_sproject_6', 'l2_sproject_7', 'l2_sproject_8', 'l2_sproject_9', 'l2_sproject_10', 'l3_sproject_1', 'l3_sproject_2', 'l3_sproject_3', 'l3_sproject_4', 'l3_sproject_5', 'l3_sproject_6', 'l3_sproject_7', 'l3_sproject_8', 'l3_sproject_9', 'l3_sproject_10', 'l4_sproject_1', 'l4_sproject_2', 'l4_sproject_3', 'l4_sproject_4', 'l4_sproject_5', 'l4_sproject_6', 'l4_sproject_7', 'l4_sproject_8', 'l4_sproject_9', 'l4_sproject_10', 'l5_sproject_1', 'l5_sproject_2', 'l5_sproject_3', 'l5_sproject_4', 'l5_sproject_5', 'l5_sproject_6', 'l5_sproject_7', 'l5_sproject_8', 'l5_sproject_9', 'l5_sproject_10', 'l6_sproject_1', 'l6_sproject_2', 'l6_sproject_3', 'l6_sproject_4', 'l6_sproject_5', 'l6_sproject_6', 'l6_sproject_7', 'l6_sproject_8', 'l6_sproject_9', 'l6_sproject_10', 'latest_speaking_project', 'speaking_project_to_next_level', 'level_6_link', 'last_speaker_date', 'last_life_project_date', 'last_life_project', 'last_attendance'];
    
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
      UPDATE level_2_report_seluruh_cabang 
      SET ${setQuery.join(', ')} 
      WHERE id = $${queryIndex} RETURNING *
    `;

    const result = await db.query(updateQueryString, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating L2 report:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM level_2_report_seluruh_cabang WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    
    res.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting L2 report:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
