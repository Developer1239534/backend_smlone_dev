const db = require('../src/db/neonClient');

async function testFetch() {
  try {
    const res = await db.query('SELECT * FROM portal_trainee WHERE trainee_id = $1', ['TR-TEST-99']);
    console.log('✅ Parsed Record in DB:');
    console.log(JSON.stringify(res.rows[0], null, 2));

    await db.query('DELETE FROM portal_trainee WHERE trainee_id = $1', ['TR-TEST-99']);
    console.log('🧹 Cleaned up test record.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

testFetch();
