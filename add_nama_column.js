const db = require('./src/db/neonClient');

async function addColumn() {
  try {
    // Add nama column if it doesn't exist
    await db.query(`
      ALTER TABLE link_report 
      ADD COLUMN IF NOT EXISTS nama VARCHAR(255);
    `);
    console.log('✅ Added column "nama" to link_report table.');

    // Check schema
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'link_report'
      ORDER BY ordinal_position;
    `);
    console.log('Updated columns:', res.rows.map(r => r.column_name));

    process.exit(0);
  } catch (err) {
    console.error('Error adding column:', err);
    process.exit(1);
  }
}

addColumn();
