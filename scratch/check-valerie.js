const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const trainees = await pool.query(
      "SELECT id, trainee_name, total_gold_periode, house_sml FROM dashboard_trainne WHERE trainee_name ILIKE '%Valerie%'"
    );
    console.log('Trainees matching "Valerie":');
    console.log(trainees.rows);

    for (const t of trainees.rows) {
      // Check monthly gold points
      const monthly = await pool.query(
        "SELECT * FROM gp_month WHERE trainee_id = $1",
        [t.id]
      );
      console.log(`\nMonthly GP for ${t.trainee_name} (ID: ${t.id}):`);
      console.log(monthly.rows);

      // Check annual gold points
      const annual = await pool.query(
        "SELECT * FROM gp_tahunan WHERE trainee_id = $1 ORDER BY id ASC",
        [t.id]
      );
      console.log(`Annual GP Logs for ${t.trainee_name} (ID: ${t.id}) - Count: ${annual.rows.length}:`);
      console.log(annual.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
