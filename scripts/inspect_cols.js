const db = require('../src/db/neonClient');

async function main() {
  const res = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='login_portal_fix' ORDER BY ordinal_position`);
  console.log('login_portal_fix columns:');
  res.rows.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
  
  const sample = await db.query(`SELECT * FROM login_portal_fix LIMIT 1`);
  console.log('Sample row keys:', Object.keys(sample.rows[0] || {}));
  process.exit(0);
}

main().catch(console.error);
