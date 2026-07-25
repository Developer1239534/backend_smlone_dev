const db = require('../src/db/neonClient');

async function test() {
  try {
    const query = `
      SELECT dt.*, 
             COALESCE(gp.total_gold_periode, '0') AS total_gold_periode,
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
      ORDER BY dt.id ASC
    `;
    const res = await db.query(query);
    console.log('Success, rows count:', res.rows.length);
  } catch (err) {
    console.error('DB ERROR CODE:', err.code);
    console.error('DB ERROR MESSAGE:', err.message);
    console.error('DB ERROR DETAIL:', err.detail);
    console.error('DB ERROR FULL:', err);
  }
}

test();
