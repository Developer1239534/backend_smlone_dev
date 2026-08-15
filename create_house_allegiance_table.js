const db = require('./src/db/neonClient');

async function createHouseAllegianceTable() {
  try {
    console.log('🔄 Creating "house_allegiance" table in Neon DB...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS house_allegiance (
        "number" INT PRIMARY KEY,
        "question" TEXT NOT NULL,
        "options" JSONB
      );
    `);

    console.log('✅ Table "house_allegiance" successfully created!');

    const colsRes = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'house_allegiance' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Columns in "house_allegiance":');
    colsRes.rows.forEach(r => console.log(`  - "${r.column_name}" (${r.data_type})`));
  } catch (err) {
    console.error('Error creating house_allegiance table:', err);
  } finally {
    process.exit(0);
  }
}

createHouseAllegianceTable();
