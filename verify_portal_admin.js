const db = require('./src/db/neonClient');

async function verify() {
  const count = await db.query(`SELECT COUNT(*) FROM portal_admin;`);
  console.log('Total records in portal_admin:', count.rows[0].count);

  const cols = await db.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'portal_admin' 
    ORDER BY ordinal_position;
  `);
  console.log('Columns in portal_admin:', cols.rows.map(r => r.column_name));

  const sample = await db.query(`SELECT class_name, day, time, room, branch, trainee_id, name FROM portal_admin ORDER BY trainee_id ASC LIMIT 3;`);
  console.log('Sample rows:', sample.rows);

  process.exit(0);
}

verify();
