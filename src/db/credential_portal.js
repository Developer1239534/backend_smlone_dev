require('dotenv').config();
const { pool } = require('./neonClient');

async function resetCredentialPortalTable() {
  const client = await pool.connect();
  try {
    console.log('🔌 Menghubungkan ke Neon PostgreSQL...');

    console.log('🗑️  Menghapus tabel credential_portal lama (jika ada)...');
    await client.query('DROP TABLE IF EXISTS credential_portal CASCADE;');

    console.log('✨ Membuat tabel credential_portal dengan kolom: ID, Name, MEMBERSHIP STATUS, Password...');
    await client.query(`
      CREATE TABLE credential_portal (
        "ID"                VARCHAR(255) PRIMARY KEY,
        "Name"              VARCHAR(255),
        "MEMBERSHIP STATUS" VARCHAR(255),
        "Password"          VARCHAR(255)
      );
    `);

    console.log('✅ Tabel credential_portal berhasil dibuat!');

    // Verifikasi struktur kolom yang telah dibuat
    const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'credential_portal'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Struktur kolom tabel credential_portal:');
    columnsRes.rows.forEach(col => {
      console.log(` - "${col.column_name}" (${col.data_type})`);
    });

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat reset tabel credential_portal:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  resetCredentialPortalTable();
}

module.exports = {
  resetCredentialPortalTable,
  pool,
};
