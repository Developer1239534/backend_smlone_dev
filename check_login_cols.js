const db = require('./src/db/neonClient');

async function main() {
  const loginCols = await db.query(`
    SELECT column_name FROM information_schema.columns WHERE table_name = 'login_trainee'
  `);
  console.log('login_trainee columns:', loginCols.rows.map(r => r.column_name));
}

main().catch(console.error);
