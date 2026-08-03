const db = require('./src/db/neonClient');

async function verifyReportActivity() {
  const total = await db.query(`SELECT COUNT(*) FROM report_activity;`);
  const sampleCore = await db.query(`SELECT trainee_id, name, branch, cleaned_program, cleaned_class, level, speaking_project_to_next_level, level_up_checklist FROM report_activity LIMIT 5;`);
  const countCore = await db.query(`SELECT COUNT(*) FROM report_activity WHERE cleaned_program LIKE '%Core/Society Program%';`);
  const countJunior = await db.query(`SELECT COUNT(*) FROM report_activity WHERE cleaned_program LIKE '%Junior/Youth Program%';`);

  console.log(`Total rows in report_activity: ${total.rows[0].count}`);
  console.log(`Rows with Core/Society Program: ${countCore.rows[0].count}`);
  console.log(`Rows with Junior/Youth Program (should be 0): ${countJunior.rows[0].count}`);
  console.log('Sample rows:', JSON.stringify(sampleCore.rows, null, 2));

  process.exit(0);
}

verifyReportActivity();
