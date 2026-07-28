const db = require('./src/db/neonClient');

async function test() {
  try {
    const queryText = `
      SELECT 
        trainee_id AS id,
        name AS nama_trainee,
        name AS trainee_name,
        COALESCE(program, 'Junior/Youth Program') AS status,
        COALESCE(level, 'Sergeant') AS level,
        COALESCE(house, 'House of Thenova') AS house,
        COALESCE(class, 'Gladwell') AS class,
        COALESCE(branch_id, 'TIMOR') AS branch,
        COALESCE(branch_id, 'TIMOR') AS cabang,
        COALESCE(total_gold, 0) AS total_gold_periode,
        COALESCE(gp_month, total_gold, 0) AS gp_month,
        COALESCE(total_gold, 0) AS total_gold,
        COALESCE(kategori, 'Junior') AS kategori,
        COALESCE(kategori, 'Junior') AS junior_youth,
        COALESCE(rank, 0) AS rank,
        updated_at
      FROM portal_trainee
      ORDER BY COALESCE(total_gold, 0) DESC, name ASC 
      LIMIT 1000 OFFSET 0
    `;
    const res = await db.query(queryText);
    console.log('Success! Returned rows:', res.rows.length);
    console.log('Sample row:', res.rows[0]);
  } catch (err) {
    console.error('Test query failed with error:', err);
  }
  process.exit(0);
}

test();
