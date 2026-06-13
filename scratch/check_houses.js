const db = require('../src/db/neonClient');

async function checkHouses() {
  try {
    const result = await db.query('SELECT DISTINCT house_sml FROM dashboard_trainne ORDER BY house_sml;');
    console.log('Unique house_sml values in DB:', result.rows.map(r => r.house_sml));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkHouses();
