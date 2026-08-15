const db = require('./src/db/neonClient');

async function dropLinkReport() {
  try {
    await db.query('DROP TABLE IF EXISTS "link_report" CASCADE;');
    console.log('🗑️ Table "link_report" successfully dropped from Neon DB.');

    const listRes = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📋 Remaining tables in Neon DB:');
    for (const row of listRes.rows) {
      console.log(`  - ${row.table_name}`);
    }
  } catch (err) {
    console.error('Error dropping link_report:', err);
  } finally {
    process.exit(0);
  }
}

dropLinkReport();
