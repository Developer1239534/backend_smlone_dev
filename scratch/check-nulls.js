require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: DATABASE_URL is not set in your environment or .env file!');
  console.log('\nTo resolve this:');
  console.log('1. Create a file named \x1b[33m.env\x1b[0m in the project root directory.');
  console.log('2. Add your Neon connection string inside it:');
  console.log('   \x1b[32mDATABASE_URL="postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require"\x1b[0m\n');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkNulls() {
  try {
    console.log('🔌 Connecting to Neon database...');
    
    // Get all public user tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const { rows: tables } = await pool.query(tablesQuery);

    if (tables.length === 0) {
      console.log('⚠️ No public tables found in the database.');
      return;
    }

    console.log(`📊 Found ${tables.length} tables. Scanning for NULL values...\n`);

    for (const table of tables) {
      const tableName = table.table_name;
      
      // Get all columns for this table
      const columnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
          AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      const { rows: columns } = await pool.query(columnsQuery, [tableName]);

      if (columns.length === 0) continue;

      // Construct a query to count NULLs for each column in one go
      // Example: SELECT COUNT(*) as _total, SUM(CASE WHEN col IS NULL THEN 1 ELSE 0 END) as col_nulls FROM table
      const selectParts = ['COUNT(*) as _total'];
      for (const col of columns) {
        // Wrap column name in double quotes to handle keywords/spaces
        selectParts.push(`SUM(CASE WHEN "${col.column_name}" IS NULL THEN 1 ELSE 0 END) AS "${col.column_name}_nulls"`);
      }

      const scanQuery = `SELECT ${selectParts.join(', ')} FROM "${tableName}"`;
      const { rows: scanResult } = await pool.query(scanQuery);
      
      const stats = scanResult[0];
      const totalRows = parseInt(stats._total, 10);

      console.log(`\x1b[36m=== Table: ${tableName} (${totalRows} rows) ===\x1b[0m`);

      if (totalRows === 0) {
        console.log('   (Empty table - no data to inspect)');
        console.log('');
        continue;
      }

      let nullColumnsCount = 0;
      for (const col of columns) {
        const colName = col.column_name;
        const nullCount = parseInt(stats[`${colName}_nulls`], 10) || 0;
        
        if (nullCount > 0) {
          nullColumnsCount++;
          const percentage = ((nullCount / totalRows) * 100).toFixed(1);
          console.log(`   ❌ Column \x1b[33m${colName}\x1b[0m: \x1b[31m${nullCount} NULLs\x1b[0m (${percentage}%) [Type: ${col.data_type}]`);
        }
      }

      if (nullColumnsCount === 0) {
        console.log('   ✅ No NULL values found in any columns.');
      }
      console.log('');
    }

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Database scanning error:', error.message);
  } finally {
    await pool.end();
  }
}

checkNulls();
