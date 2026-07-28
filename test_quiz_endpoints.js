const db = require('./src/db/neonClient');

async function testQuizEndpoints() {
  console.log('🧪 Testing Quiz endpoints data directly from database...');

  const housesRes = await db.query('SELECT * FROM houses;');
  console.log(`✅ Houses count: ${housesRes.rows.length}`);

  const questionsRes = await db.query('SELECT * FROM questions ORDER BY id ASC LIMIT 5;');
  console.log(`✅ Questions count: ${questionsRes.rows.length} (Sample Q1: "${questionsRes.rows[0].question_text.slice(0, 40)}...")`);

  const historyRes = await db.query('SELECT * FROM quiz_history;');
  console.log(`✅ Quiz History submissions count: ${historyRes.rows.length}`);

  process.exit(0);
}

testQuizEndpoints().catch(err => {
  console.error('Error testing quiz endpoints:', err);
  process.exit(1);
});
