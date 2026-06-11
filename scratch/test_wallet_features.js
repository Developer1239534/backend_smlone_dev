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
    console.log('=== STARTING INTEGRATION TESTS FOR TRAINEE DIGITAL WALLET ===\n');

    const traineeId = '858'; // Delmond Osyan Sudilan

    // 1. Reset state: Hapus data dompet lama dan ledger lama
    console.log('🧹 Preparing clean test database state for trainee 858...');
    await db.query('DELETE FROM myby_coin_ledger WHERE trainee_id = $1', [traineeId]);
    await db.query('DELETE FROM myby_coin_transfer WHERE created_by = $1', [traineeId]);
    await db.query('DELETE FROM myby_coin_deposit WHERE trainee_id = $1', [traineeId]);
    await db.query('DELETE FROM myby_coin WHERE id = $1', [traineeId]);
    console.log('✅ Clean up completed.\n');

    // 2. Akses GET wallet pertama kali untuk memicu inisialisasi wallet
    // Delmond memiliki total_gold_periode = 120, jadi gp_balance awal harus 120
    console.log('1. Testing GET /api/dashboard/myby-coin/858 (Initialize wallet)...');
    const initRes = await request('GET', `/api/dashboard/myby-coin/${traineeId}`);
    console.log('Init Status:', initRes.status);
    console.log('Init Data:', JSON.stringify(initRes.body.data, null, 2));
    if (initRes.body.data.gp_balance !== 120 || initRes.body.data.myby_balance !== 0) {
      throw new Error(`Saldo awal tidak cocok! Diharapkan GP = 120 dan MYBY = 0. Didapat: GP = ${initRes.body.data.gp_balance}, MYBY = ${initRes.body.data.myby_balance}`);
    }
    console.log('✅ Inisialisasi wallet sukses.\n');

    // 3. Tes Vault Action - Deposit 300 MYBY
    console.log('2. Testing POST /api/dashboard/myby-coin/vault-action (Deposit 300 MYBY)...');
    const depRes = await request('POST', '/api/dashboard/myby-coin/vault-action', {
      trainee_id: traineeId,
      action_type: 'deposit',
      currency: 'MYBY',
      amount: 300
    });
    console.log('Deposit Status:', depRes.status);
    console.log('Deposit Message:', depRes.body.message);

    // Verifikasi saldo setelah deposit
    const checkRes1 = await request('GET', `/api/dashboard/myby-coin/${traineeId}`);
    console.log('Wallet Setelah Deposit:', JSON.stringify(checkRes1.body.data, null, 2));
    if (checkRes1.body.data.myby_balance !== 300) {
      throw new Error(`Gagal Deposit! Saldo koin MYBY sekarang: ${checkRes1.body.data.myby_balance}, diharapkan 300.`);
    }
    console.log('✅ Deposit berhasil.\n');

    // 4. Tes Vault Converter - Konversi 150 MYBY ke GP (Diharapkan dapat 3 GP)
    console.log('3. Testing POST /api/dashboard/myby-coin/convert (Konversi 150 MYBY)...');
    const convRes = await request('POST', '/api/dashboard/myby-coin/convert', {
      trainee_id: traineeId,
      amount: 150
    });
    console.log('Convert Status:', convRes.status);
    console.log('Convert Result:', JSON.stringify(convRes.body, null, 2));

    // Verifikasi saldo setelah konversi
    const checkRes2 = await request('GET', `/api/dashboard/myby-coin/${traineeId}`);
    console.log('Wallet Setelah Konversi:', JSON.stringify(checkRes2.body.data, null, 2));
    if (checkRes2.body.data.myby_balance !== 150 || checkRes2.body.data.gp_balance !== 123) {
      throw new Error(`Saldo tidak cocok setelah konversi! Diharapkan MYBY = 150, GP = 123. Didapat: MYBY = ${checkRes2.body.data.myby_balance}, GP = ${checkRes2.body.data.gp_balance}`);
    }
    console.log('✅ Konversi berhasil.\n');

    // 5. Tes GET Rewards Shop
    console.log('4. Testing GET /api/dashboard/myby-coin/rewards...');
    const rewRes = await request('GET', '/api/dashboard/myby-coin/rewards');
    console.log('Rewards Status:', rewRes.status);
    console.log(`Jumlah reward tersedia: ${rewRes.body.rewards.length}`);
    const firstReward = rewRes.body.rewards[0];
    console.log('Reward Pertama:', JSON.stringify(firstReward, null, 2));
    if (!firstReward || firstReward.reward_name !== 'Premium Academy E-Book') {
      throw new Error('Reward Pertama di Rewards Shop salah!');
    }
    console.log('✅ Get rewards shop berhasil.\n');

    // 6. Tes Claim Reward (Claim Premium Academy E-Book seharga 100 MYBY)
    console.log(`5. Testing POST /api/dashboard/myby-coin/rewards/claim (Klaim item ID ${firstReward.id} seharga ${firstReward.cost} MYBY)...`);
    const claimRes = await request('POST', '/api/dashboard/myby-coin/rewards/claim', {
      trainee_id: traineeId,
      reward_id: firstReward.id
    });
    console.log('Claim Status:', claimRes.status);
    console.log('Claim Result:', JSON.stringify(claimRes.body, null, 2));

    // Verifikasi saldo dan stok setelah klaim
    const checkRes3 = await request('GET', `/api/dashboard/myby-coin/${traineeId}`);
    console.log('Wallet Setelah Klaim Reward:', JSON.stringify(checkRes3.body.data, null, 2));
    if (checkRes3.body.data.myby_balance !== 50) {
      throw new Error(`Saldo koin tidak berkurang dengan benar! Sisa: ${checkRes3.body.data.myby_balance}, diharapkan 50.`);
    }
    console.log('✅ Klaim reward berhasil.\n');

    // 7. Tes Transfer Gold Point - Sukses (Transfer 5 GP ke Trainer T-01)
    console.log('6. Testing POST /api/dashboard/myby-coin/transfer (Transfer 5 GP ke Trainer T-01 - SUKSES)...');
    const transRes = await request('POST', '/api/dashboard/myby-coin/transfer', {
      created_by: traineeId,
      trainer_id: 'T-01',
      trainer_name: 'Trainer Arthur',
      amount_gold_point: 5
    });
    console.log('Transfer Status:', transRes.status);
    console.log('Transfer Result:', JSON.stringify(transRes.body, null, 2));

    // Verifikasi saldo GP setelah transfer
    const checkRes4 = await request('GET', `/api/dashboard/myby-coin/${traineeId}`);
    console.log('Wallet Setelah Transfer GP:', JSON.stringify(checkRes4.body.data, null, 2));
    if (checkRes4.body.data.gp_balance !== 118) {
      throw new Error(`Saldo GP tidak berkurang dengan benar! Sisa: ${checkRes4.body.data.gp_balance}, diharapkan 118.`);
    }
    console.log('✅ Transfer GP sukses berhasil.\n');

    // 8. Tes Transfer Gold Point - Gagal (Mencoba transfer 200 GP)
    console.log('7. Testing POST /api/dashboard/myby-coin/transfer (Transfer 200 GP ke Trainer T-01 - HARUS GAGAL)...');
    const transFailRes = await request('POST', '/api/dashboard/myby-coin/transfer', {
      created_by: traineeId,
      trainer_id: 'T-01',
      trainer_name: 'Trainer Arthur',
      amount_gold_point: 200
    });
    console.log('Failed Transfer Status:', transFailRes.status);
    console.log('Failed Transfer Response:', JSON.stringify(transFailRes.body, null, 2));
    if (transFailRes.status !== 400 || transFailRes.body.success !== false) {
      throw new Error('Sistem mengizinkan transfer melebihi saldo GP!');
    }

    // Verifikasi database mencatat transaksi transfer 'Failed'
    const transferLogRes = await db.query('SELECT status, amount_gold_point FROM myby_coin_transfer WHERE created_by = $1 AND status = \'Failed\'', [traineeId]);
    console.log(`Jumlah log transfer berstatus Failed di DB: ${transferLogRes.rows.length}`);
    if (transferLogRes.rows.length !== 1) {
      throw new Error('Transaksi transfer gagal tidak tercatat dengan status Failed di database!');
    }
    console.log('✅ Validasi penolakan saldo dan log transfer gagal berhasil.\n');

    // 9. Tes Ledger - Menampilkan Ledger histori transaksi trainee
    console.log('8. Testing GET /api/dashboard/myby-coin/ledger/858 (Get all ledger)...');
    const ledgerRes = await request('GET', `/api/dashboard/myby-coin/ledger/${traineeId}`);
    console.log('Ledger Status:', ledgerRes.status);
    console.log('Jumlah Catatan Ledger (Semua):', ledgerRes.body.ledger.length);
    console.log('Semua Histori Ledger:', JSON.stringify(ledgerRes.body.ledger, null, 2));

    // Validasi jumlah item ledger. Kita melakukan:
    // - Deposit (earned): 300 MYBY
    // - Conversion (redeemed): 150 MYBY
    // - Conversion (earned): 3 GP
    // - Reward Claim (redeemed): 100 MYBY
    // - Transfer GP (redeemed): 5 GP
    // Total ledger yang tercatat harus = 5 baris.
    if (ledgerRes.body.ledger.length !== 5) {
      throw new Error(`Jumlah catatan ledger salah! Didapat: ${ledgerRes.body.ledger.length}, diharapkan 5.`);
    }

    // Cek filter 'earned'
    const ledgerEarnedRes = await request('GET', `/api/dashboard/myby-coin/ledger/${traineeId}?type=earned`);
    console.log('Jumlah Catatan Ledger (Earned):', ledgerEarnedRes.body.ledger.length);
    if (ledgerEarnedRes.body.ledger.length !== 2) {
      throw new Error(`Jumlah catatan ledger earned salah! Didapat: ${ledgerEarnedRes.body.ledger.length}, diharapkan 2.`);
    }

    // Cek filter 'redeemed'
    const ledgerRedeemedRes = await request('GET', `/api/dashboard/myby-coin/ledger/${traineeId}?type=redeemed`);
    console.log('Jumlah Catatan Ledger (Redeemed):', ledgerRedeemedRes.body.ledger.length);
    if (ledgerRedeemedRes.body.ledger.length !== 3) {
      throw new Error(`Jumlah catatan ledger redeemed salah! Didapat: ${ledgerRedeemedRes.body.ledger.length}, diharapkan 3.`);
    }

    console.log('✅ Validasi Ledger berhasil.\n');

    // 10. Tes Deposit GP dari Trainer ke Trainee
    console.log('9. Testing POST /api/dashboard/myby-coin/deposit (Deposit 10 GP from trainer)...');
    const depGpRes = await request('POST', '/api/dashboard/myby-coin/deposit', {
      trainee_id: traineeId,
      trainer_id: 'T-02',
      trainer_name: 'Trainer Charles',
      amount_gold_point: 10,
      deposit_method: 'Transfer Bank'
    });
    console.log('Deposit GP Status:', depGpRes.status);
    console.log('Deposit GP Result:', JSON.stringify(depGpRes.body, null, 2));
    if (depGpRes.body.status !== 'Success' || !depGpRes.body.notification_sent) {
      throw new Error('Gagal memproses deposit GP!');
    }
    const depositId = depGpRes.body.deposit_id;

    // Verifikasi saldo dompet setelah deposit GP
    const balanceRes = await request('GET', `/api/dashboard/myby-coin/wallet/balance/${traineeId}`);
    console.log('Wallet Balance Setelah Deposit GP:', JSON.stringify(balanceRes.body.balance, null, 2));
    // Sisa saldo GP sebelumnya adalah 118, ditambah 10 GP harusnya menjadi 128
    if (balanceRes.body.balance.gp_balance !== 128) {
      throw new Error(`Saldo GP tidak bertambah dengan benar setelah deposit! Didapat: ${balanceRes.body.balance.gp_balance}, diharapkan 128.`);
    }

    // 11. Tes Deposit History
    console.log('10. Testing GET /api/dashboard/myby-coin/deposit/history?trainee_id=858...');
    const depHistoryRes = await request('GET', `/api/dashboard/myby-coin/deposit/history?trainee_id=${traineeId}`);
    console.log('Deposit History Status:', depHistoryRes.status);
    console.log('Jumlah Riwayat Deposit:', depHistoryRes.body.deposits.length);
    if (depHistoryRes.body.deposits.length !== 1 || depHistoryRes.body.deposits[0].deposit_id !== depositId) {
      throw new Error('Catatan riwayat deposit tidak cocok!');
    }

    // 12. Tes Deposit Detail
    console.log(`11. Testing GET /api/dashboard/myby-coin/deposit/detail/${depositId}...`);
    const depDetailRes = await request('GET', `/api/dashboard/myby-coin/deposit/detail/${depositId}`);
    console.log('Deposit Detail Status:', depDetailRes.status);
    console.log('Deposit Detail Data:', JSON.stringify(depDetailRes.body.deposit, null, 2));
    if (depDetailRes.body.deposit.amount_gold_point !== 10 || depDetailRes.body.deposit.deposit_method !== 'Transfer Bank') {
      throw new Error('Data detail transaksi deposit tidak cocok!');
    }
    console.log('✅ Pengujian Fitur Deposit GP Sukses.\n');

    console.log('🎉🎉🎉 ALL WALLET INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉🎉🎉');

  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
  } finally {
    await db.pool.end();
    console.log('🔌 DB connection closed.');
  }
})();
