/**
 * ============================================================
 * MYBY COIN - STANDALONE MIGRATION SCRIPT
 * ============================================================
 * Jalankan sekali untuk membuat semua tabel di Neon PostgreSQL:
 *
 *   node migrate_myby_coin.js
 *
 * Pastikan DATABASE_URL sudah di-set di environment atau .env
 * ============================================================
 */

require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL tidak ditemukan! Set dulu di .env atau environment variable.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DEFAULT_REWARDS = [
  {
    id: 'rew-1',
    title: 'Keychain / Pena SMLONE',
    category: 'Merchandise',
    cost: 30,
    stock: 45,
    tag: 'Terjangkau',
    image_url: 'https://images.unsplash.com/photo-1585336261026-7d6f51954f9a?auto=format&fit=crop&w=600&q=80',
    description: 'Pilihan gantungan kunci akrilik eksklusif atau bolpoin premium berlogo SMLONE.'
  },
  {
    id: 'rew-2',
    title: 'Lego Mini / Notebook A6',
    category: 'Merchandise',
    cost: 50,
    stock: 30,
    tag: 'Populer',
    image_url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=600&q=80',
    description: 'Miniatur Lego karakter menarik atau buku catatan mini saku A6 praktis untuk ide harian.'
  },
  {
    id: 'rew-3',
    title: 'Notebook A5',
    category: 'Stationery',
    cost: 80,
    stock: 35,
    tag: 'Favorit',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'Buku catatan ukuran A5 hardcover elegan untuk mencatat materi modul dan proyek coding.'
  },
  {
    id: 'rew-4',
    title: 'Payung SMLONE / 1 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 100,
    stock: 20,
    tag: 'Pilihan Seru',
    image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    description: 'Payung lipat eksklusif tahan cuaca atau 1 voucher tiket nonton bioskop XXI/CGV.'
  },
  {
    id: 'rew-5',
    title: 'Agenda SMLONE / 2 Tiket Nonton',
    category: 'Voucher & Perk',
    cost: 150,
    stock: 18,
    tag: 'Spesial',
    image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    description: 'Buku agenda kerja eksklusif SMLONE atau paket 2 voucher tiket nonton bioskop.'
  },
  {
    id: 'rew-6',
    title: 'Tumblr SMLONE',
    category: 'Merchandise',
    cost: 200,
    stock: 25,
    tag: 'Best Value',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    description: 'Tumbler stainless steel vacuum insulated tahan dingin & panas hingga 24 jam dengan ukiran SMLONE.'
  },
  {
    id: 'rew-7',
    title: 'Jaket / Tas SMLONE',
    category: 'Merchandise',
    cost: 250,
    stock: 12,
    tag: 'Reward Utama',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    description: 'Jaket bomber/hoodie premium SMLONE atau tas ransel fungsional tahan air edisi terbatas.'
  }
];

