const db = require('../src/db/neonClient');

async function dropAllTables() {
  const tables = [
    'level_1_ca_registrations',
    'level_1_ca_cleaned_trainee',
    'level_1_cp_registrations',
    'level_1_tr_registrations',
    'level_1_tr_cleaned_trainee',
    'level_1_cp_cleaned_trainee',
    'level_2_report_seluruh_cabang',
    'level_2_feedback_students'
  ];

  try {
    for (const table of tables) {
      console.log(`Dropping table ${table}...`);
      await db.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    }
    console.log('Successfully dropped all tables EXCEPT admin_akun.');
    process.exit(0);
  } catch (err) {
    console.error('Error dropping tables:', err);
    process.exit(1);
  }
}

dropAllTables();
