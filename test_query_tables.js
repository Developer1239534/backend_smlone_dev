const db = require('./src/db/neonClient');

async function testQuery() {
  try {
    const res = await db.query(`SELECT COUNT(*) FROM report_activity;`);
    console.log('Query Result:', res.rows);
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('All Public Tables in DB:', tables.rows.map(t => t.table_name));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

testQuery();
