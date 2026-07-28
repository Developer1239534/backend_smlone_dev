const fs = require('fs');
const db = require('./src/db/neonClient');

async function main() {
  console.log('🚀 Importing Real Stage reports for Cemara trainees...');

  const text = fs.readFileSync('C:/Users/ASUS ROG/.gemini/antigravity/scratch/full_request_real_stage.txt', 'utf8');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const idMap = new Map(); // id -> {url, stage}
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\d+$/.test(line)) {
      const id = line;
      const stageLine = lines[i + 1] || '';
      const urlLine = lines[i + 2] || '';
      const stageMatch = stageLine.match(/Real Stage (\d+)/i);
      const urlMatch = urlLine.match(/https?:\/\/[^\s\]\)]+/);
      if (urlMatch) {
        idMap.set(id, { url: urlMatch[0], stage: stageMatch ? stageMatch[1] : null });
      }
      i += 2; // skip the next two lines we just processed
    }
  }

  console.log(`📌 Parsed ${idMap.size} unique Real Stage entries.`);

  // Fetch existing trainee IDs
  const existingRes = await db.query('SELECT trainee_id FROM portal_trainee');
  const dbIds = new Set(existingRes.rows.map(r => r.trainee_id));

  let updated = 0;
  let skipped = 0;

  for (const [id, { url, stage }] of idMap.entries()) {
    if (dbIds.has(id)) {
      await db.query(`
        UPDATE portal_trainee
        SET real_stage_report_url = $1,
            updated_at = CURRENT_TIMESTAMP,
            branch_id = COALESCE(branch_id, 'cemara')
        WHERE trainee_id = $2
      `, [url, id]);
      // Optionally we could store stage number in another column if needed.
      updated++;
    } else {
      skipped++;
    }
  }

  console.log('\n🎉 Real Stage import completed:');
  console.log(`- Records updated: ${updated}`);
  console.log(`- IDs not found in DB (skipped): ${skipped}`);

  const totalWithRS = await db.query('SELECT COUNT(*) FROM portal_trainee WHERE real_stage_report_url IS NOT NULL');
  console.log('\n📊 Verification:');
  console.log(`- Total trainees with real_stage_report_url: ${totalWithRS.rows[0].count}`);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error during Real Stage import:', err);
  process.exit(1);
});
