require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    // 1. Dapatkan semua kolom saat ini
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'trainees'`);
    console.log("Kolom saat ini:", res.rows.map(r => r.column_name));

    // 2. Tambahkan kolom-kolom baru jika belum ada
    const newColumns = [
      'program',
      'class_name',
      'level',
      'membership_expiry',
      'latest_project',
      'progress_next_level',
      'highlight',
      'announcement',
      'weekly_report_url',
      'quarterly_report_url',
      'gold_rank_url',
      'referral_code',
      'documentation_url',
      'prev_report_url',
      'prev_quarter_url',
      'contact_url'
    ];

    const currentColumns = res.rows.map(r => r.column_name);

    for (const col of newColumns) {
      if (!currentColumns.includes(col)) {
        let type = 'VARCHAR(255)';
        if (col === 'progress_next_level') type = 'INTEGER DEFAULT 0';
        if (col === 'highlight' || col === 'announcement') type = 'TEXT';
        if (col.includes('url')) type = 'TEXT';

        await pool.query(`ALTER TABLE trainees ADD COLUMN ${col} ${type}`);
        console.log(`Added column: ${col}`);
      }
    }

    // Kosongkan semua kolom (diatur ke NULL atau default) untuk data yang sudah ada
    // "jangan di isi dulu kecuali ID dan trainee ya" (Clear out existing data for these new columns)
    const setQuery = newColumns.map(col => `${col} = NULL`).join(', ');
    
    // Khusus untuk progress_next_level kita set ke 0 jika integer
    const finalQuery = setQuery.replace('progress_next_level = NULL', 'progress_next_level = 0');
    
    await pool.query(`UPDATE trainees SET ${finalQuery}`);
    console.log("Semua kolom baru di-set menjadi kosong/NULL");

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
