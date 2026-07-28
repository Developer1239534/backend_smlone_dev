const db = require('./src/db/neonClient');

async function run() {
  const res = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'portal_trainee'
    ORDER BY ordinal_position;
  `);

  console.log('Columns in portal_trainee:');
  console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
