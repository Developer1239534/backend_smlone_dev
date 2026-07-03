const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT trainee_id, periode, url, created_at
      FROM real_stage
      ORDER BY trainee_id, periode
    `);
    console.log(`Total rows in real_stage: ${res.rows.length}`);
    
    // Print all rows where url contains 'test' or doesn't start with http
    const fakeRows = res.rows.filter(r => !r.url || r.url.includes('test') || !r.url.startsWith('http'));
    console.log('Fake or unusual rows:', fakeRows);

    // Let's also see what periods exist
    const periods = [...new Set(res.rows.map(r => r.periode))];
    console.log('Unique periods in real_stage:', periods);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
