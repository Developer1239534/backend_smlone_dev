const db = require('../src/db/neonClient');

async function dropScreeningTestColumn() {
  try {
    console.log('🚀 Dropping column `screening_test` from `login_portal_fix`...');
    await db.query('ALTER TABLE login_portal_fix DROP COLUMN IF EXISTS screening_test;');
    console.log('✅ Column `screening_test` successfully dropped!');

    // Check updated column names
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'login_portal_fix'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Updated columns in `login_portal_fix`:');
    console.log(res.rows.map(r => r.column_name).join(', '));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping column:', err);
    process.exit(1);
  }
}

dropScreeningTestColumn();
