const { pool } = require('../src/db/neonClient');

async function testQuery(paramsStr, queryParams) {
  const { search, junior_youth, cabang, class: classFilter } = queryParams;
  try {
    let query = `
      SELECT dt.id, dt.trainee_name, dt.junior_youth, dt.class, dt.cabang,
             COALESCE(gp.total_gold_periode, '0') AS total_gold_periode
      FROM dashboard_trainne dt
      LEFT JOIN gp_month gp ON dt.id = gp.trainee_id
    `;
    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(dt.trainee_name ILIKE $${params.length} OR dt.id ILIKE $${params.length})`);
    }

    if (junior_youth) {
      params.push(junior_youth);
      conditions.push(`dt.junior_youth = $${params.length}`);
    }

    if (cabang) {
      params.push(cabang);
      conditions.push(`dt.cabang = $${params.length}`);
    }

    if (classFilter) {
      params.push(classFilter);
      conditions.push(`dt.class = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY dt.id ASC LIMIT 3';

    const result = await pool.query(query, params);
    console.log(`\n🔍 Test Query with parameters (${paramsStr}):`);
    console.table(result.rows.map(r => ({
      ID: r.id,
      Name: r.trainee_name,
      Class: r.class,
      Branch: r.cabang,
      AgeCat: r.junior_youth,
      Gold: r.total_gold_periode
    })));

  } catch (err) {
    console.error('Error testing query:', err.message);
  }
}

async function main() {
  await testQuery('search=Valerie', { search: 'Valerie' });
  await testQuery('junior_youth=Junior', { junior_youth: 'Junior' });
  await testQuery('cabang=TIMOR', { cabang: 'TIMOR' });
  await testQuery('class=Winfrey', { class: 'Winfrey' });
  await pool.end();
}

main();
