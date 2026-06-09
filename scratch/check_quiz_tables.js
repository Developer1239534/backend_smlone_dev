const db = require('../src/db/neonClient');

async function checkQuizSchema() {
  try {
    const quizHistoryCols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_history';
    `);
    console.log('quiz_history columns:', quizHistoryCols.rows);

    const housesCols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'houses';
    `);
    console.log('houses columns:', housesCols.rows);

    const housesData = await db.query('SELECT * FROM houses;');
    console.log('houses data:', housesData.rows);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkQuizSchema();
