require('dotenv').config();
const db = require('./neonClient');

async function setup() {
  try {
    console.log('🔧 Creating students table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(200),
        email VARCHAR(200),
        password VARCHAR(200),
        birth_date DATE,
        class_name VARCHAR(100),
        level VARCHAR(50),
        program VARCHAR(100),
        membership_expiry DATE,
        progress_next_level INT DEFAULT 0,
        latest_project VARCHAR(200),
        profile_photo TEXT,
        referral_code VARCHAR(100),
        contact_url TEXT,
        gold_rank_url TEXT,
        weekly_report_url TEXT,
        quarterly_report_url TEXT,
        prev_report_url TEXT,
        prev_quarter_url TEXT,
        documentation_url TEXT,
        highlight TEXT,
        announcement TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ students table ready!');

    console.log('🔧 Creating speaking_projects table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS speaking_projects (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        date DATE,
        project_name VARCHAR(200),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ speaking_projects table ready!');

    console.log('📥 Seeding dummy students...');
    const students = [
      {
        student_id: '90100190',
        full_name: 'Daphne Nathania Ang',
        email: 'daphne@example.com',
        password: 'daphne123',
        birth_date: '2010-04-19',
        class_name: 'Alexandrite',
        level: 'Private',
        program: 'Junior/Youth Program',
        membership_expiry: '2026-08-06',
        progress_next_level: 38,
        latest_project: 'L1. S.Project 3',
        referral_code: '9119DAPHNE',
        contact_url: 'https://linktr.ee/smlone.indonesia',
        gold_rank_url: 'https://bit.ly/SMLONE_RANK',
        weekly_report_url: 'https://docs.google.com/presentation/d/1example',
        quarterly_report_url: '',
        prev_report_url: '',
        prev_quarter_url: '',
        documentation_url: 'https://youtube.com/watch?v=example',
        highlight: 'COMING SOON!\nFuture Leaders Camp',
        announcement: 'Register for upcoming REAL STAGE 50 on 24 May 2026!!',
      },
      {
        student_id: '573',
        full_name: 'Alvaro Richie Theus',
        email: 'alvaro@example.com',
        password: 'alvaro123',
        birth_date: '2005-03-15',
        class_name: 'Sapphire',
        level: 'Advanced',
        program: 'Youth Program',
        membership_expiry: '2026-12-31',
        progress_next_level: 60,
        latest_project: 'L2. S.Project 1',
        referral_code: '573ALVARO',
        contact_url: 'https://linktr.ee/smlone.indonesia',
        gold_rank_url: 'https://bit.ly/SMLONE_RANK',
        weekly_report_url: 'https://docs.google.com/presentation/d/2example',
        quarterly_report_url: '',
        prev_report_url: '',
        prev_quarter_url: '',
        documentation_url: '',
        highlight: 'COMING SOON!\nReal Stage 50 - Juni 2026',
        announcement: 'Persiapkan diri untuk Public Speaking Championship!',
      },
      {
        student_id: '90100112',
        full_name: 'Richie Alvaro Tandinata',
        email: 'richie@example.com',
        password: 'richie123',
        birth_date: '2008-07-22',
        class_name: 'Diamond',
        level: 'Intermediate',
        program: 'Junior Program',
        membership_expiry: '2026-09-30',
        progress_next_level: 75,
        latest_project: 'L1. S.Project 5',
        referral_code: 'RICHIE9011',
        contact_url: 'https://linktr.ee/smlone.indonesia',
        gold_rank_url: 'https://bit.ly/SMLONE_RANK',
        weekly_report_url: '',
        quarterly_report_url: '',
        prev_report_url: '',
        prev_quarter_url: '',
        documentation_url: '',
        highlight: 'Workshop Leadership Skills\n15 Juni 2026',
        announcement: 'Jadwal sesi privat minggu ini telah dirilis!',
      },
    ];

    for (const s of students) {
      await db.query(`
        INSERT INTO students (
          student_id, full_name, email, password, birth_date,
          class_name, level, program, membership_expiry,
          progress_next_level, latest_project, referral_code,
          contact_url, gold_rank_url, weekly_report_url,
          quarterly_report_url, prev_report_url, prev_quarter_url,
          documentation_url, highlight, announcement
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
        ON CONFLICT (student_id) DO NOTHING
      `, [
        s.student_id, s.full_name, s.email, s.password, s.birth_date,
        s.class_name, s.level, s.program, s.membership_expiry,
        s.progress_next_level, s.latest_project, s.referral_code,
        s.contact_url, s.gold_rank_url, s.weekly_report_url,
        s.quarterly_report_url, s.prev_report_url, s.prev_quarter_url,
        s.documentation_url, s.highlight, s.announcement,
      ]);
    }
    console.log('✅ Students seeded!');

    console.log('📥 Seeding speaking projects...');
    const projects = [
      { student_id: '90100190', date: '2026-05-22', project_name: 'L1. S.Project 3' },
      { student_id: '90100190', date: '2026-04-10', project_name: 'L1. S.Project 2' },
      { student_id: '90100190', date: '2026-02-27', project_name: 'L1. S.Project 1' },
      { student_id: '573', date: '2026-05-10', project_name: 'L2. S.Project 1' },
      { student_id: '573', date: '2026-03-20', project_name: 'L1. S.Project 5' },
      { student_id: '573', date: '2026-01-15', project_name: 'L1. S.Project 4' },
      { student_id: '90100112', date: '2026-05-18', project_name: 'L1. S.Project 5' },
      { student_id: '90100112', date: '2026-04-05', project_name: 'L1. S.Project 4' },
      { student_id: '90100112', date: '2026-02-12', project_name: 'L1. S.Project 3' },
    ];

    // Clear old and re-seed
    await db.query(`DELETE FROM speaking_projects WHERE student_id IN ('90100190','573','90100112')`);
    for (const p of projects) {
      await db.query(
        `INSERT INTO speaking_projects (student_id, date, project_name) VALUES ($1,$2,$3)`,
        [p.student_id, p.date, p.project_name]
      );
    }
    console.log('✅ Speaking projects seeded!');
    console.log('\n🎉 Setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setup();
