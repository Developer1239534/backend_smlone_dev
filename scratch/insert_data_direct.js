const fs = require('fs');
const db = require('../src/db/neonClient');
const crypto = require('crypto');

async function insertData() {
  try {
    const data = fs.readFileSync('scratch/user_data.tsv', 'utf8');
    const lines = data.split('\n');

    const headers = [
      'Student Name', 'ID', 'House', 'Class Trainers', 'Date', 'Coach Feedback', 
      'Challenge', 'Speaking Project', 'Role 2', 'Role 3', 'Role 4', 'Life Project', 
      'Win', 'Fav', '', 'Total Gold', 'House 2', 'Level', 'Latest Speaking Project', 
      'Last Time Speaking', 'Class', '', ''
    ];

    const records = [];

    // Skip line 1 because it's a corrupted header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].replace(/\r/g, '');
      if (!line.trim()) continue;
      
      const cols = line.split('\t');
      if (cols.length < 2) continue;
      
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j]) {
          record[headers[j]] = cols[j] || '';
        }
      }
      
      if (record['Student Name'] || record['ID']) {
        records.push(record);
      }
    }

    console.log(`Parsed ${records.length} records. Inserting directly to database...`);
    
    let inserted = 0;
    let skipped = 0;

    for (const row of records) {
      const trainee_id = row['ID'] || '';
      const student_name = row['Student Name'] || '';
      const house_1 = row['House'] || '';
      const class_trainers = row['Class Trainers'] || '';
      const date_text = row['Date'] || '';
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
      const house_2 = row['House 2'] || '';
      const level = row['Level'] || '';
      const latest_speaking_project = row['Latest Speaking Project'] || '';
      const last_time_speaking = row['Last Time Speaking'] || '';
      const class_name = row['Class'] || '';
      
      const raw_data = JSON.stringify(row);
      const row_hash = crypto.createHash('sha256').update(raw_data).digest('hex');

      const insertQuery = `
        INSERT INTO level_2_feedback_students (
          row_hash, trainee_id, student_name, house_1, class_trainers, date_text, coach_feedback, 
          challenge, speaking_project, role_2, role_3, role_4, life_project, win, fav, 
          total_gold, house_2, level, latest_speaking_project, last_time_speaking, class_name, raw_data
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) ON CONFLICT (row_hash) DO NOTHING;
      `;

      const result = await db.query(insertQuery, [
        row_hash, trainee_id, student_name, house_1, class_trainers, date_text, coach_feedback, 
        challenge, speaking_project, role_2, role_3, role_4, life_project, win, fav, 
        total_gold, house_2, level, latest_speaking_project, last_time_speaking, class_name, raw_data
      ]);

      if (result.rowCount > 0) inserted++;
      else skipped++;
    }

    console.log(`Success! Inserted: ${inserted}, Skipped (Duplicate): ${skipped}`);

  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    process.exit(0);
  }
}

insertData();