async function runMigration() {
  const client = await pool.connect();
  console.log('✅  Terhubung ke Neon PostgreSQL');

  try {
    // Step 1: Migrasi kolom lama jika ada (trainee_id -> ID)
    console.log('\n🔄  Step 1: Migrasi kolom lama (jika ada)...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'myby_trainee_wallets') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_wallets' AND column_name = 'trainee_id') THEN
            ALTER TABLE myby_trainee_wallets RENAME COLUMN trainee_id TO "ID";
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_wallets' AND column_name = 'Name') THEN
            ALTER TABLE myby_trainee_wallets ADD COLUMN "Name" VARCHAR(255);
          END IF;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'myby_trainee_streaks') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_streaks' AND column_name = 'trainee_id') THEN
            ALTER TABLE myby_trainee_streaks RENAME COLUMN trainee_id TO "ID";
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_trainee_streaks' AND column_name = 'Name') THEN
            ALTER TABLE myby_trainee_streaks ADD COLUMN "Name" VARCHAR(255);
          END IF;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'myby_coin_transactions') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_coin_transactions' AND column_name = 'trainee_id') THEN
            ALTER TABLE myby_coin_transactions RENAME COLUMN trainee_id TO "ID";
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'myby_coin_transactions' AND column_name = 'Name') THEN
            ALTER TABLE myby_coin_transactions ADD COLUMN "Name" VARCHAR(255);
          END IF;
        END IF;
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
    console.log('   done');

    // Step 2: Buat tabel baru
    console.log('\n🏗️   Step 2: Membuat tabel (IF NOT EXISTS)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS myby_trainee_wallets (
        "ID"          VARCHAR(255) PRIMARY KEY,
        "Name"        VARCHAR(255),
        balance       INTEGER DEFAULT 0 CHECK (balance >= 0),
        total_earned  INTEGER DEFAULT 0,
        total_spent   INTEGER DEFAULT 0,
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_wallets_name ON myby_trainee_wallets ("Name");

      CREATE TABLE IF NOT EXISTS myby_trainee_streaks (
        "ID"               VARCHAR(255) PRIMARY KEY,
        "Name"             VARCHAR(255),
        current_streak     INTEGER DEFAULT 0,
        longest_streak     INTEGER DEFAULT 0,
        streak_cycle_day   INTEGER DEFAULT 1,
        last_check_in_date DATE,
        total_check_ins    INTEGER DEFAULT 0,
        created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_streaks_name ON myby_trainee_streaks ("Name");

      CREATE TABLE IF NOT EXISTS myby_coin_transactions (
        id         VARCHAR(100) PRIMARY KEY,
        "ID"       VARCHAR(255) NOT NULL,
        "Name"     VARCHAR(255),
        title      VARCHAR(255) NOT NULL,
        amount     INTEGER NOT NULL,
        type       VARCHAR(20) NOT NULL,
        badge      VARCHAR(100) DEFAULT 'Streak Reward',
        metadata   JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_tx_id ON myby_coin_transactions ("ID");
      CREATE INDEX IF NOT EXISTS idx_myby_tx_name ON myby_coin_transactions ("Name");

      CREATE TABLE IF NOT EXISTS myby_rewards_catalog (
        id          VARCHAR(100) PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        category    VARCHAR(100) NOT NULL,
        cost        INTEGER NOT NULL,
        stock       INTEGER DEFAULT 0,
        image_url   TEXT,
        tag         VARCHAR(100),
        description TEXT,
        is_active   BOOLEAN DEFAULT TRUE,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS myby_redeem_requests (
        id           VARCHAR(100) PRIMARY KEY,
        "ID"         VARCHAR(255) NOT NULL,
        "Name"       VARCHAR(255),
        reward_id    VARCHAR(100) NOT NULL,
        reward_title VARCHAR(255) NOT NULL,
        coins_spent  INTEGER NOT NULL,
        status       VARCHAR(50) DEFAULT 'pending',
        notes        TEXT,
        created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_myby_redeem_id ON myby_redeem_requests ("ID");
      CREATE INDEX IF NOT EXISTS idx_myby_redeem_name ON myby_redeem_requests ("Name");
    `);
    console.log('   ✓ Semua 5 tabel berhasil dibuat');

    // Step 3: Seed rewards catalog jika kosong
    console.log('\n🌱  Step 3: Seed katalog reward...');
    const countRes = await client.query('SELECT COUNT(*) FROM myby_rewards_catalog');
    const count = parseInt(countRes.rows[0].count, 10);

    if (count === 0) {
      for (const item of DEFAULT_REWARDS) {
        await client.query(`
          INSERT INTO myby_rewards_catalog (id, title, category, cost, stock, image_url, tag, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [item.id, item.title, item.category, item.cost, item.stock, item.image_url, item.tag, item.description]);
        console.log('   + ' + item.title);
      }
    } else {
      console.log('   Catalog sudah ada ' + count + ' item, skip seed.');
    }

    // Step 4: Verifikasi
    console.log('\n🔍  Step 4: Verifikasi tabel...');
    const tables = [
      'myby_trainee_wallets',
      'myby_trainee_streaks',
      'myby_coin_transactions',
      'myby_rewards_catalog',
      'myby_redeem_requests'
    ];
    for (const tbl of tables) {
      const res = await client.query(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = $1`,
        [tbl]
      );
      const exists = res.rows[0].count === '1';
      console.log('   ' + (exists ? 'OK' : 'MISSING') + '  ' + tbl);
    }

    const rewardCount = await client.query('SELECT COUNT(*) FROM myby_rewards_catalog');
    console.log('\n   Total reward di catalog: ' + rewardCount.rows[0].count + ' item');
    console.log('\n✅  SELESAI! Semua tabel MyBY Coin sudah ada di Neon PostgreSQL.\n');

  } catch (err) {
    console.error('\n❌  Error:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
