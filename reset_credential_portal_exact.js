require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetCredentialPortalExactColumns() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query('DROP TABLE IF EXISTS credential_portal CASCADE;');

    // Create table with exact quoted column names matching n8n payload
    await client.query(`
      CREATE TABLE credential_portal (
        "ID"                VARCHAR(255) PRIMARY KEY,
        "Name"              VARCHAR(255),
        "MEMBERSHIP STATUS" VARCHAR(255),
        "Password"          VARCHAR(255)
      );
    `);

    console.log('✅ Tabel "credential_portal" berhasil di-reset dengan kolom eksak (ID, Name, MEMBERSHIP STATUS, Password)!');

    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'credential_portal'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Struktur tabel "credential_portal" sekarang:');
    console.table(res.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetCredentialPortalExactColumns();
