require('dotenv').config({ path: '/root/backend_smlone_dev/.env' });
const mysql = require('mysql2/promise');

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'srv1825659.hstgr.cloud',
      user: process.env.DB_USER || 'u1825659_default',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'u1825659_smlone',
      port: process.env.DB_PORT || 3306
    });

    const [rows] = await connection.execute(
      "SELECT ID, Name, `School Name`, `Date of Birth`, `Parent WhatsApp Number`, `Trainee WhatsApp Number` FROM profile_trainee WHERE (`School Name` IS NOT NULL AND `School Name` != '') OR (`Date of Birth` IS NOT NULL AND `Date of Birth` != '')"
    );
    console.log('MySQL filled profiles:', rows);
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
