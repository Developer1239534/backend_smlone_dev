const db = require('./src/db/neonClient');

async function truncateTable() {
  try {
    // First, check how many rows exist
    const countBefore = await db.query('SELECT COUNT(*) FROM link_report');
    console.log(`📊 Jumlah data sebelum dihapus: ${countBefore.rows[0].count} baris`);

    // Truncate the table (removes all rows, resets auto-increment)
    await db.query('TRUNCATE TABLE link_report RESTART IDENTITY');
    console.log('✅ Tabel link_report berhasil dikosongkan!');

    // Verify
    const countAfter = await db.query('SELECT COUNT(*) FROM link_report');
    console.log(`📊 Jumlah data setelah dihapus: ${countAfter.rows[0].count} baris`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

truncateTable();
