const db = require('../src/db/neonClient');

async function checkDistinct() {
  try {
    const programs = await db.query('SELECT DISTINCT program FROM dashboard_trainne;');
    console.log('Unique programs:', programs.rows);

    const classes = await db.query('SELECT DISTINCT class FROM dashboard_trainne;');
    console.log('Unique classes:', classes.rows);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDistinct();
