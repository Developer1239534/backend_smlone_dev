const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('Adding column wa_trainnee to dashboard_trainne...');
    await db.query(`
      ALTER TABLE dashboard_trainne 
      ADD COLUMN IF NOT EXISTS wa_trainnee VARCHAR(50) DEFAULT NULL;
    `);
    console.log('✅ Column wa_trainnee successfully added!');
    
    // Verify it exists by querying information_schema
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'dashboard_trainne' AND column_name = 'wa_trainnee';
    `);
    console.log('Column details in DB:', res.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding column:', err);
    process.exit(1);
  }
}

main();
