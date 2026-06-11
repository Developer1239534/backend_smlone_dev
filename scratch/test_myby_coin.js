const http = require('http');
require('dotenv').config();
const db = require('../src/db/neonClient');

const request = (method, path, body) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
};

(async () => {
  try {
    console.log('--- MYBY COIN INTEGRATION TEST ---');

    // 1. Verify table exists in the database
    console.log('1. Verifying myby_coin table schema in DB...');
    const schemaResult = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'myby_coin'
    `);
    console.log('Columns in myby_coin:', schemaResult.rows.map(r => `${r.column_name} (${r.data_type})`));
    
    // Ensure gen_random_uuid / UUID type matches
    const hasId = schemaResult.rows.some(r => r.column_name === 'id');
    if (!hasId) {
      throw new Error('Table myby_coin does not have id column!');
    }

    // 2. Clean up any existing test wallet for student 858
    console.log('\n2. Cleaning up existing test wallet for trainee 858...');
    await db.query("DELETE FROM myby_coin WHERE trainee_id = '858'");
    console.log('Test wallet cleaned.');

    // 3. Test GET wallet (first time, should auto-create with welcome bonus)
    console.log('\n3. Testing GET /api/dashboard/myby-coin/858 (First access, should auto-create)...');
    const resFirst = await request('GET', '/api/dashboard/myby-coin/858');
    console.log('Status Code:', resFirst.status);
    console.log('Response Success:', resFirst.body.success);
    console.log('Wallet Data:', JSON.stringify(resFirst.body.data, null, 2));

    if (resFirst.status !== 200 || !resFirst.body.success) {
      throw new Error('Failed to fetch/initialize wallet!');
    }
    if (resFirst.body.data.gp_balance !== 50 || resFirst.body.data.myby_balance !== 0) {
      throw new Error('Initial balance incorrect! Expected 50 GP and 0 MYBY.');
    }
    if (resFirst.body.data.trainee_name !== 'Delmond Osyan Sudilan') {
      throw new Error('Incorrect trainee name returned!');
    }

    // 4. Test GET wallet (second time, should retrieve existing)
    console.log('\n4. Testing GET /api/dashboard/myby-coin/858 (Second access, should return existing)...');
    const resSecond = await request('GET', '/api/dashboard/myby-coin/858');
    console.log('Status Code:', resSecond.status);
    console.log('Response Success:', resSecond.body.success);
    console.log('Wallet Data ID:', resSecond.body.data.id);

    if (resFirst.body.data.id !== resSecond.body.data.id) {
      throw new Error('Wallet ID mismatch between first and second fetch!');
    }

    // 5. Test GET wallet for invalid student
    console.log('\n5. Testing GET /api/dashboard/myby-coin/99999 (Invalid student, should fail)...');
    const resInvalid = await request('GET', '/api/dashboard/myby-coin/99999');
    console.log('Status Code:', resInvalid.status);
    console.log('Response Success:', resInvalid.body.success);
    console.log('Message:', resInvalid.body.message);

    if (resInvalid.status !== 404 || resInvalid.body.success !== false) {
      throw new Error('Invalid trainee did not return 404!');
    }

    console.log('\n✅ ALL MYBY COIN TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
  } finally {
    await db.pool.end();
    console.log('🔌 DB connection closed.');
  }
})();
