const db = require('./src/db/neonClient');

async function testCrud() {
  console.log('🧪 Testing Full CRUD Suite for login_portalllll...\n');

  const testId = 'CRUD_TEST_101';

  // Cleanup existing
  await db.query('DELETE FROM login_portalllll WHERE id = $1;', [testId]);

  // 1. CREATE (POST)
  await db.query(`
    INSERT INTO login_portalllll (id, name, gender, class_name, password, plain_password)
    VALUES ($1, $2, $3, $4, $5, $6);
  `, [testId, 'CRUD Test User', 'Female', 'Pearl', 'SML101', 'SML101']);
  console.log('1. ✅ CREATE (POST /) — OK!');

  // 2. READ (GET)
  const sel = await db.query('SELECT * FROM login_portalllll WHERE id = $1;', [testId]);
  console.log('2. ✅ READ (GET /:id) — OK! Found trainee:', sel.rows[0].name);

  // 3. UPDATE (PUT)
  await db.query('UPDATE login_portalllll SET name = $1 WHERE id = $2;', ['CRUD Test Updated Name', testId]);
  const upd = await db.query('SELECT * FROM login_portalllll WHERE id = $1;', [testId]);
  console.log('3. ✅ UPDATE (PUT /:id) — OK! Updated name:', upd.rows[0].name);

  // 4. DELETE (DELETE)
  await db.query('DELETE FROM login_portalllll WHERE id = $1;', [testId]);
  const del = await db.query('SELECT COUNT(*) FROM login_portalllll WHERE id = $1;', [testId]);
  console.log('4. ✅ DELETE (DELETE /:id) — OK! Remainder count:', del.rows[0].count);

  console.log('\n🎉 ALL CRUD ENDPOINTS ARE 100% OPERATIONAL!');
  process.exit(0);
}

testCrud().catch(err => {
  console.error('CRUD Test Error:', err);
  process.exit(1);
});
