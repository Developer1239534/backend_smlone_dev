const fs = require('fs');
const db = require('./src/db/neonClient');

async function main() {
  console.log('🚀 Importing Referral Codes for Cemara trainees...');

  const text = fs.readFileSync('C:/Users/ASUS ROG/.gemini/antigravity/scratch/full_request_referral.txt', 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.trim());

  const map = new Map(); // trainee_id -> referral_code
  lines.forEach(line => {
    const parts = line.split('\t').filter(p => p !== '');
    // Expected format: [id, 'REFERRAL CODE', code]
    if (parts.length >= 3) {
      const id = parts[0].trim();
      const code = parts[2].trim();
      if (id && code) {
        map.set(id, code);
      }
    }
  });

  // Fetch existing trainee IDs for Cemara branch
  const { rows: existing } = await db.query(`SELECT trainee_id FROM portal_trainee WHERE branch_id = 'cemara'`);
  const existingIds = new Set(existing.map(r => r.trainee_id));

  let updated = 0;
  let skipped = 0;
  for (const [id, code] of map.entries()) {
    if (existingIds.has(id)) {
      await db.query(`UPDATE portal_trainee SET referral_code = $1, updated_at = NOW() WHERE trainee_id = $2`, [code, id]);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log('✅ Referral code import completed.');
  console.log(`Processed entries: ${map.size}`);
  console.log(`Updated rows: ${updated}`);
  console.log(`Skipped (ID not found): ${skipped}`);
}

main().catch(err => {
  console.error('❌ Error during referral import:', err);
  process.exit(1);
});
