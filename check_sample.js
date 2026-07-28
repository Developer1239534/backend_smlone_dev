const db = require('./src/db/neonClient');

async function checkSampleData() {
  const sample = await db.query(`SELECT trainee_id, quarterly_report_url, real_stage_report_url, progress_video_url FROM portal_trainee WHERE quarterly_report_url IS NOT NULL LIMIT 5;`);
  console.log('Sample portal_trainee:', sample.rows);
}

checkSampleData().catch(console.error);
