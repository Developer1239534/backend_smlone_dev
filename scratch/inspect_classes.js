const db = require('../src/db/neonClient');

async function inspect() {
  try {
    const result = await db.query('SELECT DISTINCT class FROM dashboard_trainne ORDER BY class;');
    console.log('Unique classes in DB:');
    console.log(result.rows.map(r => r.class));
    
    const countRes = await db.query('SELECT COUNT(*) FROM dashboard_trainne;');
    console.log('Total trainees in DB:', countRes.rows[0].count);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
