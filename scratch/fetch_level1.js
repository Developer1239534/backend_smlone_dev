const db = require('../src/db/neonClient');

async function fetchLevel1() {
  console.log('Fetching level_1_keseluruhan data...');
  try {
    const result = await db.query('SELECT * FROM level_1_keseluruhan ORDER BY created_at DESC');
    console.log(`Successfully fetched ${result.rows.length} rows.`);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error('Error fetching data:', e.message);
  }
  process.exit(0);
}

fetchLevel1();
