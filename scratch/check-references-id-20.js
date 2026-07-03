const db = require('../src/db/neonClient');

async function main() {
  try {
    const tables = [
      { name: 'quarterly_report', col: 'id_trainee' },
      { name: 'quiz_history', col: 'trainee_id' },
      { name: 'awards', col: 'trainee_id' },
      { name: 'myby_coin', col: 'trainee_id' },
      { name: 'myby_coin_shop_transaction', col: 'trainee_id' },
      { name: 'myby_coin_deposit', col: 'trainee_id' },
      { name: 'myby_coin_transfer', col: 'sender_id' }, // sender_id or recipient_id
      { name: 'myby_coin_transfer', col: 'recipient_id' },
      { name: 'real_stage', col: 'trainee_id' },
      { name: 'myby_coin_ledger', col: 'trainee_id' }
    ];

    console.log('=== CHECKING REFERENCES FOR TRAINEE ID 20 ===');
    for (const t of tables) {
      const res = await db.query(`SELECT COUNT(*) AS count FROM "${t.name}" WHERE "${t.col}" = '20'`);
      if (parseInt(res.rows[0].count, 10) > 0) {
        console.log(`Table ${t.name} (column ${t.col}): ${res.rows[0].count} rows`);
      }
    }
    console.log('Finished checking.');
  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
