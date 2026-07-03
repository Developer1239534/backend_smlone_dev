const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const data = [
      {
        house_name: 'House of Havaria',
        total_gold_house: '13385',
        rank: '2',
        class: 'Obsidian',
        cabang: 'CEMARA',
        program: 'Youth',
        rank_junior: '',
        rank_youth: '2',
        rank_junior_timor: '',
        rank_youth_timor: '',
        rank_junior_tritura: '',
        rank_youth_tritura: '',
        rank_junior_cemara: '',
        rank_youth_cemara: '1'
      },
      {
        house_name: 'House of Quorion',
        total_gold_house: '6555',
        rank: '3',
        class: 'Spielberg',
        cabang: 'TIMOR',
        program: 'Youth',
        rank_junior: '',
        rank_youth: '3',
        rank_junior_timor: '',
        rank_youth_timor: '2',
        rank_junior_tritura: '',
        rank_youth_tritura: '',
        rank_junior_cemara: '',
        rank_youth_cemara: ''
      },
      {
        house_name: 'House of Thenova',
        total_gold_house: '18900',
        rank: '1',
        class: 'Kiyosaki',
        cabang: 'TIMOR',
        program: 'Youth',
        rank_junior: '',
        rank_youth: '1',
        rank_junior_timor: '',
        rank_youth_timor: '1',
        rank_junior_tritura: '',
        rank_youth_tritura: '',
        rank_junior_cemara: '',
        rank_youth_cemara: ''
      },
      {
        house_name: 'House of Creanova',
        total_gold_house: '2945',
        rank: '4',
        class: 'Graham',
        cabang: 'TIMOR',
        program: 'Junior',
        rank_junior: '1',
        rank_youth: '',
        rank_junior_timor: '1',
        rank_youth_timor: '',
        rank_junior_tritura: '',
        rank_youth_tritura: '',
        rank_junior_cemara: '',
        rank_youth_cemara: ''
      },
      {
        house_name: 'House of Reverion',
        total_gold_house: '2505',
        rank: '5',
        class: 'Alexandrite',
        cabang: 'CEMARA',
        program: 'Junior',
        rank_junior: '2',
        rank_youth: '',
        rank_junior_timor: '',
        rank_youth_timor: '',
        rank_junior_tritura: '',
        rank_youth_tritura: '',
        rank_junior_cemara: '1',
        rank_youth_cemara: ''
      }
    ];

    console.log('🧹 Clearing existing June house_rank data...');
    await pool.query("DELETE FROM house_rank WHERE periode = 'June'");

    console.log('🌱 Seeding June house_rank data...');
    for (const row of data) {
      await pool.query(
        `INSERT INTO house_rank (
          house_name, periode, total_gold_house, rank, class, cabang, program,
          rank_junior, rank_youth, rank_junior_timor, rank_youth_timor,
          rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, rank_youth_cemara
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (house_name, periode) DO UPDATE SET
          total_gold_house = EXCLUDED.total_gold_house,
          rank = EXCLUDED.rank,
          class = EXCLUDED.class,
          cabang = EXCLUDED.cabang,
          program = EXCLUDED.program,
          rank_junior = EXCLUDED.rank_junior,
          rank_youth = EXCLUDED.rank_youth,
          rank_junior_timor = EXCLUDED.rank_junior_timor,
          rank_youth_timor = EXCLUDED.rank_youth_timor,
          rank_junior_tritura = EXCLUDED.rank_junior_tritura,
          rank_youth_tritura = EXCLUDED.rank_youth_tritura,
          rank_junior_cemara = EXCLUDED.rank_junior_cemara,
          rank_youth_cemara = EXCLUDED.rank_youth_cemara`,
        [
          row.house_name,
          'June',
          row.total_gold_house,
          row.rank,
          row.class,
          row.cabang,
          row.program,
          row.rank_junior || null,
          row.rank_youth || null,
          row.rank_junior_timor || null,
          row.rank_youth_timor || null,
          row.rank_junior_tritura || null,
          row.rank_youth_tritura || null,
          row.rank_junior_cemara || null,
          row.rank_youth_cemara || null
        ]
      );
    }

    console.log('✅ June house_rank data seeded successfully!');

    // Verification
    const check = await pool.query("SELECT * FROM house_rank WHERE periode = 'June' ORDER BY rank ASC");
    console.log('\nVerification - current June house rankings:');
    console.table(check.rows.map(r => ({
      Rank: r.rank,
      House: r.house_name,
      TotalGold: r.total_gold_house,
      Branch: r.cabang
    })));

  } catch (err) {
    console.error('❌ Error seeding house_rank:', err);
  } finally {
    await pool.end();
  }
}

main();
