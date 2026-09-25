/**
 * ============================================================
 * MYBY COIN - DATABASE INITIALIZATION & REPOSITORY
 * ============================================================
 * Mengatur DDL Database Neon PostgreSQL:
 * 1. Kolom "ID" sebagai PRIMARY KEY
 * 2. Kolom "Name" sebagai SECONDARY KEY (Indexed)
 * ============================================================
 */

const db = require('../../db/neonClient');
const { DEFAULT_REWARDS } = require('./mybyCoinConstants');

let isTablesEnsured = false;

// Helper: Ambil profil anak dari profile_trainee atau credential_portal
async function getTraineeProfile(traineeId) {
  let profile = {
    ID: String(traineeId || '').trim(),
    Name: 'Trainee SMLONE',
    HOUSE: 'House of Thenova',
    Class: 'Public Speaking Alpha'
  };

  if (!profile.ID) return profile;

  try {
    const profRes = await db.query(
      'SELECT "ID", "Name", "HOUSE", "Class" FROM profile_trainee WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 OR "Name" ILIKE $1 LIMIT 1',
      [profile.ID]
    );
    if (profRes.rows.length > 0) {
      profile.ID = profRes.rows[0].ID;
      profile.Name = profRes.rows[0].Name || profile.Name;
      profile.HOUSE = profRes.rows[0].HOUSE || profile.HOUSE;
      profile.Class = profRes.rows[0].Class || profile.Class;
      return profile;
    }

    const credRes = await db.query(
      'SELECT "ID", "Name" FROM credential_portal WHERE "ID" = $1 OR "ID" ILIKE $1 OR "Name" = $1 OR "Name" ILIKE $1 LIMIT 1',
      [profile.ID]
    );
    if (credRes.rows.length > 0) {
      profile.ID = credRes.rows[0].ID;
      profile.Name = credRes.rows[0].Name || profile.Name;
    }
  } catch (e) {
    console.warn('[MyBy Coin] Profile fetch fallback:', e.message);
  }
  return profile;
}

// Inisialisasi tabel di Neon PostgreSQL dengan ID sebagai PK dan Name sebagai Secondary Key
async function ensureMyByCoinTables() {
  if (isTablesEnsured) return;
  try {
    // 1. Migrasi otomatis jika sebelumnya ada tabel dengan kolom trainee_id
    await db.query(`
      DO $$
      BEGIN
        -- myby_trainee_wallets
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'myby_trainee_wallets') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_wallets' AND column_name = 'trainee_id') THEN
            ALTER TABLE myby_trainee_wallets RENAME COLUMN trainee_id TO "ID";
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_wallets' AND column_name = 'Name') THEN
            ALTER TABLE myby_trainee_wallets ADD COLUMN "Name" VARCHAR(255);
          END IF;
        END IF;

        -- myby_trainee_streaks
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'myby_trainee_streaks') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_streaks' AND column_name = 'trainee_id') THEN
            ALTER TABLE myby_trainee_streaks RENAME COLUMN trainee_id TO "ID";
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_streaks' AND column_name = 'Name') THEN
            ALTER TABLE myby_trainee_streaks ADD COLUMN "Name" VARCHAR(255);
          END IF;
        END IF;

        -- myby_coin_transactions
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'myby_coin_transactions') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_coin_transactions' AND column_name = 'trainee_id') THEN
            ALTER TABLE myby_coin_transactions RENAME COLUMN trainee_id TO "ID";
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_coin_transactions' AND column_name = 'Name') THEN
            ALTER TABLE myby_coin_transactions ADD COLUMN "Name" VARCHAR(255);
          END IF;
        END IF;

        -- myby_redeem_requests
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'myby_redeem_requests') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_redeem_requests' AND column_name = 'trainee_id') THEN
            ALTER TABLE myby_redeem_requests RENAME COLUMN trainee_id TO "ID";
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_redeem_requests' AND column_name = 'Name') THEN
            ALTER TABLE myby_redeem_requests ADD COLUMN "Name" VARCHAR(255);
          END IF;
        END IF;
      END $$;
    `);

    // 2. DDL Pembuatan Tabel
    await db.query(`
      CREATE TABLE IF NOT EXISTS myby_trainee_wallets (
        "ID" VARCHAR(255) PRIMARY KEY,
        "Name" VARCHAR(255),
        balance INTEGER DEFAULT 0 CHECK (balance >= 0),
        total_earned INTEGER DEFAULT 0,
        total_spent INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_wallets_name ON myby_trainee_wallets ("Name");

      CREATE TABLE IF NOT EXISTS myby_trainee_streaks (
        "ID" VARCHAR(255) PRIMARY KEY,
        "Name" VARCHAR(255),
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        streak_cycle_day INTEGER DEFAULT 1,
        last_check_in_date DATE,
        total_check_ins INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_streaks_name ON myby_trainee_streaks ("Name");

      CREATE TABLE IF NOT EXISTS myby_coin_transactions (
        id VARCHAR(100) PRIMARY KEY,
        "ID" VARCHAR(255) NOT NULL,
        "Name" VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL,
        badge VARCHAR(100) DEFAULT 'Streak Reward',
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_tx_id ON myby_coin_transactions ("ID");
      CREATE INDEX IF NOT EXISTS idx_myby_tx_name ON myby_coin_transactions ("Name");

      CREATE TABLE IF NOT EXISTS myby_rewards_catalog (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        cost INTEGER NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        tag VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS myby_redeem_requests (
        id VARCHAR(100) PRIMARY KEY,
        "ID" VARCHAR(255) NOT NULL,
        "Name" VARCHAR(255),
        reward_id VARCHAR(100) NOT NULL,
        reward_title VARCHAR(255) NOT NULL,
        coins_spent INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_redeem_id ON myby_redeem_requests ("ID");
      CREATE INDEX IF NOT EXISTS idx_myby_redeem_name ON myby_redeem_requests ("Name");
    `);

    // 3. Seed catalog rewards jika kosong
    const countCheck = await db.query('SELECT COUNT(*) FROM myby_rewards_catalog');
    if (parseInt(countCheck.rows[0].count, 10) === 0) {
      for (const item of DEFAULT_REWARDS) {
        await db.query(`
          INSERT INTO myby_rewards_catalog (id, title, category, cost, stock, image_url, tag, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [item.id, item.title, item.category, item.cost, item.stock, item.image_url, item.tag, item.description]);
      }
    }

    isTablesEnsured = true;
  } catch (err) {
    console.error('[MyBy Coin] Ensure tables error:', err.message);
  }
}

module.exports = {
  ensureMyByCoinTables,
  getTraineeProfile
};
