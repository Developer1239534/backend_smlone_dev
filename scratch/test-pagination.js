const { pool } = require('../src/db/neonClient');

async function testPagination() {
  try {
    console.log('🔄 Testing limit=2 and offset=0...');
    const res1 = await pool.query('SELECT id, trainee_name FROM dashboard_trainne ORDER BY id ASC LIMIT 2 OFFSET 0');
    console.log('Page 1:', res1.rows);

    console.log('\n🔄 Testing limit=2 and offset=2...');
    const res2 = await pool.query('SELECT id, trainee_name FROM dashboard_trainne ORDER BY id ASC LIMIT 2 OFFSET 2');
    console.log('Page 2:', res2.rows);

    if (res1.rows[0]?.id !== res2.rows[0]?.id) {
      console.log('\n✅ Pagination SQL logic works correctly and returns distinct offsets!');
    } else {
      console.error('\n❌ Pagination failed: returned identical data.');
    }

  } catch (err) {
    console.error('Error testing pagination:', err.message);
  } finally {
    await pool.end();
  }
}

testPagination();
