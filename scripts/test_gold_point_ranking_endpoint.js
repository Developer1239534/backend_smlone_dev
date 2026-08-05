const db = require('../src/db/neonClient');

async function testEndpoint() {
  console.log('🧪 Testing gold_point_ranking table schema & query...');

  const cols = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'gold_point_ranking'
    ORDER BY ordinal_position;
  `);

  console.log('📋 Columns in gold_point_ranking:');
  cols.rows.forEach(col => {
    console.log(`  - ${col.column_name} (${col.data_type})`);
  });

  process.exit(0);
}

testEndpoint().catch(console.error);
