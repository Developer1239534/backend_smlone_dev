const db = require('./src/db/neonClient');

async function checkDb() {
  const host = await db.query('SELECT inet_server_addr(), current_database(), current_schema()');
  console.log('DB Info:', host.rows);

  const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'portal%'");
  console.log('Portal Tables in connected DB:', tables.rows);

  process.exit(0);
}

checkDb();
