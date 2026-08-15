const db = require('./src/db/neonClient');

async function insertFullHouseRanks() {
  try {
    const items = [
      { "Nama House": "House of Thenova", "Total Gold": 24175, "Class": "Kiyosaki (Sat 4-6)", "Cabang": "TIMOR", "Program": "Youth", "Rank": 1 },
      { "Nama House": "House of Havaria", "Total Gold": 15097, "Class": "Obsidian", "Cabang": "CEMARA", "Program": "Youth", "Rank": 1 },
      { "Nama House": "House of Creanova", "Total Gold": 5720, "Class": "Grahan", "Cabang": "TIMOR", "Program": "Junior", "Rank": 1 },
      { "Nama House": "House of Reverion", "Total Gold": 3670, "Class": "Alexandrite", "Cabang": "CEMARA", "Program": "Junior", "Rank": 1 },
      { "Nama House": "House of Havaria", "Total Gold": 15097, "Class": "Obsidian", "Cabang": "CEMARA", "Program": "Youth", "Rank": 2 },
      { "Nama House": "House of Quorion", "Total Gold": 9180, "Class": "Spielberg (Sat 4-6)", "Cabang": "TIMOR", "Program": "Youth", "Rank": 2 },
      { "Nama House": "House of Reverion", "Total Gold": 3670, "Class": "Alexandrite", "Cabang": "CEMARA", "Program": "Junior", "Rank": 2 },
      { "Nama House": "House of Quorion", "Total Gold": 9180, "Class": "Spielberg (Sat 4-6)", "Cabang": "TIMOR", "Program": "Youth", "Rank": 3 }
    ];

    await db.query('TRUNCATE TABLE house_rank;');

    for (const item of items) {
      await db.query(`
        INSERT INTO house_rank ("Nama House", "Total Gold", "Class", "Cabang", "Program", "Rank")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [item['Nama House'], item['Total Gold'], item['Class'], item['Cabang'], item['Program'], item['Rank']]);
    }

    const res = await db.query('SELECT * FROM house_rank ORDER BY "Rank" ASC, "Total Gold" DESC;');
    console.log(`✅ Successfully inserted ${res.rows.length} rows into house_rank table!`);
    console.log('Sample rows in Neon DB:', res.rows);
  } catch (err) {
    console.error('Error inserting house_ranks:', err);
  } finally {
    process.exit(0);
  }
}

insertFullHouseRanks();
