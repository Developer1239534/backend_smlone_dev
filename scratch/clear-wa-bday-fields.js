const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('Clearing phone (Parent\'s WA), wa_trainnee (Trainee\'s WA), tanggal_lahir (Birth Date), newest_grade, and nama_sekolah for all trainees...');
    await db.query(`
      UPDATE dashboard_trainne
      SET 
        phone = NULL,
        wa_trainnee = NULL,
        tanggal_lahir = NULL,
        newest_grade = NULL,
        nama_sekolah = NULL;
    `);
    console.log('✅ Fields successfully cleared!');

    // Check counts of non-null rows
    const res = await db.query(`
      SELECT 
        COUNT(phone) as non_null_phone,
        COUNT(wa_trainnee) as non_null_wa,
        COUNT(tanggal_lahir) as non_null_bday,
        COUNT(newest_grade) as non_null_grade,
        COUNT(nama_sekolah) as non_null_school
      FROM dashboard_trainne;
    `);
    console.log('Database check (non-null counts should all be 0):', res.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing fields:', err);
    process.exit(1);
  }
}

main();
