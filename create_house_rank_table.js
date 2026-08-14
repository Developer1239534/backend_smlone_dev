const db = require('./src/db/neonClient');

async function recreateHouseRankTableNoId() {
  try {
    // Drop existing table
    await db.query(`DROP TABLE IF EXISTS house_rank;`);
    console.log('🗑️ Dropped previous "house_rank" table.');

    // Create table with ONLY the 6 requested columns (NO id column)
    const createQuery = `
      CREATE TABLE house_rank (
        "Nama House" VARCHAR(255),
        "Total Gold" INT DEFAULT 0,
        "Class" VARCHAR(255),
        "Cabang" VARCHAR(255),
        "Program" VARCHAR(255),
        "Rank" INT
      );
    `;
    await db.query(createQuery);
    console.log('✅ Table "house_rank" created with ONLY the 6 specified columns (NO ID)!');

    // Verify structure
    const cols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'house_rank'
      ORDER BY ordinal_position;
    `);
    console.log('📋 Exact Columns in "house_rank":', cols.rows);
  } catch (err) {
    console.error('❌ Error updating table:', err);
  } finally {
    process.exit(0);
  }
}

recreateHouseRankTableNoId();
