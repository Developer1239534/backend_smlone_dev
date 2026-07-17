const db = require('../src/db/neonClient');

async function dropSpecificTable() {
  try {
    console.log('Menghapus tabel level_1_cleaned_trainee_ca...');
    await db.query('DROP TABLE IF EXISTS level_1_cleaned_trainee_ca CASCADE');
    console.log('✅ Tabel level_1_cleaned_trainee_ca berhasil dihapus.');

    process.exit(0);
  } catch (err) {
    console.error('Gagal menghapus tabel:', err);
    process.exit(1);
  }
}

dropSpecificTable();
