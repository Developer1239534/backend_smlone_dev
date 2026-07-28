const db = require('./src/db/neonClient');

async function main() {
  const loginCols = await db.query(`
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'login_trainee'
  `);
  console.log('login_trainee schema:', loginCols.rows);
}

main().catch(console.error);
