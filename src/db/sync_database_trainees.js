const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./neonClient');

async function main() {
  try {
    console.log('🔄 Backing up current dashboard_trainne table...');
    const backupResult = await db.query('SELECT * FROM dashboard_trainne');
    const backupPath = path.join(__dirname, 'trainee_backup_before_sync.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupResult.rows, null, 2), 'utf8');
    console.log(`✅ Backup successfully saved to: ${backupPath}`);

    // Read and parse raw trainee data
    const rawDataPath = path.join(__dirname, 'data_trainee_raw.txt');
    if (!fs.existsSync(rawDataPath)) {
      throw new Error(`data_trainee_raw.txt not found at ${rawDataPath}`);
    }

    const fileContent = fs.readFileSync(rawDataPath, 'utf8');
    const lines = fileContent.split('\n');
    const trainees = [];
    const idsSet = new Set();

    console.log('Parsing trainee raw data...');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const columns = line.split('\t');
      if (columns.length < 3) continue;

      const id = columns[0].trim();
      const name = columns[1].trim();
      const status = columns[2].trim();

      // Skip empty or invalid header/blank rows
      if (!id || isNaN(id) || !name) {
        continue;
      }

      const program = columns[3] ? columns[3].trim() : '';
      const className = columns[4] ? columns[4].trim() : '';
      const level = columns[5] ? columns[5].trim() : '';
      const membershipExpiry = columns[6] ? columns[6].trim() : '';
      const lastSpeakingProject = columns[7] ? columns[7].trim() : '';
      const tautanTambahan = columns[11] ? columns[11].trim() : '';

      trainees.push({
        id,
        name,
        status,
        program,
        class: className,
        level,
        membershipExpiry,
        lastSpeakingProject,
        tautanTambahan
      });
      idsSet.add(id);
    }

    console.log(`📋 Parsed ${trainees.length} trainees from data_trainee_raw.txt.`);

    if (trainees.length === 0) {
      throw new Error('No valid trainees parsed. Aborting sync.');
    }

    // Deleting excess trainees (IDs not in the parsed set)
    console.log('🗑️ Deleting trainees not in the parsed list...');
    const validIds = Array.from(idsSet);
    const deleteResult = await db.query(
      'DELETE FROM dashboard_trainne WHERE id NOT IN (SELECT unnest($1::varchar[]))',
      [validIds]
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} trainees not in the list.`);

    let insertedCount = 0;
    let updatedCount = 0;
    let passwordGeneratedCount = 0;

    console.log('🔄 Upserting trainees and managing credentials...');
    for (const trainee of trainees) {
      // Check if trainee exists in database
      const checkResult = await db.query(
        'SELECT id, password, plain_password FROM dashboard_trainne WHERE id = $1',
        [trainee.id]
      );

      let needsPasswordGen = false;
      let passwordToUse = null;
      let hashedPasswordToUse = null;

      if (checkResult.rows.length === 0) {
        // New Trainee
        needsPasswordGen = true;
        insertedCount++;
      } else {
        // Existing Trainee
        const dbTrainee = checkResult.rows[0];
        if (!dbTrainee.password || !dbTrainee.plain_password) {
          needsPasswordGen = true;
        }
        updatedCount++;
      }

      if (needsPasswordGen) {
        passwordToUse = `smlone${trainee.id}`;
        const salt = await bcrypt.genSalt(10);
        hashedPasswordToUse = await bcrypt.hash(passwordToUse, salt);
        passwordGeneratedCount++;
      }

      if (checkResult.rows.length === 0) {
        // INSERT new trainee
        await db.query(
          `INSERT INTO dashboard_trainne (
            id, trainee_name, status, program, class, level, membership_expiry,
            last_speaking_project, tautan_tambahan,
            password, plain_password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            trainee.id, trainee.name, trainee.status, trainee.program, trainee.class, trainee.level, trainee.membershipExpiry,
            trainee.lastSpeakingProject, trainee.tautanTambahan,
            hashedPasswordToUse, passwordToUse
          ]
        );
      } else {
        // UPDATE existing trainee (do not touch passwords if they already exist, do not touch profile_picture, tanggal_lahir, phone)
        if (needsPasswordGen) {
          await db.query(
            `UPDATE dashboard_trainne SET
              trainee_name = $1, status = $2, program = $3, class = $4, level = $5, membership_expiry = $6,
              last_speaking_project = $7, tautan_tambahan = $8,
              password = $9, plain_password = $10
             WHERE id = $11`,
            [
              trainee.name, trainee.status, trainee.program, trainee.class, trainee.level, trainee.membershipExpiry,
              trainee.lastSpeakingProject, trainee.tautanTambahan,
              hashedPasswordToUse, passwordToUse, trainee.id
            ]
          );
        } else {
          await db.query(
            `UPDATE dashboard_trainne SET
              trainee_name = $1, status = $2, program = $3, class = $4, level = $5, membership_expiry = $6,
              last_speaking_project = $7, tautan_tambahan = $8
             WHERE id = $9`,
            [
              trainee.name, trainee.status, trainee.program, trainee.class, trainee.level, trainee.membershipExpiry,
              trainee.lastSpeakingProject, trainee.tautanTambahan,
              trainee.id
            ]
          );
        }
      }
    }

    console.log('✅ Sync Completed successfully.');
    console.log(`📊 Statistics:`);
    console.log(`   - Total Processed from file: ${trainees.length}`);
    console.log(`   - Trainees Inserted: ${insertedCount}`);
    console.log(`   - Trainees Updated: ${updatedCount}`);
    console.log(`   - Passwords Generated: ${passwordGeneratedCount}`);

    // Verify database row count
    const countResult = await db.query('SELECT COUNT(*) FROM dashboard_trainne');
    const dbCount = parseInt(countResult.rows[0].count);
    console.log(`📌 Total Trainees in Database: ${dbCount}`);

    if (dbCount !== trainees.length) {
      console.warn(`⚠️ WARNING: Database count (${dbCount}) does not match expected parsed count (${trainees.length})!`);
    } else {
      console.log(`🎉 Database count matches expected count exactly: ${dbCount}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during synchronization:', err);
    process.exit(1);
  }
}

main();
