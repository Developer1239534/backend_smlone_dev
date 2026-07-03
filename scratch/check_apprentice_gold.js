const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT id, trainee_name, total_gold_periode, rank_id_junior, rank_id_youth
      FROM dashboard_trainne
      WHERE junior_youth = 'Apprentice'
        AND (total_gold_periode IS NOT NULL OR rank_id_junior IS NOT NULL OR rank_id_youth IS NOT NULL)
      LIMIT 20;
    `);
    console.log('Apprentice rows with gold or ranks:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
