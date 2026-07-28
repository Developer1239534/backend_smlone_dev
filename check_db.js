const db = require('./src/db/neonClient');

async function main() {
  const cols = await db.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'portal_trainee'"
  );
  console.log('=== KOLOM portal_trainee ===');
  cols.rows.forEach(r => console.log(' -', r.column_name));

  const counts = await db.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(progress_video_url) as video,
      COUNT(quarterly_report_url) as quarterly,
      COUNT(real_stage_report_url) as realstage,
      COUNT(referral_code) as referral
    FROM portal_trainee
  `);
  console.log('\n=== COUNT PER KOLOM ===');
  console.table(counts.rows);

  const sample = await db.query(`
    SELECT trainee_id, branch_id,
      CASE WHEN progress_video_url IS NOT NULL THEN 'ADA' ELSE 'NULL' END as video,
      CASE WHEN quarterly_report_url IS NOT NULL THEN 'ADA' ELSE 'NULL' END as quarterly,
      CASE WHEN real_stage_report_url IS NOT NULL THEN 'ADA' ELSE 'NULL' END as realstage,
      CASE WHEN referral_code IS NOT NULL THEN 'ADA' ELSE 'NULL' END as referral
    FROM portal_trainee
    LIMIT 10
  `);
  console.log('\n=== SAMPLE 10 BARIS ===');
  console.table(sample.rows);
}

main().catch(console.error);
