const db = require('./src/db/neonClient');

async function cleanupDuplicates() {
  try {
    const res = await db.query(`
      DELETE FROM house_rank a
      USING house_rank b
      WHERE a.ctid < b.ctid
        AND a."Nama House" = b."Nama House"
        AND COALESCE(a."Class", '') = COALESCE(b."Class", '')
        AND COALESCE(a."Cabang", '') = COALESCE(b."Cabang", '')
        AND COALESCE(a."Program", '') = COALESCE(b."Program", '')
        AND COALESCE(a."Total Gold", 0) = COALESCE(b."Total Gold", 0);
    `);
    console.log(`🧹 Cleaned up duplicate rows! Deleted: ${res.rowCount} duplicate rows.`);

    const count = await db.query('SELECT COUNT(*) FROM house_rank;');
    console.log(`📊 Current remaining unique rows in DB: ${count.rows[0].count}`);
  } catch (err) {
    console.error('Error cleaning up duplicates:', err);
  } finally {
    process.exit(0);
  }
}

cleanupDuplicates();
