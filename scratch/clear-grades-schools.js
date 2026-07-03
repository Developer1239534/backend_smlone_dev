const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('Clearing newest_grade and nama_sekolah fields for all trainees...');
    await db.query(`
      UPDATE dashboard_trainne
      SET newest_grade = NULL, nama_sekolah = NULL;
    `);
    console.log('✅ Fields successfully cleared!');

    // Check count of non-null rows
    const res = await db.query(`
      SELECT 
        COUNT(newest_grade) as non_null_grade,
        COUNT(nama_sekolah) as non_null_school
      FROM dashboard_trainne;
    `);
    console.log('Database check (non-null counts):', res.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing fields:', err);
    process.exit(1);
  }
}

main();
