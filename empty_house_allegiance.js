const db = require('./src/db/neonClient');

async function emptyHouseAllegiance() {
  try {
    await db.query('TRUNCATE TABLE house_allegiance;');
    console.log('🧹 Table "house_allegiance" successfully emptied!');

    const res = await db.query('SELECT COUNT(*) FROM house_allegiance;');
    console.log(`📊 Current row count in "house_allegiance": ${res.rows[0].count}`);
  } catch (err) {
    console.error('Error emptying house_allegiance:', err);
  } finally {
    process.exit(0);
  }
}

emptyHouseAllegiance();
