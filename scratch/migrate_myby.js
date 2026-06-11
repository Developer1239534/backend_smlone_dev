require('dotenv').config();
const db = require('../src/db/neonClient');

(async () => {
  try {
    console.log('🔄 Running MYBY Coin migrations...');

    // 0. Enable pgcrypto for gen_random_uuid() just in case
    await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // 1. Create myby_wallets table
    console.log('🔄 Creating myby_wallets table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trainee_id VARCHAR(50) UNIQUE NOT NULL,
        myby_balance INTEGER DEFAULT 0,
        gp_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainee_id) REFERENCES dashboard_trainne(id) ON DELETE CASCADE
      );
    `);

    // 2. Create myby_transactions table
    console.log('🔄 Creating myby_transactions table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trainee_id VARCHAR(50) NOT NULL,
        transaction_type VARCHAR(20) CHECK (transaction_type IN ('earn', 'convert', 'deposit', 'withdrawal', 'redeem')),
        amount INTEGER NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainee_id) REFERENCES dashboard_trainne(id) ON DELETE CASCADE
      );
    `);

    // 3. Create myby_conversions table
    console.log('🔄 Creating myby_conversions table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_conversions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trainee_id VARCHAR(50) NOT NULL,
        myby_amount INTEGER NOT NULL,
        gp_received INTEGER NOT NULL,
        conversion_rate NUMERIC DEFAULT 50.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainee_id) REFERENCES dashboard_trainne(id) ON DELETE CASCADE
      );
    `);

    // 4. Create rewards table
    console.log('🔄 Creating rewards table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        myby_cost INTEGER NOT NULL,
        stock INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create reward_redemptions table
    console.log('🔄 Creating reward_redemptions table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS reward_redemptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trainee_id VARCHAR(50) NOT NULL,
        reward_id UUID NOT NULL,
        myby_spent INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainee_id) REFERENCES dashboard_trainne(id) ON DELETE CASCADE,
        FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
      );
    `);

    // 6. Seed sample rewards if empty
    console.log('🔄 Seeding sample rewards...');
    const rewardCountRes = await db.query('SELECT COUNT(*) FROM rewards');
    const rewardCount = parseInt(rewardCountRes.rows[0].count);
    
    if (rewardCount === 0) {
      await db.query(`
        INSERT INTO rewards (name, description, myby_cost, stock) VALUES
        ('SML Premium T-Shirt', 'Exclusive high-quality cotton T-Shirt with SML branding.', 100, 50),
        ('Gold Trophy Badge', 'Show off your achievement on your profile card.', 250, 15),
        ('Extra Gold Point Pack (+5 GP)', 'Instant booster pack of 5 Gold Points added to your profile.', 250, 99),
        ('SML Exclusive Sticker Pack', 'Fun and creative stickers for your laptops and notebooks.', 50, 100)
      `);
      console.log('✅ Seeding completed!');
    } else {
      console.log('ℹ️ Rewards table already has data, skipping seeding.');
    }

    console.log('✅ All migrations ran successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await db.pool.end();
  }
})();
