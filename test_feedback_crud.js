const db = require('./src/db/neonClient');

async function testFeedbackCrud() {
  console.log('🧪 Testing CRUD operations on table "feedback" (ONLY id PRIMARY KEY)...');

  try {
    // 1. Insert test feedback row
    const insertRes = await db.query(`
      INSERT INTO feedback (
        id, student_name, house, class_trainers, date,
        coach_feedback, challenge, speaking_project, role_2, role_3, role_4,
        life_project, win, fav, total_gold, level, latest_speaking_project,
        last_time_speaking, class_name
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *;
    `, [
      '70100104', 'Test Student', 'House of Creanova', 'Coach Alex', '2026-08-08',
      'Great performance in public speaking', 'Overcoming stage fright', 'Elevator Pitch',
      'Timer', 'Evaluator', 'Grammarian', 'Community Project', 'Best Speaker', 'Yes',
      500, 'Sergeant', 'Impromptu Speech', '2026-08-01', 'Gladwell'
    ]);

    const createdId = insertRes.rows[0].id;
    console.log('✅ Created feedback record ID:', createdId);

    // 2. Select test feedback row
    const selectRes = await db.query('SELECT * FROM feedback WHERE id = $1;', [createdId]);
    console.log('✅ Retrieved feedback record:', selectRes.rows[0].student_name);

    // 3. Update test feedback row
    await db.query('UPDATE feedback SET coach_feedback = $1 WHERE id = $2;', ['Updated Feedback Excellent', createdId]);
    console.log('✅ Updated feedback record ID:', createdId);

    // 4. Delete test feedback row
    await db.query('DELETE FROM feedback WHERE id = $1;', [createdId]);
    console.log('✅ Deleted test feedback record ID:', createdId);

    console.log('🎉 ALL CRUD TESTS PASSED FOR TABLE "feedback" WITH ONLY "id" COLUMN!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Feedback CRUD test failed:', err);
    process.exit(1);
  }
}

testFeedbackCrud();
