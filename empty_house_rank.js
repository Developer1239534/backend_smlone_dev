const db = require('./src/db/neonClient');

async function emptyHouseRankTable() {
  try {
    const deleted = await db.query('DELETE FROM house_rank RETURNING *;');
    console.log(`🧹 Berhasil menghapus ${deleted.rows.length} baris dari tabel "house_rank".`);

    const countRes = await db.query('SELECT COUNT(*) FROM house_rank;');
    console.log('📊 Jumlah data di tabel "house_rank" sekarang:', countRes.rows[0].count);
  } catch (err) {
    console.error('❌ Error menghapus data house_rank:', err);
  } finally {
    process.exit(0);
  }
}

emptyHouseRankTable();
