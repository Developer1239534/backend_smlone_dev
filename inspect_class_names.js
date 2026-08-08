const db = require('./src/db/neonClient');

async function inspectClasses() {
  const res = await db.query(`SELECT DISTINCT class_name FROM portal_admin WHERE class_name IS NOT NULL ORDER BY class_name;`);
  console.log('Unique class names currently in portal_admin:');
  res.rows.forEach(r => console.log(`- "${r.class_name}"`));
  process.exit(0);
}

inspectClasses();
