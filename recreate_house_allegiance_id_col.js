const db = require('./src/db/neonClient');

async function recreateHouseAllegianceId() {
  try {
    console.log('🔄 Updating "house_allegiance" table to columns: id, question, options...');

    await db.query('DROP TABLE IF EXISTS house_allegiance CASCADE;');

    await db.query(`
      CREATE TABLE house_allegiance (
        "id" SERIAL PRIMARY KEY,
        "question" TEXT NOT NULL,
        "options" JSONB
      );
    `);

    console.log('✅ Table "house_allegiance" successfully updated to columns: id, question, options!');

    const colsRes = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'house_allegiance' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Columns in "house_allegiance":');
    colsRes.rows.forEach(r => console.log(`  - "${r.column_name}" (${r.data_type})`));
  } catch (err) {
    console.error('Error updating house_allegiance:', err);
  } finally {
    process.exit(0);
  }
}

recreateHouseAllegianceId();
