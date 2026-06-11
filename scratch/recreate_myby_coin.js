require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    console.log('🔄 Dropping old myby_coin table...');
    await db.query('DROP TABLE IF EXISTS myby_coin CASCADE');
    
    console.log('🔄 Creating new myby_coin table...');
    await db.query(`
      CREATE TABLE myby_coin (
        id VARCHAR(50) PRIMARY KEY,
        trainee_name VARCHAR(255) NOT NULL,
        myby_balance INTEGER DEFAULT 0,
        gp_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Table myby_coin recreated successfully with new structure!');
  } catch (err) {
    console.error('❌ Error recreating table:', err.message);
  } finally {
    await db.pool.end();
  }
})();
