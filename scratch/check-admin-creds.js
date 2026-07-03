const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    // Check for any admin-like accounts
    const res = await pool.query(
      `SELECT id, trainee_name, class, cabang, plain_password 
       FROM dashboard_trainne 
       WHERE LOWER(trainee_name) LIKE '%admin%' 
          OR id = 'admin'
       LIMIT 10`
    );
    console.log('Admin-like users found:', res.rows);

    // Also show first 5 users with plain_password set
    const res2 = await pool.query(
      `SELECT id, trainee_name, plain_password 
       FROM dashboard_trainne 
       WHERE plain_password IS NOT NULL 
       LIMIT 5`
    );
    console.log('\nSample users with plain_password:', res2.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
