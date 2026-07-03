const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT COUNT(*) as count 
      FROM quarterly_report 
      WHERE periode = 'Jan-Apr 2026'
    `);
    console.log('Jan-Apr 2026 total count:', res.rows[0].count);

    const resTotal = await db.query(`
      SELECT COUNT(*) as count 
      FROM quarterly_report
    `);
    console.log('Total quarterly reports in database:', resTotal.rows[0].count);

    // Let's check a few specific IDs from Batch 2 (e.g. 90100056, 90100082, 70100006)
    const testIds = ['90100056', '90100082', '70100006'];
    const res2 = await db.query(`
      SELECT trainee_id, url 
      FROM quarterly_report 
      WHERE periode = 'Jan-Apr 2026' AND trainee_id = ANY($1::varchar[])
    `, [testIds]);
    console.log('Sample IDs status in quarterly_report:', res2.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
