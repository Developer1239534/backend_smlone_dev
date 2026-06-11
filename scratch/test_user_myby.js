require('dotenv').config();
const http = require('http');
const db = require('../src/db/neonClient');

const request = (method, path, body) => {
  return new Promise((resolve, reject) => {
    const d = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(d),
        'x-trainee-id': '858' // Fallback testing authentication header we added
      }
    }, res => {
      let s = '';
      res.on('data', c => s += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(s) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: s });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(d);
    req.end();
  });
};

(async () => {
  try {
    console.log('--- STARTING MYBY USER TESTS ---');

    // 0. Ensure wallet exists and add 500 MYBY balance directly to DB for testing
    console.log('🔄 Preparing test wallet with 500 MYBY Coins...');
    await db.query('INSERT INTO myby_wallets (trainee_id, myby_balance, gp_balance) VALUES ($1, $2, $3) ON CONFLICT (trainee_id) DO UPDATE SET myby_balance = 500, gp_balance = 0', ['858', 500, 0]);
    console.log('✅ Wallet funded!');

    // 1. GET /api/user/profile
    console.log('\n1. Testing GET /api/user/profile...');
    const profile = await request('GET', '/api/user/profile');
    console.log('Response:', profile.status, profile.body);

    // 2. GET /api/user/wallet
    console.log('\n2. Testing GET /api/user/wallet...');
    const wallet = await request('GET', '/api/user/wallet');
    console.log('Response:', wallet.status, wallet.body);

    // 3. GET /api/user/rewards
    console.log('\n3. Testing GET /api/user/rewards...');
    const rewards = await request('GET', '/api/user/rewards');
    console.log('Response status:', rewards.status, 'Rewards count:', rewards.body.count);
    const sampleReward = rewards.body.data[0];
    console.log('Sample reward item:', sampleReward);

    // 4. POST /api/user/convert
    console.log('\n4. Testing POST /api/user/convert (Converting 100 MYBY to 2 GP)...');
    const convert = await request('POST', '/api/user/convert', { myby_amount: 100 });
    console.log('Response:', convert.status, convert.body);

    // 5. GET /api/user/conversions
    console.log('\n5. Testing GET /api/user/conversions...');
    const conversions = await request('GET', '/api/user/conversions');
    console.log('Response status:', conversions.status, 'Conversions count:', conversions.body.count, 'Data:', conversions.body.data);

    // 6. POST /api/user/rewards/redeem
    console.log(`\n6. Testing POST /api/user/rewards/redeem (Redeeming '${sampleReward.name}' cost: ${sampleReward.myby_cost} MYBY)...`);
    const redeem = await request('POST', '/api/user/rewards/redeem', { reward_id: sampleReward.id });
    console.log('Response:', redeem.status, redeem.body);

    // 7. GET /api/user/rewards/redemptions (Redemption history)
    console.log('\n7. Testing GET /api/user/rewards/redemptions...');
    const redemptions = await request('GET', '/api/user/rewards/redemptions');
    console.log('Response status:', redemptions.status, 'Redemptions count:', redemptions.body.count, 'Data:', redemptions.body.data);

    // 8. GET /api/user/transactions (Transaction history)
    console.log('\n8. Testing GET /api/user/transactions...');
    const transactions = await request('GET', '/api/user/transactions');
    console.log('Response status:', transactions.status, 'Transactions count:', transactions.body.count, 'Latest transactions:', transactions.body.data.slice(0, 3));

    console.log('\n--- MYBY USER TESTS COMPLETED SUCCESSFULLY ---');
  } catch(e) {
    console.error('❌ Error during testing:', e);
  } finally {
    await db.pool.end();
  }
})();
