const db = require('./src/db/neonClient');

async function trimHouseRankData() {
  try {
    await db.query(`
      UPDATE house_rank SET
        "Cabang" = TRIM(BOTH E'\n\r\t ' FROM "Cabang"),
        "Program" = TRIM(BOTH E'\n\r\t ' FROM "Program"),
        "Nama House" = TRIM(BOTH E'\n\r\t ' FROM "Nama House"),
        "Class" = TRIM(BOTH E'\n\r\t ' FROM "Class");
    `);
    console.log('✅ Successfully trimmed trailing newlines from house_rank database!');

    const res = await db.query('SELECT * FROM house_rank ORDER BY "Rank" ASC;');
    console.log('📊 Cleaned Rows:', res.rows);
  } catch (err) {
    console.error('Error trimming data:', err);
  } finally {
    process.exit(0);
  }
}

trimHouseRankData();
