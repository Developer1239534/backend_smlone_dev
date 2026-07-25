const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrasi_new_seluruh_cabang'
    `);
    console.log('Columns in registrasi_new_seluruh_cabang:');
    res.rows.forEach(r => {
      console.log(`- ${r.column_name}: ${r.data_type}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

main();
