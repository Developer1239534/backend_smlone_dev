const db = require('../src/db/neonClient');
const fs = require('fs');
const path = require('path');

async function cleanClassNames() {
  console.log('🔄 Cleaning class_name in gold_point_rankings (removing schedules like (Sat 4-6)...');

  const res = await db.query(`
    UPDATE gold_point_rankings 
    SET class_name = TRIM(REGEXP_REPLACE(class_name, '\\s*\\(.*?\\)', '', 'g'))
    WHERE class_name LIKE '%(%';
  `);

  console.log(`✅ Updated ${res.rowCount} rows in gold_point_rankings!`);

  // Verify cleaned class names
  const sampleRes = await db.query(`SELECT DISTINCT class_name FROM gold_point_rankings ORDER BY class_name ASC;`);
  console.log('📋 Distinct class names in database:');
  sampleRes.rows.forEach(r => console.log('  -', r.class_name));

  // Re-export seed_gold_point_rankings.json
  const exportRes = await db.query('SELECT * FROM gold_point_rankings ORDER BY period DESC, category ASC, program ASC, ranking ASC');
  const jsonPath = path.join(__dirname, 'seed_gold_point_rankings.json');
  fs.writeFileSync(jsonPath, JSON.stringify(exportRes.rows, null, 2), 'utf8');
  console.log(`📦 Re-exported seed_gold_point_rankings.json successfully! (${exportRes.rows.length} total rows)`);

  process.exit(0);
}

cleanClassNames().catch(console.error);
