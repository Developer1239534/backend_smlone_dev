const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT 
        id, 
        trainee_name, 
        total_gold_periode, 
        junior_youth,
        rank_id_junior,
        rank_id_youth,
        rank_id_junior_timor,
        rank_id_youth_timor,
        rank_id_junior_tritura,
        rank_id_youth_tritura,
        rank_id_junior_cemara,
        rank_id_youth_cemara
      FROM dashboard_trainne 
      WHERE id IN ('1025', '70100112')
    `);
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
