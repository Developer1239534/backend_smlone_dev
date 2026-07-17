const db = require('../src/db/neonClient');

async function dropTable() {
  try {
    console.log('Menghapus tabel level_1_ca_class...');
    await db.query('DROP TABLE IF EXISTS level_1_ca_class CASCADE');
    console.log('✅ Tabel level_1_ca_class berhasil dihapus sepenuhnya.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal:', err);
    process.exit(1);
  }
}

dropTable();
