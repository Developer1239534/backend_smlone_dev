const db = require('./src/db/neonClient');

async function cleanClassNames() {
  try {
    console.log('Cleaning class_name in portal_admin (removing parenthetical schedule notes like "(Tue 4-6)")...');

    const before = await db.query(`SELECT DISTINCT class_name FROM portal_admin WHERE class_name LIKE '%(%' ORDER BY class_name;`);
    console.log('Class names before cleaning:', before.rows.map(r => r.class_name));

    await db.query(`
      UPDATE portal_admin 
      SET class_name = TRIM(REGEXP_REPLACE(class_name, '\\s*\\([^)]*\\)', '', 'g'))
      WHERE class_name LIKE '%(%';
    `);

    const after = await db.query(`SELECT DISTINCT class_name FROM portal_admin WHERE class_name IS NOT NULL ORDER BY class_name;`);
    console.log('Class names after cleaning:', after.rows.map(r => r.class_name));

    console.log('Successfully cleaned all class_name values!');
  } catch (err) {
    console.error('Error cleaning class names:', err);
  } finally {
    process.exit(0);
  }
}

cleanClassNames();
