const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT DISTINCT junior_youth FROM dashboard_trainne
    `);
    console.log('Distinct junior_youth:', res.rows);

    const counts = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(total_gold_periode) as has_total_gold,
        COUNT(rank_id_junior) as has_rank_jr,
        COUNT(rank_id_youth) as has_rank_yth,
        COUNT(rank_id_junior_timor) as has_rank_jr_timor,
        COUNT(rank_id_youth_timor) as has_rank_yth_timor,
        COUNT(rank_id_junior_tritura) as has_rank_jr_tritura,
        COUNT(rank_id_youth_tritura) as has_rank_yth_tritura,
        COUNT(rank_id_junior_cemara) as has_rank_jr_cemara,
        COUNT(rank_id_youth_cemara) as has_rank_yth_cemara
      FROM dashboard_trainne
    `);
    console.log('Trainee field counts:', counts.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
