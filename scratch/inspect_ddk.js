const db = require('../src/db/neonClient');

async function inspectDataDashboardKeseluruhan() {
  try {
    const res = await db.query(`SELECT * FROM data_dashboard_keseluruhan LIMIT 5`);
    console.log('Count:', res.rows.length);
    if (res.rows.length > 0) {
      console.log('Sample row keys:', Object.keys(res.rows[0]));
      console.log('Sample row:', res.rows[0]);
    }
  } catch (err) {
    console.error('Error inspecting table:', err);
  }
}

inspectDataDashboardKeseluruhan();
