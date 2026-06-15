require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('🔌 Connecting to database for inspection...');

    // Columns to inspect
    const cols = [
      'quarterly_report',
      'laporan_terkini',
      'laporan_sebelumnya',
      'laporan_quarter_sebelumnya',
      'highlight_terbaru'
    ];

    const selectParts = [];
    for (const col of cols) {
      selectParts.push(`
        SUM(CASE WHEN "${col}" IS NULL THEN 1 ELSE 0 END) as "${col}_null_count",
        SUM(CASE WHEN "${col}" = '' THEN 1 ELSE 0 END) as "${col}_empty_string_count",
        SUM(CASE WHEN "${col}" IS NOT NULL AND "${col}" != '' THEN 1 ELSE 0 END) as "${col}_has_data_count"
      `);
    }

    const res = await pool.query(`SELECT ${selectParts.join(', ')} FROM dashboard_trainne`);
    const stats = res.rows[0];

    console.log('\n📊 Detailed Statistics in database:');
    
    for (const col of cols) {
      const nulls = parseInt(stats[`${col}_null_count`], 10) || 0;
      const empties = parseInt(stats[`${col}_empty_string_count`], 10) || 0;
      const hasData = parseInt(stats[`${col}_has_data_count`], 10) || 0;
      const total = nulls + empties + hasData;

      console.log(`\n🔹 Column: ${col}`);
      console.log(`   - NULL: ${nulls} rows (${((nulls/total)*100).toFixed(1)}%)`);
      console.log(`   - Empty String (' '): ${empties} rows (${((empties/total)*100).toFixed(1)}%)`);
      console.log(`   - Has Actual Data: ${hasData} rows (${((hasData/total)*100).toFixed(1)}%)`);

      if (hasData > 0) {
        // Fetch 3 samples of actual data
        const sampleRes = await pool.query(
          `SELECT id, trainee_name, "${col}" FROM dashboard_trainne WHERE "${col}" IS NOT NULL AND "${col}" != '' LIMIT 3`
        );
        console.log(`   - Samples with actual data:`);
        sampleRes.rows.forEach(s => {
          console.log(`     * ID: ${s.id} | Name: ${s.trainee_name} -> "${s[col]}"`);
        });
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}
run();
