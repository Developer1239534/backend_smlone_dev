const db = require('../src/db/neonClient');

async function checkDuplicates() {
  try {
    const idDuplicates = await db.query(`
      SELECT id, COUNT(*) 
      FROM dashboard_trainne 
      GROUP BY id 
      HAVING COUNT(*) > 1;
    `);
    console.log('Duplicate IDs in DB:', idDuplicates.rows);

    const nameDuplicates = await db.query(`
      SELECT trainee_name, COUNT(*) 
      FROM dashboard_trainne 
      GROUP BY trainee_name 
      HAVING COUNT(*) > 1;
    `);
    console.log('Duplicate names in DB (total):', nameDuplicates.rows.length);
    if (nameDuplicates.rows.length > 0) {
      console.log('Sample duplicate names:', nameDuplicates.rows.slice(0, 5));
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkDuplicates();
