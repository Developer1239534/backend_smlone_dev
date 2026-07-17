const db = require('../src/db/neonClient');

async function main() {
  try {
    // Check keys in raw_data to find the exact key name
    const check = await db.query(`
      SELECT jsonb_object_keys(raw_data) as key 
      FROM level_1_ca_cleaned_trainee 
      LIMIT 100
    `);
    const keys = new Set(check.rows.map(r => r.key));
    let targetKey = null;
    for (const key of keys) {
      if (key.includes('<2022 students grade helper') || key.includes('2022 students grade helper')) {
        targetKey = key;
        break;
      }
    }
    
    console.log('Found key to remove:', targetKey);
    
    if (targetKey) {
      console.log('Removing key from raw_data...');
      const res = await db.query(`
        UPDATE level_1_ca_cleaned_trainee
        SET raw_data = raw_data - $1
      `, [targetKey]);
      console.log(`Updated ${res.rowCount} rows.`);
    } else {
      console.log('Key not found in raw_data, falling back to exact match for "<2022 students grade helper "');
      const res = await db.query(`
        UPDATE level_1_ca_cleaned_trainee
        SET raw_data = raw_data - '<2022 students grade helper '
      `);
      console.log(`Updated ${res.rowCount} rows using fallback exact match.`);
    }
    
    // Also drop the DB column if it exists just in case
    try {
        await db.query(`ALTER TABLE level_1_ca_cleaned_trainee DROP COLUMN IF EXISTS "less_than_2022_students_grade_helper"`);
        console.log('Dropped column less_than_2022_students_grade_helper (if it existed).');
    } catch (e) {
        console.log('Could not drop column (maybe does not exist or permission).');
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

main();
