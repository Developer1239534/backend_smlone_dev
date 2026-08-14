const { pool } = require('./src/db/neonClient');

async function checkFinalData() {
  const total = await pool.query('SELECT COUNT(*) FROM goldpoint_trainee;');
  const zeroRanks = await pool.query('SELECT COUNT(*) FROM goldpoint_trainee WHERE rank = 0 OR rank IS NULL;');
  const sample = await pool.query('SELECT id, nama_trainee, branch, kategori, rank, total_gold_periode FROM goldpoint_trainee ORDER BY rank ASC LIMIT 10;');

  console.log(`Total trainees in database: ${total.rows[0].count}`);
  console.log(`Zero or null ranks count: ${zeroRanks.rows[0].count}`);
  console.log('Sample top 10 trainees with ranks:');
  console.table(sample.rows);

  process.exit(0);
}

checkFinalData();
