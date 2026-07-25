const db = require('../src/db/neonClient');

async function checkTables() {
  try {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables in database:');
    res.rows.forEach(r => console.log(' -', r.table_name));
  } catch (err) {
    console.error('Error fetching tables:', err);
  }
}

checkTables();
