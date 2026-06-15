require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('🔌 Connecting to Neon database for analysis...');

    // 1. Get all columns of dashboard_trainne
    const columnsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'dashboard_trainne' 
        AND table_schema = 'public'
    `);
    const columns = columnsRes.rows;

    // 2. Count total rows
    const totalRes = await pool.query('SELECT COUNT(*) FROM dashboard_trainne');
    const totalRows = parseInt(totalRes.rows[0].count, 10);
    console.log(`Total rows in dashboard_trainne: ${totalRows}\n`);

    // 3. For each column, count how many non-null values exist
    const selectParts = [];
    for (const col of columns) {
      selectParts.push(`COUNT("${col.column_name}") AS "${col.column_name}_non_null_count"`);
    }

    const countRes = await pool.query(`SELECT ${selectParts.join(', ')} FROM dashboard_trainne`);
    const counts = countRes.rows[0];

    const nullColumns = [];
    const nonNullColumns = [];

    for (const col of columns) {
      const colName = col.column_name;
      const nonNullCount = parseInt(counts[`${colName}_non_null_count`], 10) || 0;
      const nullCount = totalRows - nonNullCount;

      if (nonNullCount === 0) {
        nullColumns.push(colName);
      } else {
        nonNullColumns.push({ name: colName, nullCount, nonNullCount });
      }
    }

    console.log('❌ Columns that are 100% NULL (no data at all):');
    console.log(nullColumns);
    console.log('');

    console.log('📋 Columns with some data:');
    console.table(nonNullColumns);
    console.log('');

    // 4. Compare "name" vs "trainee_name"
    const compareRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "name" IS NOT NULL THEN 1 ELSE 0 END) as name_not_null,
        SUM(CASE WHEN "trainee_name" IS NOT NULL THEN 1 ELSE 0 END) as trainee_name_not_null,
        SUM(CASE WHEN TRIM("name") = TRIM("trainee_name") THEN 1 ELSE 0 END) as equal_count,
        SUM(CASE WHEN "name" IS NULL AND "trainee_name" IS NOT NULL THEN 1 ELSE 0 END) as name_null_trainee_name_not
      FROM dashboard_trainne
    `);
    console.log('Comparing "name" vs "trainee_name":');
    console.log(compareRes.rows[0]);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}
run();
