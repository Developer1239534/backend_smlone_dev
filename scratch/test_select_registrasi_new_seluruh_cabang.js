const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query('SELECT * FROM registrasi_new_seluruh_cabang ORDER BY created_at DESC LIMIT 5');
    console.log('Query success! Rows fetched:', res.rows.length);
    if (res.rows.length > 0) {
      console.log('Sample row data_registrasi:', res.rows[0].data_registrasi);
    }
  } catch (e) {
    console.error('QUERY FAILED:', e.message);
  } finally {
    process.exit();
  }
}

main();
