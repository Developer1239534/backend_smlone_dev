const db = require('../src/db/neonClient');

async function addColumns() {
  try {
    console.log('Adding new columns to table dashboard_trainne...');
    await db.query(`
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS house_sml VARCHAR(255) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS total_gold_periode VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS junior_youth VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_timor VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_timor VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_tritura VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_tritura VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_junior_cemara VARCHAR(50) DEFAULT NULL;
      ALTER TABLE dashboard_trainne ADD COLUMN IF NOT EXISTS rank_id_youth_cemara VARCHAR(50) DEFAULT NULL;
    `);
    console.log('Successfully added all columns!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addColumns();
