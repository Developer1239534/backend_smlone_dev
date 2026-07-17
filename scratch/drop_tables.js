const db = require('../src/db/neonClient');

async function dropTables() {
  try {
    console.log('Menghancurkan tabel secara total...');
    
    await db.query('DROP TABLE IF EXISTS level_1_ca_class CASCADE');
    console.log('💥 Tabel level_1_ca_class telah dimusnahkan.');

    await db.query('DROP TABLE IF EXISTS cleaned_trainee CASCADE');
    console.log('💥 Tabel cleaned_trainee telah dimusnahkan.');

    process.exit(0);
  } catch (err) {
    console.error('Gagal menghancurkan tabel:', err);
    process.exit(1);
  }
}

dropTables();
