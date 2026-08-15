const db = require('./src/db/neonClient');

async function testHouseAllegiance() {
  try {
    console.log('🧪 Testing house_allegiance table & queries...');

    // Clear test table
    await db.query('TRUNCATE TABLE house_allegiance;');

    // Test Insert Batch
    const testItems = [
      { number: 1, question: "Which value resonates most with your house?", options: ["Creativity & Design", "Logic & Code", "Leadership & Courage", "Wisdom & Strategy"] },
      { number: 2, question: "What is your primary goal in SMLONE?", options: ["Build innovative apps", "Master fullstack engineering", "Lead tech teams", "Solve complex problems"] }
    ];

    for (const item of testItems) {
      await db.query(`
        INSERT INTO house_allegiance ("number", "question", "options")
        VALUES ($1, $2, $3)
        ON CONFLICT ("number") DO UPDATE SET
          "question" = EXCLUDED."question",
          "options" = EXCLUDED."options";
      `, [item.number, item.question, JSON.stringify(item.options)]);
    }

    const selectRes = await db.query('SELECT * FROM house_allegiance ORDER BY "number" ASC;');
    console.log('✅ Inserted & Retrieved rows:', selectRes.rows);
  } catch (err) {
    console.error('Error testing house_allegiance:', err);
  } finally {
    process.exit(0);
  }
}

testHouseAllegiance();
