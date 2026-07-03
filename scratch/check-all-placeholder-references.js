const db = require('../src/db/neonClient');

async function main() {
  try {
    // Get all trainee IDs that match 'Trainee %'
    const traineeRes = await db.query("SELECT id, trainee_name FROM dashboard_trainne WHERE trainee_name LIKE 'Trainee %'");
    const placeholderIds = traineeRes.rows.map(r => r.id);
    
    console.log(`Found ${placeholderIds.length} placeholder trainees.`);

    if (placeholderIds.length === 0) {
      console.log('No placeholder trainees found.');
      process.exit(0);
    }

    // Check references in related tables
    const tablesToCheck = [
      { name: 'quarterly_report', col: 'trainee_id' },
      { name: 'real_stage', col: 'trainee_id' },
      { name: 'quiz_history', col: 'trainee_id' },
      { name: 'awards', col: 'trainee_id' },
      { name: 'myby_coin', col: 'trainee_id' },
      { name: 'myby_coin_shop_transaction', col: 'trainee_id' },
      { name: 'myby_coin_deposit', col: 'trainee_id' },
      { name: 'myby_coin_transfer', col: 'sender_id' },
      { name: 'myby_coin_transfer', col: 'recipient_id' },
      { name: 'myby_coin_ledger', col: 'trainee_id' }
    ];

    console.log('Checking references...');
    for (const t of tablesToCheck) {
      const res = await db.query(`
        SELECT COUNT(*) AS count 
        FROM "${t.name}" 
        WHERE "${t.col}" = ANY($1)
      `, [placeholderIds]);
      
      const count = parseInt(res.rows[0].count, 10);
      if (count > 0) {
        console.log(`Table "${t.name}" (column "${t.col}") has ${count} rows referencing these placeholders.`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
