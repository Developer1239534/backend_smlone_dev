const db = require('./src/db/neonClient');

async function checkQuizData() {
  console.log('🔍 Checking Quiz & House database tables...');

  // List all tables in PostgreSQL schema
  const tablesRes = await db.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('\n📋 Existing tables in database:');
  const tableNames = tablesRes.rows.map(r => r.table_name);
  console.log(tableNames.join(', '));

  console.log('\n📊 Row counts for Quiz & House related tables:');
  for (const tableName of tableNames) {
    if (tableName.includes('quiz') || tableName.includes('house') || tableName.includes('award') || tableName.includes('coin') || tableName.includes('trainee')) {
      try {
        const countRes = await db.query(`SELECT COUNT(*) FROM "${tableName}";`);
        console.log(`- ${tableName}: ${countRes.rows[0].count} rows`);
      } catch (err) {
        console.log(`- ${tableName}: Error checking count (${err.message})`);
      }
    }
  }

  // Check sample quiz records if any quiz table exists
  const quizTables = tableNames.filter(t => t.includes('quiz'));
  for (const qTable of quizTables) {
    try {
      const sample = await db.query(`SELECT * FROM "${qTable}" LIMIT 3;`);
      console.log(`\nSample records from ${qTable}:`, sample.rows);
    } catch (e) {}
  }

  process.exit(0);
}

checkQuizData().catch(err => {
  console.error('Error checking quiz data:', err);
  process.exit(1);
});
