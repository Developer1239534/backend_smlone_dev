const db = require('../src/db/neonClient');
const bcrypt = require('bcryptjs');

async function runTests() {
  const testId = '99999999';
  try {
    console.log('--- TEST 1: INSERT (POST ROUTE SQL) ---');
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const insertQuery = `
      INSERT INTO dashboard_trainne (
        id, trainee_name, status, program, class, level, membership_expiry,
        last_speaking_project, progress_ke_next_level, highlight_terbaru,
        pengumuman, weekly_report, quarterly_report, referral_code, gold_rank,
        progress_video, laporan_sebelumnya, laporan_quarter_sebelumnya,
        completed_speaking_project, password, plain_password, phone, profile_picture, tanggal_lahir
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24
      ) RETURNING *;
    `;

    const insertValues = [
      testId, 'Test Student Name', 'Active', 'Program Test', 'Class Test',
      'Level Test', '2026-12-31',
      'Last Project Test', 'Progress Test', 'Highlight Test', 'Pengumuman Test', 'Weekly Test',
      'Quarterly Test', 'REF123', 'Gold Test', 'Video Test', 'Report Prev Test',
      'Report Quarter Test', 'Completed Test', hashedPassword, 'testpass123', '08123456789', 'pic.jpg', '2000-01-01'
    ];

    const insertResult = await db.query(insertQuery, insertValues);
    console.log('INSERT Success! Returned ID:', insertResult.rows[0].id);

    console.log('--- TEST 2: UPDATE (PUT ROUTE SQL) ---');
    const updateQuery = `
      UPDATE dashboard_trainne SET
        trainee_name = $1, status = $2, program = $3, class = $4, level = $5,
        membership_expiry = $6, last_speaking_project = $7,
        progress_ke_next_level = $8, highlight_terbaru = $9, pengumuman = $10,
        weekly_report = $11, quarterly_report = $12, referral_code = $13, gold_rank = $14,
        progress_video = $15, laporan_sebelumnya = $16, laporan_quarter_sebelumnya = $17,
        completed_speaking_project = $18, password = $19, plain_password = $20, phone = $21,
        profile_picture = $22, tanggal_lahir = $23
      WHERE id = $24 RETURNING *;
    `;

    const updateValues = [
      'Updated Test Name', 'Active', 'Program Updated', 'Class Updated', 'Level Updated',
      '2027-12-31', 'Last Project Updated', 'Progress Updated', 'Highlight Updated', 'Pengumuman Updated',
      'Weekly Updated', 'Quarterly Updated', 'REF456', 'Gold Updated', 'Video Updated', 'Report Prev Updated',
      'Report Quarter Updated', 'Completed Updated', hashedPassword, 'testpass123', '08987654321', 'pic_updated.jpg', '2000-02-02',
      testId
    ];

    const updateResult = await db.query(updateQuery, updateValues);
    console.log('UPDATE Success! Returned Name:', updateResult.rows[0].trainee_name);

    console.log('--- TEST 3: CLEANUP (DELETE) ---');
    await db.query('DELETE FROM dashboard_trainne WHERE id = $1', [testId]);
    console.log('Cleanup Success!');

    console.log('🎉 All Database tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    // Cleanup if inserted
    try {
      await db.query('DELETE FROM dashboard_trainne WHERE id = $1', [testId]);
    } catch (_) {}
    process.exit(1);
  }
}

runTests();
