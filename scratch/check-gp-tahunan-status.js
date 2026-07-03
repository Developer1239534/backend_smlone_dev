const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const totalCount = await pool.query('SELECT COUNT(*) FROM gp_tahunan');
    console.log('Total rows in gp_tahunan:', totalCount.rows[0].count);

    const minMaxDate = await pool.query('SELECT MIN(date), MAX(date) FROM gp_tahunan');
    console.log('Min date:', minMaxDate.rows[0].min, 'Max date:', minMaxDate.rows[0].max);

    const sample = await pool.query('SELECT * FROM gp_tahunan ORDER BY id DESC LIMIT 5');
    console.log('Sample rows:', sample.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
