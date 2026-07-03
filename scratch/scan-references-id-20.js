const db = require('../src/db/neonClient');

async function main() {
  try {
    // 1. Get all columns in all public tables
    const colsRes = await db.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);

    console.log('=== SCANNING ALL COLUMNS FOR REFERENCES TO ID 20 ===');
    const checked = new Set();

    for (const row of colsRes.rows) {
      const tableName = row.table_name;
      const columnName = row.column_name;

      // Only check tables/columns that might reference a trainee (e.g. name contains 'id' or 'trainee' or 'student')
      const lowerCol = columnName.toLowerCase();
      const lowerTable = tableName.toLowerCase();

      // Skip backup tables to avoid clutter
      if (lowerTable.includes('backup') || lowerTable.includes('temp')) {
        continue;
      }

      if (lowerCol.includes('id') || lowerCol.includes('trainee') || lowerCol.includes('student')) {
        const key = `${tableName}.${columnName}`;
        if (checked.has(key)) continue;
        checked.add(key);

        try {
          const checkRes = await db.query(`SELECT COUNT(*) AS count FROM "${tableName}" WHERE CAST("${columnName}" AS VARCHAR) = '20'`);
          const cnt = parseInt(checkRes.rows[0].count, 10);
          if (cnt > 0) {
            console.log(`Found reference in ${tableName}.${columnName}: ${cnt} row(s)`);
          }
        } catch (e) {
          // Ignore type cast errors or column mismatch errors
        }
      }
    }

    console.log('Scan completed.');

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
