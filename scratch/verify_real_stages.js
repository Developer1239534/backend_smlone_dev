const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT trainee_id, periode, url 
      FROM real_stage 
      WHERE trainee_id IN ('27', '863', '1025', '70100112', '966', '968')
      ORDER BY trainee_id, periode;
    `);
    console.log('Query results:');
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
