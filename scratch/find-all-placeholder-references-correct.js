const db = require('../src/db/neonClient');

async function main() {
  try {
    // 1. Get all placeholder trainee IDs
    const traineeRes = await db.query("SELECT id FROM dashboard_trainne WHERE trainee_name LIKE 'Trainee %'");
    const placeholderIds = traineeRes.rows.map(r => r.id);
    console.log(`Found ${placeholderIds.length} placeholder trainees.`);

    if (placeholderIds.length === 0) {
      console.log('No placeholder trainees.');
      process.exit(0);
    }

    // 2. Get all columns in public tables
    const colsRes = await db.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
    `);

    console.log('=== SCANNING ALL TABLES FOR REFERENCES TO PLACEHOLDER TRAINEES ===');
    const checked = new Set();
    const references = {};

    for (const row of colsRes.rows) {
      const tableName = row.table_name;
      const columnName = row.column_name;
      const lowerTable = tableName.toLowerCase();
      const lowerCol = columnName.toLowerCase();

      // Skip backup tables
      if (lowerTable.includes('backup') || lowerTable.includes('temp')) {
        continue;
      }

      // Check if it looks like trainee reference
      if (lowerCol.includes('id') || lowerCol.includes('trainee') || lowerCol.includes('student')) {
        const key = `${tableName}.${columnName}`;
        if (checked.has(key)) continue;
        checked.add(key);

        try {
          const checkRes = await db.query(`
            SELECT COUNT(*) AS count 
            FROM "${tableName}" 
            WHERE CAST("${columnName}" AS VARCHAR) = ANY($1)
          `, [placeholderIds]);
          
          const cnt = parseInt(checkRes.rows[0].count, 10);
          if (cnt > 0) {
            // Check if this is the table itself or a rank_id reference (rank_id value is not trainee_id)
            if (tableName === 'dashboard_trainne' && columnName !== 'id') {
              continue;
            }
            if (lowerCol.includes('rank') || lowerCol.includes('question') || lowerCol.includes('award')) {
              // Wait, let's distinguish if this is a primary key that just happens to match (like awards.id = 20)
              // If it's awards.id, that's award PK, not trainee reference!
              if (columnName === 'id' && tableName !== 'dashboard_trainne') {
                continue;
              }
            }
            console.log(`Table "${tableName}" (column "${columnName}") has ${cnt} rows referencing placeholders.`);
            references[tableName] = references[tableName] || [];
            references[tableName].push({ column: columnName, count: cnt });
          }
        } catch (e) {
          // Ignore type cast or check errors
        }
      }
    }

    console.log('\nScan completed. References to clean up:', references);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
