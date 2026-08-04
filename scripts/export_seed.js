const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  console.log('📦 Exporting all 1,165+ report_trainee rows to seed_report_trainee.json...');
  const res = await db.query('SELECT id, trainee_id, report_title, link_yt, report_title_2, link_term, link_terms, report_title_3, link_to_report, link_reports_3, report_title_4, referral_code FROM report_trainee ORDER BY id ASC');
  
  console.log(`Fetched ${res.rows.length} rows.`);
  const jsonPath = path.join(__dirname, 'seed_report_trainee.json');
  fs.writeFileSync(jsonPath, JSON.stringify(res.rows, null, 2), 'utf8');
  console.log('Saved seed_report_trainee.json successfully! File size:', fs.statSync(jsonPath).size);

  process.exit(0);
}

main().catch(console.error);
