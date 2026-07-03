const db = require('../src/db/neonClient');

async function main() {
  try {
    const trainees = ['70100112', '1025', '70100174'];
    
    const res = await db.query(`
      SELECT id, trainee_name, total_gold_periode, 
             rank_id_junior, rank_id_youth,
             rank_id_junior_timor, rank_id_youth_timor,
             rank_id_junior_tritura, rank_id_youth_tritura,
             rank_id_junior_cemara, rank_id_youth_cemara
      FROM dashboard_trainne
      WHERE id = ANY($1)
    `, [trainees]);

    console.log('=== VERIFICATION OF SYNCED TRAINEES ===');
    console.table(res.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
