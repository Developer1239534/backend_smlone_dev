const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const res = await pool.query('SELECT DISTINCT class_sml FROM dashboard_trainne ORDER BY class_sml ASC');
    console.log('Unique class names in dashboard_trainne:');
    console.log(res.rows.map(r => r.class_sml));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
