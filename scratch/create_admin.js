const bcrypt = require('bcryptjs');
const db = require('../src/db/neonClient');

async function seedAdmin() {
  try {
    const username = 'admin@smlone.id';
    const password = 'Admin123';
    
    // Check if exists
    const check = await db.query('SELECT * FROM admin_akun WHERE username = $1', [username]);
    if (check.rows.length > 0) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO admin_akun (username, password, plain_password) VALUES ($1, $2, $3)',
      [username, hashedPassword, password]
    );

    console.log('✅ Default admin account created: admin@smlone.id / Admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

seedAdmin();
