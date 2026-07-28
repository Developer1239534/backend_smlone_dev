const db = require('./src/db/neonClient');

async function main() {
  const tablesRes = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Tables in database:', tablesRes.rows.map(r => r.table_name));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
