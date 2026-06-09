const db = require('../src/db/neonClient');

async function verify() {
  try {
    console.log('--- VERIFYING STUDENT 27 (PRE-EXISTING) ---');
    const result27 = await db.query('SELECT * FROM dashboard_trainne WHERE id = $1', ['27']);
    if (result27.rows.length === 0) {
      console.error('Student 27 not found!');
    } else {
      const student = result27.rows[0];
      console.log('ID:', student.id);
      console.log('Name:', student.trainee_name);
      console.log('Status:', student.status);
      console.log('Level:', student.level);
      console.log('Class:', student.class);
      console.log('Cabang:', student.cabang);
      console.log('House SML:', student.house_sml);
      console.log('Total Gold/Periode:', student.total_gold_periode);
      console.log('Junior/Youth:', student.junior_youth);
      console.log('Rank National Youth:', student.rank_id_youth);
      console.log('Rank Cemara Youth:', student.rank_id_youth_cemara);
      console.log('Playlist URL (progress_video):', student.progress_video);
      console.log('Plain Password (should be SML27):', student.plain_password);
      
      if (student.plain_password !== 'SML27') {
        console.error('❌ ERROR: Plain password changed!');
      } else {
        console.log('✅ PASS: Plain password is correct!');
      }
      
      if (!student.progress_video) {
        console.error('❌ ERROR: Playlist was deleted or emptied!');
      } else {
        console.log('✅ PASS: Playlist is still intact!');
      }
    }

    console.log('\n--- VERIFYING NEWLY INSERTED STUDENTS ---');
    // Let's find students that were inserted
    // A newly inserted student has password format 'SML' + id
    // Let's check a student from Cemara/Tritura/Timor
    const newStudents = await db.query('SELECT id, trainee_name, status, plain_password, house_sml FROM dashboard_trainne ORDER BY CAST(id AS INTEGER) DESC LIMIT 5;');
    console.log('Latest 5 students in database:');
    console.log(newStudents.rows);

    process.exit(0);
  } catch (error) {
    console.error('Verification error:', error);
    process.exit(1);
  }
}

verify();
