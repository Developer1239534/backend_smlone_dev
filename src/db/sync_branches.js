const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./neonClient');

async function main() {
  try {
    const dataPath = path.join(__dirname, 'data_cabang.txt');
    if (!fs.existsSync(dataPath)) {
      console.error(`⚠️ ERROR: data_cabang.txt not found at: ${dataPath}`);
      console.log('Please create data_cabang.txt in the root of the project and paste the data.');
      process.exit(1);
    }

    console.log('🔄 Backing up current dashboard_trainne table...');
    const backupResult = await db.query('SELECT * FROM dashboard_trainne');
    const backupPath = path.join(__dirname, 'trainee_backup_before_branches_sync.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupResult.rows, null, 2), 'utf8');
    console.log(`✅ Backup successfully saved to: ${backupPath}`);

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const lines = fileContent.split('\n');

    let currentCabang = null;
    let totalProcessed = 0;
    let updatedCount = 0;
    let insertedCount = 0;
    let passwordGeneratedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Detect branch sections
      const timorMatch = line.match(/cabang\s+timor/i);
      const trituraMatch = line.match(/cabang\s+tritura/i);
      const cemaraMatch = line.match(/cabang\s+cemara/i);

      if (timorMatch) {
        currentCabang = 'Timor';
        console.log('📍 Switching to branch: Timor');
        continue;
      } else if (trituraMatch) {
        currentCabang = 'Tritura';
        console.log('📍 Switching to branch: Tritura');
        continue;
      } else if (cemaraMatch) {
        currentCabang = 'Cemara';
        console.log('📍 Switching to branch: Cemara');
        continue;
      }

      // Parse trainee row if it starts with ID (digits)
      const cols = line.split('\t');
      const id = cols[0] ? cols[0].trim() : '';

      if (!id || isNaN(id)) {
        // Skip header lines or descriptive text
        continue;
      }

      if (!currentCabang) {
        console.warn(`⚠️ Warning: Found trainee row before any branch header: "${line}"`);
        continue;
      }

      const name = cols[1] ? cols[1].trim() : '';
      const status = cols[2] ? cols[2].trim() : 'Active';
      const youtubeLink = cols[3] ? cols[3].trim() : '';

      totalProcessed++;

      // Check if trainee exists
      const checkRes = await db.query(
        'SELECT id, password, plain_password FROM dashboard_trainne WHERE id = $1',
        [id]
      );

      if (checkRes.rows.length > 0) {
        // Trainee already exists: update progress_video and cabang (only)
        await db.query(
          'UPDATE dashboard_trainne SET progress_video = $1, cabang = $2 WHERE id = $3',
          [youtubeLink, currentCabang, id]
        );
        updatedCount++;
      } else {
        // Trainee does not exist: create credentials and insert
        const defaultPassword = `smlone${id}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        await db.query(
          `INSERT INTO dashboard_trainne (
            id, trainee_name, status, progress_video, cabang, password, plain_password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, name, status, youtubeLink, currentCabang, hashedPassword, defaultPassword]
        );
        insertedCount++;
        passwordGeneratedCount++;
      }
    }

    console.log('\n======================================');
    console.log('🎉 Branch Synchronization Complete!');
    console.log('======================================');
    console.log(`📊 Total rows parsed: ${totalProcessed}`);
    console.log(`   - Trainees Updated: ${updatedCount}`);
    console.log(`   - New Trainees Inserted: ${insertedCount}`);
    console.log(`   - Passwords Generated: ${passwordGeneratedCount}`);

    const verifyCountRes = await db.query('SELECT COUNT(*) FROM dashboard_trainne');
    console.log(`📌 Final Trainee Count in DB: ${verifyCountRes.rows[0].count}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error in sync branches execution:', err);
    process.exit(1);
  }
}

main();
