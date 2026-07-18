const db = require('../src/db/neonClient');

async function listTables() {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables currently in database:');
    console.log(result.rows.map(r => r.table_name));
  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
}

listTables();
