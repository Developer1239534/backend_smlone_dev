const db = require('./src/db/neonClient');

async function inspect() {
  const tables = ['portal_trainee', 'data_dashboard_keseluruhan', 'dashboard_trainne'];
  for (const t of tables) {
    try {
      const res = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${t}' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      console.log(`=== TABLE: ${t} (${res.rows.length} cols) ===`);
      console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } catch(e) {
      console.log(`Error querying ${t}:`, e.message);
    }
  }
  process.exit(0);
}

inspect().catch(e => { console.error(e); process.exit(1); });
