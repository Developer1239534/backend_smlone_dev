require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await pool.query('DROP TABLE IF EXISTS student_profiles CASCADE;');
    console.log("Tabel student_profiles berhasil dihapus!");
  } catch (err) {
    console.error("Gagal menghapus tabel:", err);
  } finally {
    pool.end();
  }
}

main();
