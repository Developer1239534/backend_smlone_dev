const db = require('./src/db/neonClient');

async function checkCurrentHouseRankData() {
  try {
    const result = await db.query('SELECT * FROM house_rank');
    console.log('📊 Current rows in house_rank table:', result.rows);
  } catch (err) {
    console.error('Error fetching house_rank:', err);
  } finally {
    process.exit(0);
  }
}

checkCurrentHouseRankData();
