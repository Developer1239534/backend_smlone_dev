const db = require('./src/db/neonClient');

async function checkAll() {
  console.log('Querying all schemas and tables in database...');
  const res = await db.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    ORDER BY table_schema, table_name;
  `);
  console.log('All tables found:', res.rows);

  const connStr = process.env.DATABASE_URL;
  // Mask password for safety
  const safeUrl = connStr ? connStr.replace(/:[^:@]+@/, ':****@') : 'NONE';
  console.log('Currently connected DATABASE_URL:', safeUrl);

  process.exit(0);
}

checkAll();
