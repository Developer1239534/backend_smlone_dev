const db = require('./src/db/neonClient');

async function dropIdColumn() {
  try {
    console.log('Dropping id column from portal_admin table...');
    await db.query(`ALTER TABLE portal_admin DROP COLUMN IF EXISTS id;`);
    console.log('Successfully dropped id column!');

    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'portal_admin' 
      ORDER BY ordinal_position;
    `);
    console.log('Updated portal_admin columns:', columns.rows.map(c => c.column_name));

    const count = await db.query(`SELECT COUNT(*) FROM portal_admin;`);
    console.log('Total records:', count.rows[0].count);

    const sample = await db.query(`SELECT * FROM portal_admin LIMIT 2;`);
    console.log('Sample row after drop:', sample.rows[0]);

  } catch (err) {
    console.error('Error dropping id column:', err);
  } finally {
    process.exit(0);
  }
}

dropIdColumn();
