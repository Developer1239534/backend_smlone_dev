const db = require('../src/db/neonClient');

async function main() {
  try {
    // 1. Find other trainees with weekly_report = 'https://docs.google.com/spreadsheets/d/test-weekly'
    const weeklyRes = await db.query("SELECT COUNT(*) AS count FROM dashboard_trainne WHERE weekly_report = 'https://docs.google.com/spreadsheets/d/test-weekly'");
    console.log(`Trainees with weekly_report = 'https://docs.google.com/spreadsheets/d/test-weekly': ${weeklyRes.rows[0].count}`);

    // 2. Find other trainees with progress_video = 'https://youtube.com/watch?v=test-video'
    const videoRes = await db.query("SELECT COUNT(*) AS count FROM dashboard_trainne WHERE progress_video = 'https://youtube.com/watch?v=test-video'");
    console.log(`Trainees with progress_video = 'https://youtube.com/watch?v=test-video': ${videoRes.rows[0].count}`);

    // 3. Find list of trainees with both weekly_report and progress_video equal to the test values
    const bothRes = await db.query("SELECT id, trainee_name, weekly_report, progress_video FROM dashboard_trainne WHERE weekly_report = 'https://docs.google.com/spreadsheets/d/test-weekly' AND progress_video = 'https://youtube.com/watch?v=test-video'");
    console.log(`\nTrainees with both identical test values: ${bothRes.rows.length}`);
    console.table(bothRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
}

main();
