const db = require('../src/db/neonClient');

async function emptyTables() {
  try {
    console.log('Menghapus semua data dari tabel...');
    
    await db.query('TRUNCATE TABLE level_1_ca_class RESTART IDENTITY CASCADE');
    console.log('✅ Tabel level_1_ca_class berhasil dikosongkan.');

    await db.query('TRUNCATE TABLE cleaned_trainee RESTART IDENTITY CASCADE');
    console.log('✅ Tabel cleaned_trainee berhasil dikosongkan.');

    process.exit(0);
  } catch (err) {
    console.error('Gagal mengosongkan tabel:', err);
    process.exit(1);
  }
}

emptyTables();
