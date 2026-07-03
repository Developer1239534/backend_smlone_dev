const bcrypt = require('bcryptjs');
const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const adminId = 'admin@smlone.id';
    const plainPassword = 'Admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('🔐 Creating admin account...');

    // Check if admin already exists
    const existing = await pool.query('SELECT id FROM dashboard_trainne WHERE id = $1', [adminId]);
    if (existing.rows.length > 0) {
      console.log('Admin already exists, updating password...');
      await pool.query(
        'UPDATE dashboard_trainne SET password = $1, plain_password = $2 WHERE id = $3',
        [hashedPassword, plainPassword, adminId]
      );
    } else {
      await pool.query(
        `INSERT INTO dashboard_trainne (id, trainee_name, status, class, cabang, password, plain_password, junior_youth)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [adminId, 'Admin SMLONE', 'Active', 'Admin', 'ALL', hashedPassword, plainPassword, 'Admin']
      );
    }

    console.log('✅ Admin account created successfully!');
    console.log(`   Email/ID : ${adminId}`);
    console.log(`   Password : ${plainPassword}`);

    // Verify login works
    const verify = await pool.query('SELECT id, trainee_name, class FROM dashboard_trainne WHERE id = $1', [adminId]);
    console.log('\nVerification:', verify.rows[0]);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
