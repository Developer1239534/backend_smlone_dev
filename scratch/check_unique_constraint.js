const db = require('../src/db/neonClient');

async function main() {
  try {
    const res = await db.query(`
      SELECT conname, pg_get_constraintdef(c.oid) 
      FROM pg_constraint c 
      JOIN pg_namespace n ON n.oid = c.connamespace 
      WHERE conrelid = 'registrasi_new'::regclass
    `);
    console.log('Constraints on registrasi_new:');
    res.rows.forEach(r => {
      console.log(`- ${r.conname}: ${r.pg_get_constraintdef}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

main();
