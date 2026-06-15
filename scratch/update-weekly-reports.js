require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('🔌 Connecting to Neon database...');

    // 1. Drop duplicate column "name"
    console.log('🗑️ Dropping duplicate column "name" from dashboard_trainne table...');
    await pool.query('ALTER TABLE dashboard_trainne DROP COLUMN IF EXISTS name;');
    console.log('✅ Column "name" dropped successfully.');

    // 2. Set all weekly_report values to NULL initially (as requested: "jika belum di buat null ya")
    console.log('🔄 Resetting all weekly_report fields to NULL...');
    await pool.query('UPDATE dashboard_trainne SET weekly_report = NULL;');
    console.log('✅ weekly_report reset complete.');

    // 3. Read and parse the untruncated user request containing name and URL list
    const filePath = path.join(__dirname, 'full-request.txt');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    const reportData = [];
    const seenNames = new Set();
    let isDataSection = false;

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      // Start parsing after "Name\tWeekly Report" header
      if (cleanLine.toLowerCase().includes('name') && cleanLine.toLowerCase().includes('weekly report')) {
        isDataSection = true;
        continue;
      }

      if (!isDataSection) continue;
      if (cleanLine.startsWith('</USER_REQUEST>')) break;

      const parts = cleanLine.split(/\t+/);
      if (parts.length < 2) continue;

      const name = parts[0].trim();
      const url = parts[1].trim();

      // Deduplicate the list to prevent redundant updates
      if (!seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        reportData.push({ name, url });
      }
    }

    console.log(`\n📊 Parsed ${reportData.length} unique trainees from your list.`);

    // 4. Update the DB for each trainee in the list
    let updatedCount = 0;
    const notFound = [];

    for (const r of reportData) {
      // Find and update matching by trainee_name
      const res = await pool.query(
        `UPDATE dashboard_trainne 
         SET weekly_report = $1 
         WHERE TRIM(trainee_name) = TRIM($2)`,
        [r.url, r.name]
      );

      if (res.rowCount > 0) {
        updatedCount += res.rowCount;
      } else {
        // Fallback: search for case-insensitive match or log not found
        const fallbackRes = await pool.query(
          `UPDATE dashboard_trainne 
           SET weekly_report = $1 
           WHERE LOWER(TRIM(trainee_name)) = LOWER(TRIM($2))`,
          [r.url, r.name]
        );
        if (fallbackRes.rowCount > 0) {
          updatedCount += fallbackRes.rowCount;
        } else {
          notFound.push(r.name);
        }
      }
    }

    console.log(`\n🎉 Process Complete!`);
    console.log(`✅ Successfully updated weekly_report for ${updatedCount} trainees.`);
    if (notFound.length > 0) {
      console.log(`⚠️ Warning: ${notFound.length} trainees from the list were not found in the DB (may have different spellings):`);
      for (const name of notFound) {
        console.log(`   - ${name}`);
      }
    }

  } catch (err) {
    console.error('❌ Error during database modification:', err.message);
  } finally {
    await pool.end();
  }
}

run();
