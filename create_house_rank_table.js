const db = require('./src/db/neonClient');

async function ensureTableAndData() {
  try {
    // 1. Ensure table exists with 6 exact columns
    await db.query(`
      CREATE TABLE IF NOT EXISTS house_rank (
        "Nama House" VARCHAR(255),
        "Total Gold" INT DEFAULT 0,
        "Class" VARCHAR(255),
        "Cabang" VARCHAR(255),
        "Program" VARCHAR(255),
        "Rank" INT
      );
    `);
    console.log('✅ Guaranteed "house_rank" table exists in Neon database!');

    // 2. Check if table is empty, if empty insert initial sample data
    const checkCount = await db.query('SELECT COUNT(*) FROM house_rank');
    if (parseInt(checkCount.rows[0].count, 10) === 0) {
      await db.query(`
        INSERT INTO house_rank ("Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank")
        VALUES 
          ('Gryffindor', 1500, 'Class A', 'Jakarta', 'Program Special', 1),
          ('Slytherin', 1400, 'Class A', 'Surabaya', 'Program Special', 2),
          ('Ravenclaw', 1300, 'Class B', 'Bandung', 'Program Alpha', 3);
      `);
      console.log('🌱 Seeded 3 sample rows into "house_rank".');
    }

    const rows = await db.query('SELECT * FROM house_rank');
    console.log('📋 Current Rows in "house_rank":', rows.rows);
  } catch (err) {
    console.error('❌ Error ensuring table/data:', err);
  } finally {
    process.exit(0);
  }
}

ensureTableAndData();
