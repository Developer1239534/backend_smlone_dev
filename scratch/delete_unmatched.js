require('dotenv').config();
const db = require('../src/db/neonClient');

const names = [
  'Gita Junika Pasaribu',
  'Jeneiro Joe',
  'Alvin Syahroni',
  'Ryan Aurelio Bustamin',
  'Omcom',
  'Uttika Anisya',
  'Phebe Lalita',
  'Angelina Cenata',
  'Jesslyn Osei Wijaya',
  'Senny Chairani',
  'Chaden Ettienne Halim',
  'Mulyanita Br Damanik',
  'Reagan Thierry Wijaya',
  'Rakha',
  'Ricky Tionardy',
  'Carine Susanto Lie'
];

(async () => {
  try {
    let trainneDeleted = 0;
    let awardsDeleted = 0;

    for (const name of names) {
      // Delete from dashboard_trainne
      const t = await db.query('DELETE FROM dashboard_trainne WHERE trainee_name ILIKE $1', [name]);
      trainneDeleted += t.rowCount || 0;

      // Delete from awards
      const a = await db.query('DELETE FROM awards WHERE trainee_name ILIKE $1', [name]);
      awardsDeleted += a.rowCount || 0;
    }

    console.log('✅ Deletion finished:');
    console.log(`- Deleted ${trainneDeleted} rows from dashboard_trainne.`);
    console.log(`- Deleted ${awardsDeleted} rows from awards.`);

  } catch (err) {
    console.error('❌ Error during deletion:', err);
  } finally {
    await db.pool.end();
  }
})();
