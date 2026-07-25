const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/db/neonClient');

async function initAndSeedAll() {
  try {
    console.log('🚀 Initializing Database Tables...');

    // 1. Create admin_akun
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_akun (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        plain_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create dashboard_trainne
    await db.query(`
      CREATE TABLE IF NOT EXISTS dashboard_trainne (
        id VARCHAR(255) PRIMARY KEY,
        trainee_name VARCHAR(255),
        status VARCHAR(100) DEFAULT 'Active',
        program VARCHAR(255),
        class VARCHAR(255),
        level VARCHAR(255),
        membership_expiry VARCHAR(255),
        last_speaking_project VARCHAR(255),
        weekly_report TEXT,
        referral_code VARCHAR(255),
        gold_rank VARCHAR(255),
        progress_video TEXT,
        password VARCHAR(255),
        plain_password VARCHAR(255),
        phone VARCHAR(255),
        profile_picture TEXT,
        tanggal_lahir VARCHAR(255),
        cabang VARCHAR(255),
        house_sml VARCHAR(255),
        total_gold_periode VARCHAR(255) DEFAULT '0',
        junior_youth VARCHAR(255),
        rank_id_junior VARCHAR(255),
        rank_id_youth VARCHAR(255),
        rank_id_junior_timor VARCHAR(255),
        rank_id_youth_timor VARCHAR(255),
        rank_id_junior_tritura VARCHAR(255),
        rank_id_youth_tritura VARCHAR(255),
        rank_id_junior_cemara VARCHAR(255),
        rank_id_youth_cemara VARCHAR(255),
        gender VARCHAR(255),
        pengumuman TEXT,
        highlight_terbaru TEXT,
        gold_points VARCHAR(255),
        nama_sekolah VARCHAR(255),
        newest_grade VARCHAR(255),
        wa_trainee VARCHAR(255),
        screening_test TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create gp_month
    await db.query(`
      CREATE TABLE IF NOT EXISTS gp_month (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(255),
        total_gold_periode VARCHAR(255) DEFAULT '0',
        rank_id_junior VARCHAR(255),
        rank_id_youth VARCHAR(255),
        rank_id_junior_timor VARCHAR(255),
        rank_id_youth_timor VARCHAR(255),
        rank_id_junior_tritura VARCHAR(255),
        rank_id_youth_tritura VARCHAR(255),
        rank_id_junior_cemara VARCHAR(255),
        rank_id_youth_cemara VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create house_rank
    await db.query(`
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

    // 5. Create gp_tahunan
    await db.query(`
      CREATE TABLE IF NOT EXISTS gp_tahunan (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        total_gold INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create real_stage
    await db.query(`
      CREATE TABLE IF NOT EXISTS real_stage (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL,
        periode VARCHAR(100),
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create houses
    await db.query(`
      CREATE TABLE IF NOT EXISTS houses (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        core_value VARCHAR(100)
      );
    `);

    // 8. Create questions
    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        option_e TEXT NOT NULL
      );
    `);

    // 9. Create quiz_history
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_history (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        house_id VARCHAR(50) NOT NULL,
        score JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Create news_announcements
    await db.query(`
      CREATE TABLE IF NOT EXISTS news_announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Create whatsapp_contacts
    await db.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        number VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        cabang VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables created successfully!');

    // --- SEEDING ---

    // Cache pre-hashed default password
    const defaultHashedPassword = await bcrypt.hash('smlone123', 10);

    // A. Seed trainees_list.csv into dashboard_trainne
    const csvPath = path.join(__dirname, '../trainees_list.csv');
    if (fs.existsSync(csvPath)) {
      console.log('🌱 Seeding trainees from trainees_list.csv...');
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split('\n');

      let seededCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [id, name, status, gender, cabang, plainPassword] = line.split(',');
        if (!id || !name) continue;

        const cleanId = id.trim();
        const cleanName = name.trim();
        const cleanStatus = status ? status.trim() : 'Active';
        const cleanGender = gender ? gender.trim() : null;
        const cleanCabang = cabang ? cabang.trim() : null;
        const pass = plainPassword ? plainPassword.trim() : `SML${cleanId}`;

        await db.query(`
          INSERT INTO dashboard_trainne (
            id, trainee_name, status, gender, cabang, password, plain_password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            trainee_name = EXCLUDED.trainee_name,
            status = EXCLUDED.status,
            gender = EXCLUDED.gender,
            cabang = EXCLUDED.cabang;
        `, [cleanId, cleanName, cleanStatus, cleanGender, cleanCabang, defaultHashedPassword, pass]);

        seededCount++;
      }
      console.log(`✅ Seeded ${seededCount} trainees from trainees_list.csv.`);
    }

    // B. Fast native SQL insert from data_dashboard_keseluruhan into dashboard_trainne for any missing trainees
    console.log('🌱 Syncing from data_dashboard_keseluruhan into dashboard_trainne...');
    const ddkResult = await db.query(`
      INSERT INTO dashboard_trainne (
        id, trainee_name, status, gender, cabang, class, level, house_sml,
        nama_sekolah, newest_grade, password, plain_password, junior_youth
      )
      SELECT 
        CAST(id AS VARCHAR), 
        name, 
        'Active', 
        gender, 
        COALESCE(NULLIF(cabang_id, ''), cabang_kelas), 
        class, 
        level, 
        house, 
        nama_sekolah, 
        newest_grade, 
        $1, 
        CONCAT('SML', id), 
        ajy_by_class
      FROM data_dashboard_keseluruhan
      WHERE NULLIF(TRIM(name), '') IS NOT NULL
      ON CONFLICT (id) DO NOTHING;
    `, [defaultHashedPassword]);
    console.log(`✅ Inserted ${ddkResult.rowCount} additional trainees from data_dashboard_keseluruhan.`);

    // C. Seed house_rank
    console.log('🌱 Seeding house_rank...');
    const houseRankData = [
      { house_name: 'House of Havaria', periode: 'June', total_gold_house: '0', rank: '1', class: 'Obsidian', cabang: 'CEMARA', program: 'Youth', rank_youth: '1', rank_youth_cemara: '3' },
      { house_name: 'House of Quorion', periode: 'June', total_gold_house: '0', rank: '1', class: 'Spielberg (Sat 4-6)', cabang: 'TIMOR', program: 'Youth', rank_youth: '1', rank_youth_timor: '5' },
      { house_name: 'House of Thenova', periode: 'June', total_gold_house: '0', rank: '1', class: 'Kiyosaki (Sat 4-6)', cabang: 'TIMOR', program: 'Youth', rank_youth: '1', rank_youth_timor: '5' },
      { house_name: 'House of Creanova', periode: 'June', total_gold_house: '0', rank: '1', class: 'Graham', cabang: 'TIMOR', program: 'Junior', rank_junior: '1', rank_junior_timor: '3' },
      { house_name: 'House of Reverion', periode: 'June', total_gold_house: '0', rank: '1', class: 'Alexandrite', cabang: 'CEMARA', program: 'Junior', rank_junior: '1', rank_junior_cemara: '3' }
    ];
    for (const h of houseRankData) {
      await db.query(`
        INSERT INTO house_rank (
          house_name, periode, total_gold_house, rank, class, cabang, program,
          rank_junior, rank_youth, rank_junior_timor, rank_youth_timor,
          rank_junior_tritura, rank_youth_tritura, rank_junior_cemara, rank_youth_cemara
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (house_name, periode) DO NOTHING;
      `, [
        h.house_name, h.periode, h.total_gold_house, h.rank, h.class, h.cabang, h.program,
        h.rank_junior || null, h.rank_youth || null, h.rank_junior_timor || null, h.rank_youth_timor || null,
        null, null, h.rank_junior_cemara || null, h.rank_youth_cemara || null
      ]);
    }
    console.log('✅ house_rank seeded.');

    // D. Seed houses
    const houses = [
      { id: 'Thenova', name: 'Thenova', description: 'The Seekers. Curiosity is the engine of all progress.', core_value: 'Curiosity' },
      { id: 'Havaria', name: 'Havaria', description: 'The Caretakers. Caring is the foundation of human connection.', core_value: 'Empathy' },
      { id: 'Reverion', name: 'Reverion', description: 'The Guardians. Trustworthiness is priceless.', core_value: 'Integrity' },
      { id: 'Quorion', name: 'Quorion', description: 'The Masters. Strive for excellence in every action.', core_value: 'Precision' },
      { id: 'Creanova', name: 'Creanova', description: 'The Visionaries. Bravery to create boldly.', core_value: 'Originality' }
    ];
    for (const h of houses) {
      await db.query(`
        INSERT INTO houses (id, name, description, core_value) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name, description = EXCLUDED.description, core_value = EXCLUDED.core_value;
      `, [h.id, h.name, h.description, h.core_value]);
    }
    console.log('✅ Houses seeded.');

    console.log('🎉 Database initialization and seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during init and seed:', err);
    process.exit(1);
  }
}

initAndSeedAll();
