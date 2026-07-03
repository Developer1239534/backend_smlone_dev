const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT dt.*, 
             gp.total_gold_periode,
             gp.rank_id_junior,
             gp.rank_id_youth,
             gp.rank_id_junior_timor,
             gp.rank_id_youth_timor,
             gp.rank_id_junior_tritura,
             gp.rank_id_youth_tritura,
             gp.rank_id_junior_cemara,
             gp.rank_id_youth_cemara
      FROM dashboard_trainne dt
      LEFT JOIN gp_month gp ON dt.id = gp.trainee_id
      WHERE dt.id = '1025'
    `);
    console.log('Result for Hermione:', res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
