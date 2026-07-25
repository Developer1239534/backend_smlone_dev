const db = require('../src/db/neonClient');

async function checkDDK() {
  try {
    const res = await db.query('SELECT COUNT(*) FROM data_dashboard_keseluruhan');
    console.log('Total trainees in data_dashboard_keseluruhan:', res.rows[0].count);
    
    const sample = await db.query('SELECT * FROM data_dashboard_keseluruhan LIMIT 3');
    console.log('Sample rows:', sample.rows);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkDDK();
