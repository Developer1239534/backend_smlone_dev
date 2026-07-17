require('dotenv').config();
const db = require('../src/db/neonClient');

async function execute() {
  try {
    console.log('Dropping dashboard_trainne and cascading...');
    await db.query('DROP TABLE IF EXISTS dashboard_trainne CASCADE');
    console.log('Dropped successfully.');

    console.log('Creating admin_akun table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_akun (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        plain_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created admin_akun successfully.');
    
    // Seed an initial admin account if not exists
    const check = await db.query('SELECT * FROM admin_akun WHERE username = $1', ['admin']);
    if (check.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await db.query('INSERT INTO admin_akun (username, password, plain_password) VALUES ($1, $2, $3)', ['admin', hash, 'admin123']);
      console.log('Seeded initial admin account (admin / admin123).');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}
execute();
