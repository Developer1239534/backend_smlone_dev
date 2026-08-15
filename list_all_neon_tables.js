const db = require('./src/db/neonClient');

async function listTables() {
  try {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('📋 All tables currently in Neon database ("neondb"):');
    console.log(res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error listing tables:', err);
  } finally {
    process.exit(0);
  }
}

listTables();
