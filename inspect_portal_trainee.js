require('dotenv').config();
const db = require('./src/db/neonClient');

async function inspect() {
  try {
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%trainee%';
    `);
    console.log('Matching tables:', JSON.stringify(tables.rows, null, 2));

    const cols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'portal_trainee';
    `);
    console.log('portal_trainee columns:', JSON.stringify(cols.rows, null, 2));

    const count = await db.query(`SELECT COUNT(*) FROM portal_trainee;`);
    console.log('portal_trainee row count:', count.rows[0].count);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

inspect();
