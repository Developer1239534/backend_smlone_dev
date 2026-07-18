const db = require('../src/db/neonClient');

async function dropTables() {
  const tables = [
    'level_1_ca_cleaned_trainee',
    'level_1_ca_registrations',
    'level_1_cp_cleaned_trainee',
    'level_1_cp_registrations',
    'level_1_tr_cleaned_trainee',
    'level_1_tr_registrations',
    'level_2_feedback_students',
    'level_2_report_seluruh_cabang'
  ];

  console.log('Starting drop tables process...');
  for (const table of tables) {
    try {
      console.log(`Dropping table: ${table}...`);
      await db.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      console.log(`Successfully dropped ${table}`);
    } catch (e) {
      console.error(`Failed to drop ${table}:`, e.message);
    }
  }
  console.log('All drops completed.');
  process.exit(0);
}

dropTables();
