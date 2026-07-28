const db = require('./src/db/neonClient');

async function run() {
  console.log('Dropping table goldpoint_trainee...');
  await db.query('DROP TABLE IF EXISTS goldpoint_trainee CASCADE;');
  console.log('Successfully dropped table goldpoint_trainee.');
  
  // Verify remaining tables
  const res = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('Current tables in database:');
  console.log(res.rows.map(r => r.table_name));

  process.exit(0);
}

run().catch(err => {
  console.error('Error dropping table:', err);
  process.exit(1);
});
