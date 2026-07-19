const db = require('../src/db/neonClient');

async function addColumn() {
  try {
    await db.query(`
      ALTER TABLE level_1_keseluruhan 
      ADD COLUMN IF NOT EXISTS cabang TEXT;
    `);
    console.log('Successfully added "cabang" column to level_1_keseluruhan table.');
  } catch (e) {
    console.error('Error adding column:', e.message);
  }
  process.exit(0);
}

addColumn();
