const db = require('../src/db/neonClient');

async function deepCheck() {
  try {
    console.log('🔍 Starting deep duplicate analysis on dashboard_trainne table...\n');

    // 1. Exact ID duplicates
    const idDup = await db.query(`
      SELECT id, COUNT(*) 
      FROM dashboard_trainne 
      GROUP BY id 
      HAVING COUNT(*) > 1;
    `);
    console.log(`1. Duplicate IDs (Exact): ${idDup.rows.length}`);
    if (idDup.rows.length > 0) {
      console.log(idDup.rows);
    }

    // 2. Exact Name duplicates
    const nameDup = await db.query(`
      SELECT trainee_name, COUNT(*) 
      FROM dashboard_trainne 
      GROUP BY trainee_name 
      HAVING COUNT(*) > 1;
    `);
    console.log(`2. Duplicate Names (Exact case-sensitive): ${nameDup.rows.length}`);
    if (nameDup.rows.length > 0) {
      console.log(nameDup.rows);
    }

    // 3. Case-Insensitive Name duplicates
    const nameCaseInsensitiveDup = await db.query(`
      SELECT LOWER(TRIM(trainee_name)) as cleaned_name, COUNT(*) 
      FROM dashboard_trainne 
      GROUP BY LOWER(TRIM(trainee_name)) 
      HAVING COUNT(*) > 1;
    `);
    console.log(`3. Duplicate Names (Case-Insensitive & Trimmed): ${nameCaseInsensitiveDup.rows.length}`);
    if (nameCaseInsensitiveDup.rows.length > 0) {
      console.log(nameCaseInsensitiveDup.rows);
    }

    // 4. Duplicate Phone numbers (excluding null, empty string, or defaults)
    const phoneDup = await db.query(`
      SELECT phone, COUNT(*) 
      FROM dashboard_trainne 
      WHERE phone IS NOT NULL AND phone != '' AND phone != '-'
      GROUP BY phone 
      HAVING COUNT(*) > 1;
    `);
    console.log(`4. Duplicate Phone Numbers: ${phoneDup.rows.length}`);
    if (phoneDup.rows.length > 0) {
      console.log(phoneDup.rows);
    }

    // 5. Duplicate Names with normalized whitespace (multiple spaces converted to single space)
    const normalizedNameDup = await db.query(`
      SELECT REGEXP_REPLACE(LOWER(TRIM(trainee_name)), '\\s+', ' ', 'g') as normalized_name, COUNT(*)
      FROM dashboard_trainne
      GROUP BY REGEXP_REPLACE(LOWER(TRIM(trainee_name)), '\\s+', ' ', 'g')
      HAVING COUNT(*) > 1;
    `);
    console.log(`5. Duplicate Names (Normalized Whitespaces & Case-Insensitive): ${normalizedNameDup.rows.length}`);
    if (normalizedNameDup.rows.length > 0) {
      console.log(normalizedNameDup.rows);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during deep duplicate check:', error);
    process.exit(1);
  }
}

deepCheck();
