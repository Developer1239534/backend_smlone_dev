const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const res = await pool.query(
      `SELECT * FROM gp_tahunan WHERE trainee_id = '90100128' AND date = '6 Jan 2026'`
    );
    console.log('Result for trainee 90100128 on 6 Jan 2026:', res.rows[0]);

    if (res.rows[0] && res.rows[0].total_gold === 160) {
      console.log('✅ Gold points summed correctly in database!');
    } else {
      console.error('❌ Gold points check failed!');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
