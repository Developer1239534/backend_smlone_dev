const db = require('./src/db/neonClient');

async function setupQuizTables() {
  console.log('🔄 Checking & setting up Quiz tables (questions, houses, quiz_history)...');

  // 1. Create houses table
  await db.query(`
    CREATE TABLE IF NOT EXISTS houses (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      core_value VARCHAR(100),
      color VARCHAR(20)
    );
  `);

  // Insert default 5 Houses if empty
  const houseCount = await db.query('SELECT COUNT(*) FROM houses;');
  if (parseInt(houseCount.rows[0].count, 10) === 0) {
    await db.query(`
      INSERT INTO houses (id, name, description, core_value, color) VALUES
      ('Thenova', 'House of Thenova', 'House of Innovation and Leadership', 'Innovation & Courage', '#EAB308'),
      ('Havaria', 'House of Havaria', 'House of Wisdom and Academic Excellence', 'Wisdom & Knowledge', '#3B82F6'),
      ('Reverion', 'House of Reverion', 'House of Honor and Integrity', 'Integrity & Honor', '#EF4444'),
      ('Quorion', 'House of Quorion', 'House of Unity and Strategy', 'Unity & Strategy', '#10B981'),
      ('Creanova', 'House of Creanova', 'House of Creativity and Expression', 'Creativity & Expression', '#8B5CF6');
    `);
    console.log('✅ Seeded 5 Houses into houses table.');
  }

  // 2. Create questions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT PRIMARY KEY,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      option_e TEXT NOT NULL
    );
  `);

  // Insert default 25 Questions if empty
  const qCount = await db.query('SELECT COUNT(*) FROM questions;');
  if (parseInt(qCount.rows[0].count, 10) === 0) {
    for (let i = 1; i <= 25; i++) {
      await db.query(`
        INSERT INTO questions (id, question_text, option_a, option_b, option_c, option_d, option_e)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        i,
        `Pertanyaan Kuis House Allegiance #${i}: Karakter dan gaya kepemimpinan mana yang paling menggambarkan Anda?`,
        `Option A: Berani memimpin dan menciptakan inovasi baru (Thenova)`,
        `Option B: Tekun belajar, menganalisis data, dan mengejar kecerdasan (Havaria)`,
        `Option C: Memegang teguh kejujuran, integritas, dan kehormatan (Reverion)`,
        `Option D: Menjaga kekompakan tim, persatuan, dan merancang strategi (Quorion)`,
        `Option E: Ekspresif, kreatif, dan suka menciptakan ide-ide unik (Creanova)`
      ]);
    }
    console.log('✅ Seeded 25 Questions into questions table.');
  }

  // 3. Create quiz_history table
  await db.query(`
    CREATE TABLE IF NOT EXISTS quiz_history (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL,
      assigned_house VARCHAR(50) NOT NULL,
      scores JSONB,
      submitted_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('✅ Quiz tables setup complete!');
  process.exit(0);
}

setupQuizTables().catch(err => {
  console.error('Error setting up quiz tables:', err);
  process.exit(1);
});
