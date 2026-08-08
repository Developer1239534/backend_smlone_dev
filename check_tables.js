const db = require('./src/db/neonClient');

async function checkTables() {
  const result = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('📋 All tables in public schema:', result.rows.map(r => r.table_name));
}

checkTables().catch(console.error).then(() => process.exit(0));
