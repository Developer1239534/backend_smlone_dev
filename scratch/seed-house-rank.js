const { pool } = require('../src/db/neonClient');

const houseRankData = [
  {
    house_name: 'House of Havaria',
    periode: 'June',
    total_gold_house: '0',
    rank: '1',
    class: 'Obsidian',
    cabang: 'CEMARA',
    program: 'Youth',
    rank_junior: null,
    rank_youth: '1',
    rank_junior_timor: null,
    rank_youth_timor: null,
    rank_junior_tritura: null,
    rank_youth_tritura: null,
    rank_junior_cemara: null,
    rank_youth_cemara: '3'
  },
  {
    house_name: 'House of Quorion',
    periode: 'June',
    total_gold_house: '0',
    rank: '1',
    class: 'Spielberg (Sat 4-6)',
    cabang: 'TIMOR',
    program: 'Youth',
    rank_junior: null,
    rank_youth: '1',
    rank_junior_timor: null,
    rank_youth_timor: '5',
    rank_junior_tritura: null,
    rank_youth_tritura: null,
    rank_junior_cemara: null,
    rank_youth_cemara: null
  },
  {
    house_name: 'House of Thenova',
    periode: 'June',
    total_gold_house: '0',
    rank: '1',
    class: 'Kiyosaki (Sat 4-6)',
    cabang: 'TIMOR',
    program: 'Youth',
    rank_junior: null,
    rank_youth: '1',
    rank_junior_timor: null,
    rank_youth_timor: '5',
    rank_junior_tritura: null,
    rank_youth_tritura: null,
    rank_junior_cemara: null,
    rank_youth_cemara: null
  },
  {
    house_name: 'House of Creanova',
    periode: 'June',
    total_gold_house: '0',
    rank: '1',
    class: 'Graham',
    cabang: 'TIMOR',
    program: 'Junior',
    rank_junior: '1',
    rank_youth: null,
    rank_junior_timor: '3',
    rank_youth_timor: null,
    rank_junior_tritura: null,
    rank_youth_tritura: null,
    rank_junior_cemara: null,
    rank_youth_cemara: null
  },
  {
    house_name: 'House of Reverion',
    periode: 'June',
    total_gold_house: '0',
    rank: '1',
    class: 'Alexandrite',
    cabang: 'CEMARA',
    program: 'Junior',
    rank_junior: '1',
    rank_youth: null,
    rank_junior_timor: null,
    rank_youth_timor: null,
    rank_junior_tritura: null,
    rank_youth_tritura: null,
    rank_junior_cemara: '3',
    rank_youth_cemara: null
  }
];

async function main() {
  try {
    console.log('🔄 Creating house_rank table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS house_rank (
        id SERIAL PRIMARY KEY,
        house_name VARCHAR(100) NOT NULL,
        periode VARCHAR(50) NOT NULL,
        total_gold_house VARCHAR(50),
        rank VARCHAR(50),
        class VARCHAR(100),
        cabang VARCHAR(100),
        program VARCHAR(100),
        rank_junior VARCHAR(50),
        rank_youth VARCHAR(50),
        rank_junior_timor VARCHAR(50),
        rank_youth_timor VARCHAR(50),
        rank_junior_tritura VARCHAR(50),
        rank_youth_tritura VARCHAR(50),
        rank_junior_cemara VARCHAR(50),
        rank_youth_cemara VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (house_name, periode)
      );
    `);
    console.log('✅ Table verified.');

    console.log('🧹 Clearing existing June house_rank data...');
    await pool.query("DELETE FROM house_rank WHERE periode = 'June'");

    console.log('🌱 Seeding June house_rank data...');
    for (const data of houseRankData) {
      await pool.query(`
        INSERT INTO house_rank (
          house_name, periode, total_gold_house, rank, class, cabang, program,
          rank_junior, rank_youth, rank_junior_timor, rank_youth_timor,
          rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, rank_youth_cemara
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        data.house_name, data.periode, data.total_gold_house, data.rank, data.class, data.cabang, data.program,
        data.rank_junior, data.rank_youth, data.rank_junior_timor, data.rank_youth_timor,
        data.rank_junior_tritura, data.rank_youth_tritura, data.rank_junior_cemara, data.rank_youth_cemara
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
