const { pool } = require('../src/db/neonClient');

const monthHouseData = [
  // TOP 25 [ALL BRANCH] Junior
  {
    house_name: 'House of Creanova',
    periode: 'June',
    junior_youth: 'Junior',
    cabang_scope: 'ALL BRANCH',
    total_gold: '0',
    rank: '1',
    class_name: 'Graham',
    cabang: 'TIMOR',
    program: 'Junior',
    active_expired: null,
    branch_val: '1',
    total_gold_periode: null
  },
  {
    house_name: 'House of Reverion',
    periode: 'June',
    junior_youth: 'Junior',
    cabang_scope: 'ALL BRANCH',
    total_gold: '0',
    rank: '1',
    class_name: 'Alexandrite',
    cabang: 'CEMARA',
    program: 'Junior',
    active_expired: null,
    branch_val: '1',
    total_gold_periode: null
  },

  // TOP 25 [ALL BRANCH] Youth
  {
    house_name: 'House of Havaria',
    periode: 'June',
    junior_youth: 'Youth',
    cabang_scope: 'ALL BRANCH',
    total_gold: '0',
    rank: '1',
    class_name: 'Obsidian',
    cabang: 'CEMARA',
    program: 'Youth',
    active_expired: null,
    branch_val: '1',
    total_gold_periode: null
  },
  {
    house_name: 'House of Quorion',
    periode: 'June',
    junior_youth: 'Youth',
    cabang_scope: 'ALL BRANCH',
    total_gold: '0',
    rank: '1',
    class_name: 'Spielberg (Sat 4-6)',
    cabang: 'TIMOR',
    program: 'Youth',
    active_expired: null,
    branch_val: '1',
    total_gold_periode: null
  },
  {
    house_name: 'House of Thenova',
    periode: 'June',
    junior_youth: 'Youth',
    cabang_scope: 'ALL BRANCH',
    total_gold: '0',
    rank: '1',
    class_name: 'Kiyosaki (Sat 4-6)',
    cabang: 'TIMOR',
    program: 'Youth',
    active_expired: null,
    branch_val: '1',
    total_gold_periode: null
  },

  // TOP 25 TIMOR Junior
  {
    house_name: 'House of Creanova',
    periode: 'June',
    junior_youth: 'Junior',
    cabang_scope: 'TIMOR',
    total_gold: '0',
    rank: '1',
    class_name: 'Graham',
    cabang: 'TIMOR',
    program: 'Junior',
    active_expired: '1',
    branch_val: '1',
    total_gold_periode: '3'
  },

  // TOP 25 TIMOR Youth
  {
    house_name: 'House of Quorion',
    periode: 'June',
    junior_youth: 'Youth',
    cabang_scope: 'TIMOR',
    total_gold: '0',
    rank: '1',
    class_name: 'Spielberg (Sat 4-6)',
    cabang: 'TIMOR',
    program: 'Youth',
    active_expired: '1',
    branch_val: '1',
    total_gold_periode: '5'
  },
  {
    house_name: 'House of Thenova',
    periode: 'June',
    junior_youth: 'Youth',
    cabang_scope: 'TIMOR',
    total_gold: '0',
    rank: '1',
    class_name: 'Kiyosaki (Sat 4-6)',
    cabang: 'TIMOR',
    program: 'Youth',
    active_expired: '1',
    branch_val: '1',
    total_gold_periode: '5'
  },

  // TOP 25 CEMARA Junior
  {
    house_name: 'House of Reverion',
    periode: 'June',
    junior_youth: 'Junior',
    cabang_scope: 'CEMARA',
    total_gold: '0',
    rank: '1',
    class_name: 'Alexandrite',
    cabang: 'CEMARA',
    program: 'Junior',
    active_expired: '1',
    branch_val: '1',
    total_gold_periode: '3'
  },

  // TOP 25 CEMARA Youth
  {
    house_name: 'House of Havaria',
    periode: 'June',
    junior_youth: 'Youth',
    cabang_scope: 'CEMARA',
    total_gold: '0',
    rank: '1',
    class_name: 'Obsidian',
    cabang: 'CEMARA',
    program: 'Youth',
    active_expired: '1',
    branch_val: '1',
    total_gold_periode: '3'
  }
];

async function main() {
  try {
    console.log('🔄 Creating month_house table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS month_house (
        id SERIAL PRIMARY KEY,
        house_name VARCHAR(100) NOT NULL,
        periode VARCHAR(50) NOT NULL,
        junior_youth VARCHAR(50),
        cabang_scope VARCHAR(50),
        total_gold VARCHAR(50),
        rank VARCHAR(50),
        class_name VARCHAR(100),
        cabang VARCHAR(100),
        program VARCHAR(100),
        active_expired VARCHAR(50),
        branch_val VARCHAR(50),
        total_gold_periode VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table verified.');

    console.log('🧹 Clearing existing June month_house data...');
    await pool.query("DELETE FROM month_house WHERE periode = 'June'");

    console.log('🌱 Seeding June month_house data...');
    for (const data of monthHouseData) {
      await pool.query(`
        INSERT INTO month_house (
          house_name, periode, junior_youth, cabang_scope, total_gold, rank,
          class_name, cabang, program, active_expired, branch_val, total_gold_periode
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        data.house_name, data.periode, data.junior_youth, data.cabang_scope, data.total_gold, data.rank,
        data.class_name, data.cabang, data.program, data.active_expired, data.branch_val, data.total_gold_periode
      ]);
    }
    console.log('✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    await pool.end();
  }
}

main();
