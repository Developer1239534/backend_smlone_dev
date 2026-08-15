const db = require('./src/db/neonClient');

async function checkDatabaseRows() {
  try {
    const res = await db.query('SELECT * FROM house_rank');
    console.log('📊 Actual rows in Neon DB ("neondb"):', res.rows.length);
    console.log('Sample row:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkDatabaseRows();
