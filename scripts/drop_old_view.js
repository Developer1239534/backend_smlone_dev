const db = require('../src/db/neonClient');

async function main() {
  console.log('🗑️ Dropping VIEW "Report_Trainee" and TABLE "Report_Trainee"...');
  
  try {
    await db.query('DROP VIEW IF EXISTS "Report_Trainee" CASCADE;');
    console.log('✅ View "Report_Trainee" dropped.');
  } catch (e) {
    console.log('View error:', e.message);
  }

  try {
    await db.query('DROP TABLE IF EXISTS "Report_Trainee" CASCADE;');
    console.log('✅ Table "Report_Trainee" dropped.');
  } catch (e) {
    console.log('Table error:', e.message);
  }

  const res = await db.query(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('Current tables & views remaining in DB:', res.rows);

  process.exit(0);
}

main().catch(console.error);
