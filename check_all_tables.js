const { pool } = require('./src/db/neonClient');

async function inspectTables() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `);

    const tableMap = {};
    for (const row of res.rows) {
      if (!tableMap[row.table_name]) {
        tableMap[row.table_name] = [];
      }
      tableMap[row.table_name].push({ column: row.column_name, type: row.data_type });
    }

    console.log('=== LIST ALL PUBLIC TABLES & COLUMNS ===');
    for (const [table, cols] of Object.entries(tableMap)) {
      console.log(`\nTable: [${table}] (${cols.length} cols)`);
      console.log(cols.map(c => `  - "${c.column}" (${c.type})`).join('\n'));
    }

    // Check counts
    console.log('\n=== ROW COUNTS ===');
    for (const table of Object.keys(tableMap)) {
      try {
        const countRes = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`- ${table}: ${countRes.rows[0].count} rows`);
      } catch (e) {
        console.log(`- ${table}: Error counting (${e.message})`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

inspectTables();
