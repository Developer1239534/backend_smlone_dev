require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    console.log('🔄 Checking if myby_coin table exists...');
    // Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_coin (
        id VARCHAR(50) PRIMARY KEY,
        trainee_name VARCHAR(255) NOT NULL,
        myby_balance INTEGER DEFAULT 0,
        gp_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ myby_coin table is ready.');

    console.log('🔄 Fetching all trainees from dashboard_trainne...');
    const traineesResult = await db.query('SELECT id, trainee_name, total_gold_periode FROM dashboard_trainne');
    const trainees = traineesResult.rows;
    console.log(`✅ Found ${trainees.length} trainees in dashboard_trainne.`);

    console.log('🔄 Inserting trainees into myby_coin with their total_gold_periode as gp_balance...');
    let insertedCount = 0;
    
    for (const trainee of trainees) {
      const initialGp = trainee.total_gold_periode ? parseInt(trainee.total_gold_periode, 10) || 0 : 0;
      const result = await db.query(`
        INSERT INTO myby_coin (id, trainee_name, myby_balance, gp_balance)
        VALUES ($1, $2, 0, $3)
        ON CONFLICT (id) 
        DO UPDATE SET 
          trainee_name = EXCLUDED.trainee_name,
          gp_balance = EXCLUDED.gp_balance
        WHERE myby_coin.trainee_name <> EXCLUDED.trainee_name OR myby_coin.gp_balance <> EXCLUDED.gp_balance
        RETURNING id
      `, [trainee.id, trainee.trainee_name, initialGp]);

      if (result.rowCount > 0) {
        insertedCount++;
      }
    }

    // Also find how many currently exist in myby_coin
    const totalWalletResult = await db.query('SELECT COUNT(*) FROM myby_coin');
    const totalWallets = totalWalletResult.rows[0].count;

    console.log(`✅ Finished population!`);
    console.log(`👉 Trainees processed/inserted/updated: ${insertedCount}`);
    console.log(`👉 Total wallets in myby_coin: ${totalWallets}`);

  } catch (err) {
    console.error('❌ Error populating myby_coin table:', err.message);
  } finally {
    await db.pool.end();
    console.log('🔌 DB connection closed.');
  }
})();
