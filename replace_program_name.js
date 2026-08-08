const db = require('./src/db/neonClient');

async function replaceProgramName() {
  try {
    console.log('🔄 Replacing "Junior/Youth Program" with "Core/Orator Society Program" in database...');

    // 1. Update login_portalllll table
    const lpRes = await db.query(`
      UPDATE login_portalllll 
      SET cleaned_program = 'Core/Orator Society Program' 
      WHERE cleaned_program ILIKE '%Junior/Youth%' 
         OR cleaned_program ILIKE '%Junior/Youth Program%';
    `);
    console.log(`✅ Updated ${lpRes.rowCount} rows in login_portalllll table!`);

    // 2. Check if gold_point_rankings has program or category matching Junior/Youth Program
    const gpRes = await db.query(`
      UPDATE gold_point_rankings 
      SET program = 'Core/Orator Society Program' 
      WHERE program ILIKE '%Junior/Youth%';
    `);
    console.log(`✅ Updated ${gpRes.rowCount} rows in gold_point_rankings table!`);

    console.log('🎉 Program replacement completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating program name:', err);
    process.exit(1);
  }
}

replaceProgramName();
