/**
 * Seed Script for ranking_house Table
 * 
 * HOUSE              TOTAL GOLD/HOUSE  RANK  CLASS                 CABANG  PROGRAM
 * House of Havaria   14637             2     Obsidian              CEMARA  Youth
 * House of Quorion   9460              3     Spielberg (Sat 4-6)   TIMOR   Youth
 * House of Thenova   24835             1     Kiyosaki (Sat 4-6)    TIMOR   Youth
 * House of Creanova  5680              4     Graham                TIMOR   Junior
 * House of Reverion  3670              5     Alexandrite           CEMARA  Junior
 */

const db = require('../src/db/neonClient');
const fs = require('fs');
const path = require('path');

function cleanClassName(name) {
  if (!name) return '';
  return name.replace(/\s*\(.*?\)\s*$/, '').trim();
}

const initialData = [
  { house: 'House of Thenova', total_gold_house: 24835, rank: 1, class_name: 'Kiyosaki (Sat 4-6)', cabang: 'TIMOR', program: 'Youth' },
  { house: 'House of Havaria', total_gold_house: 14637, rank: 2, class_name: 'Obsidian', cabang: 'CEMARA', program: 'Youth' },
  { house: 'House of Quorion', total_gold_house: 9460, rank: 3, class_name: 'Spielberg (Sat 4-6)', cabang: 'TIMOR', program: 'Youth' },
  { house: 'House of Creanova', total_gold_house: 5680, rank: 4, class_name: 'Graham', cabang: 'TIMOR', program: 'Junior' },
  { house: 'House of Reverion', total_gold_house: 3670, rank: 5, class_name: 'Alexandrite', cabang: 'CEMARA', program: 'Junior' },
];

async function seed() {
  console.log('🔄 Setting up ranking_house database schema...');

  // Create table if not exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS ranking_house (
      id SERIAL PRIMARY KEY,
      house VARCHAR(255) NOT NULL,
      total_gold_house INT DEFAULT 0,
      rank INT,
      class_name VARCHAR(255),
      cabang VARCHAR(255),
      program VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Also support ranking_houses table as an alias/duplicate table for safety
  await db.query(`
    CREATE TABLE IF NOT EXISTS ranking_houses (
      id SERIAL PRIMARY KEY,
      house VARCHAR(255) NOT NULL,
      total_gold_house INT DEFAULT 0,
      rank INT,
      class_name VARCHAR(255),
      cabang VARCHAR(255),
      program VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('🗑️  Truncating ranking_house and ranking_houses tables...');
  await db.query('TRUNCATE TABLE ranking_house RESTART IDENTITY CASCADE;');
  await db.query('TRUNCATE TABLE ranking_houses RESTART IDENTITY CASCADE;');

  console.log('📥 Inserting 5 house ranking records...');

  for (const item of initialData) {
    const cleanedClass = cleanClassName(item.class_name);
    
    // Insert into ranking_house
    await db.query(`
      INSERT INTO ranking_house (house, total_gold_house, rank, class_name, cabang, program)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [item.house, item.total_gold_house, item.rank, cleanedClass, item.cabang, item.program]);

    // Insert into ranking_houses
    await db.query(`
      INSERT INTO ranking_houses (house, total_gold_house, rank, class_name, cabang, program)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [item.house, item.total_gold_house, item.rank, cleanedClass, item.cabang, item.program]);
  }

  // Also sync to house_rank if present
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS house_rank (
        id SERIAL PRIMARY KEY,
        house_name VARCHAR(255),
        total_gold_house INT,
        rank INT,
        class VARCHAR(255),
        cabang VARCHAR(255),
        program VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query('TRUNCATE TABLE house_rank RESTART IDENTITY CASCADE;');
    for (const item of initialData) {
      const cleanedClass = cleanClassName(item.class_name);
      await db.query(`
        INSERT INTO house_rank (house_name, total_gold_house, rank, class, cabang, program)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [item.house, item.total_gold_house, item.rank, cleanedClass, item.cabang, item.program]);
    }
  } catch (e) {
    console.log('Note on house_rank sync:', e.message);
  }

  // Write seed JSON files
  const cleanSeedData = initialData.map(item => ({
    house: item.house,
    total_gold_house: item.total_gold_house,
    rank: item.rank,
    class_name: cleanClassName(item.class_name),
    cabang: item.cabang,
    program: item.program,
  }));

  const jsonContent = JSON.stringify(cleanSeedData, null, 2);

  const targets = [
    path.join(__dirname, 'seed_ranking_house.json'),
    path.join(__dirname, '..', 'src', 'routes', 'seed_ranking_house.json'),
    path.join(__dirname, '..', 'src', 'db', 'seed_ranking_house.json'),
  ];

  targets.forEach(t => {
    fs.writeFileSync(t, jsonContent, 'utf8');
    console.log(`📁 Written seed file: ${t}`);
  });

  const res = await db.query('SELECT * FROM ranking_house ORDER BY rank ASC;');
  console.log('\n📊 ranking_house Table Data:');
  console.table(res.rows);

  console.log('\n✅ Successfully seeded ranking_house table!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed Error:', err);
  process.exit(1);
});
