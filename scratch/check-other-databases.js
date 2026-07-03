const db = require('../src/db/neonClient');

async function main() {
  try {
    // 1. Check all databases on this PostgreSQL instance
    const dbs = await db.query("SELECT datname FROM pg_database WHERE datistemplate = false");
    console.log('=== DATABASES IN POSTGRESQL INSTANCE ===');
    console.log(dbs.rows.map(r => r.datname));

    // 2. Check all schemas in the current database
    const schemas = await db.query("SELECT schema_name FROM information_schema.schemata");
    console.log('\n=== SCHEMAS IN CURRENT DATABASE ===');
    console.log(schemas.rows.map(r => r.schema_name));

    // 3. Let's see if there are other tables that look like copies of dashboard_trainne
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name LIKE '%trainne%' OR table_name LIKE '%backup%')
    `);
    console.log('\n=== TRAINNE / BACKUP TABLES ===');
    console.log(tables.rows.map(r => r.table_name));

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
