const db = require('../src/db/neonClient');

async function main() {
  try {
    console.log('=== VERIFYING gp_month DATA & getTraineeOrError INTEGRATION ===');

    // 1. Check direct columns in dashboard_trainne for Hermione (ID 1025)
    const directRes = await db.query(`
      SELECT total_gold_periode, rank_id_junior, rank_id_junior_timor
      FROM dashboard_trainne
      WHERE id = '1025'
    `);
    console.log('Direct dashboard_trainne columns for Hermione (Must be NULL):', directRes.rows[0]);

    // 2. Check joined query (simulating getTraineeOrError)
    const joinedRes = await db.query(`
      SELECT dt.id, dt.trainee_name, 
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
      LEFT JOIN (
        SELECT DISTINCT ON (trainee_id) *
        FROM gp_month
        ORDER BY trainee_id, created_at DESC
      ) gp ON dt.id = gp.trainee_id
      WHERE dt.id = '1025'
    `);
    console.log('Joined gp_month rankings for Hermione (Must show Correct Ranks):', joinedRes.rows[0]);

    // 3. Check total rows in gp_month
    const countRes = await db.query('SELECT COUNT(*) FROM gp_month');
    console.log('Total rows stored in gp_month table:', countRes.rows[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
