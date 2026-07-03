const db = require('../src/db/neonClient');

async function main() {
  try {
    // Check if column wa_trainnee exists
    const checkOld = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dashboard_trainne' AND column_name = 'wa_trainnee';
    `);

    if (checkOld.rows.length > 0) {
      console.log("Column 'wa_trainnee' exists. Renaming to 'wa_trainee'...");
      await db.query(`
        ALTER TABLE dashboard_trainne RENAME COLUMN wa_trainnee TO wa_trainee;
      `);
      console.log("✅ Column renamed successfully!");
    } else {
      console.log("Column 'wa_trainnee' does not exist. Checking for 'wa_trainee'...");
      const checkNew = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'dashboard_trainne' AND column_name = 'wa_trainee';
      `);
      if (checkNew.rows.length > 0) {
        console.log("Column 'wa_trainee' already exists. No action needed.");
      } else {
        console.log("Neither column exists. Creating 'wa_trainee'...");
        await db.query(`
          ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS wa_trainee VARCHAR(50) DEFAULT NULL;
        `);
        console.log("✅ Column 'wa_trainee' created successfully!");
      }
    }

    // Verify
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'dashboard_trainne' AND column_name = 'wa_trainee';
    `);
    console.log('Column details in DB:', res.rows);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

main();
