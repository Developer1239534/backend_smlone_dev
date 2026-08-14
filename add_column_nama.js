require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkAndFix() {
  const client = await pool.connect();
  try {
    // Cek kolom yang ada sekarang
    const check = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'credential'
      ORDER BY ordinal_position
    `);

    console.log('📋 Kolom saat ini di tabel credential:');
    console.table(check.rows);

    // Cek apakah kolom nama sudah ada
    const hasNama = check.rows.some(r => r.column_name === 'nama');

    if (!hasNama) {
      console.log('\n⚠️  Kolom "nama" belum ada. Menambahkan sekarang...');
      await client.query('ALTER TABLE credential ADD COLUMN nama VARCHAR(255);');
      console.log('✅ Kolom "nama" berhasil ditambahkan!');
    } else {
      console.log('\n✅ Kolom "nama" sudah ada.');
    }

    // Tampilkan struktur final
    const final = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'credential'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Struktur tabel "credential" final:');
    console.table(final.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndFix();
