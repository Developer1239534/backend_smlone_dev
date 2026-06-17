const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('Dropping tautan_tambahan column from dashboard_trainne table...');
    
    await db.query(`
      ALTER TABLE dashboard_trainne 
      DROP COLUMN IF EXISTS tautan_tambahan;
    `);
    
    console.log('✅ Column tautan_tambahan successfully dropped!');
    
    // Check remaining columns in database table
    const checkRes = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dashboard_trainne' 
        AND table_schema = 'public'
    `);
    
    const columns = checkRes.rows.map(r => r.column_name);
    const hasColumn = columns.includes('tautan_tambahan');
    console.log(`Verify: Does tautan_tambahan still exist? ${hasColumn ? 'Yes' : 'No'}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping column:', err);
    process.exit(1);
  }
}

main();
