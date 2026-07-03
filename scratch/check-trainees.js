const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const ids = ['970', '670', '149', '90100128', '90100045'];
    const res = await pool.query('SELECT id, trainee_name FROM dashboard_trainne WHERE id = ANY($1)', [ids]);
    console.log('Found trainees:');
    res.rows.forEach(r => console.log(`- ID: ${r.id}, Name: ${r.trainee_name}`));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
