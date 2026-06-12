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
    console.log('=== STARTING INTEGRATION TESTS FOR TRAINEE DIGITAL WALLET (WITH SHOP & LEDGER V2) ===\n');

    const traineeId = '858'; // Delmond Osyan Sudilan

    // 1. Reset state: Hapus data dompet lama dan ledger lama
    console.log('🧹 Preparing clean test database state for trainee 858...');
    await db.query('DELETE FROM myby_coin_shop_transaction WHERE trainer_id = $1', [traineeId]);
    await db.query('DELETE FROM myby_coin_ledger WHERE trainer_id = $1', [traineeId]);
    await db.query('DELETE FROM myby_coin_transfer WHERE created_by = $1', [traineeId]);
    await db.query('DELETE FROM myby_coin_deposit WHERE trainee_id = $1', [traineeId]);
    await db.query('DELETE FROM myby_coin WHERE id = $1', [traineeId]);
    
    // Reset shop product stocks
    await db.query("UPDATE myby_coin_shop SET stock = 50 WHERE product_id = 'P-01'");
    await db.query("UPDATE myby_coin_shop SET stock = 100 WHERE product_id = 'P-02'");
    await db.query("UPDATE myby_coin_shop SET stock = 30 WHERE product_id = 'P-03'");
    
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

    // 5. Tes GET Rewards Shop (Legacy)
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

    // 9. Tes Deposit GP dari Trainer ke Trainee
    console.log('8. Testing POST /api/dashboard/myby-coin/deposit (Deposit 10 GP from trainer)...');
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
    console.log('✅ Pengujian Fitur Deposit GP Sukses.\n');

    // 10. Tes Modul Shop Baru - Ambil daftar produk aktif
    console.log('9. Testing GET /api/dashboard/myby-coin/shop/products...');
    const shopProductsRes = await request('GET', '/api/dashboard/myby-coin/shop/products');
    console.log('Shop Products Status:', shopProductsRes.status);
    console.log(`Jumlah Produk Shop Aktif: ${shopProductsRes.body.products.length}`);
    if (shopProductsRes.body.products.length !== 3) {
      throw new Error(`Jumlah produk shop aktif salah! Didapat: ${shopProductsRes.body.products.length}, diharapkan 3.`);
    }
    console.log('✅ Ambil produk shop sukses.\n');

    // 11. Tes Modul Shop Baru - Ambil detail produk P-01
    console.log("10. Testing GET /api/dashboard/myby-coin/shop/product/P-01...");
    const productDetailRes = await request('GET', '/api/dashboard/myby-coin/shop/product/P-01');
    console.log('Product Detail Status:', productDetailRes.status);
    console.log('Product Detail Data:', JSON.stringify(productDetailRes.body.product, null, 2));
    if (productDetailRes.body.product.product_name !== 'Exclusive SMLONE Hoodie' || productDetailRes.body.product.gold_point_price !== 15) {
      throw new Error('Data detail produk P-01 tidak cocok!');
    }
    console.log('✅ Detail produk P-01 sukses.\n');

    // 12. Tes Modul Shop Baru - Beli produk P-01 (15 GP) - SUKSES
    console.log("11. Testing POST /api/dashboard/myby-coin/shop/purchase (Beli P-01 seharga 15 GP - SUKSES)...");
    const purchaseRes = await request('POST', '/api/dashboard/myby-coin/shop/purchase', {
      trainer_id: traineeId,
      trainer_name: 'Delmond Osyan Sudilan',
      product_id: 'P-01'
    });
    console.log('Purchase Status:', purchaseRes.status);
    console.log('Purchase Result:', JSON.stringify(purchaseRes.body, null, 2));
    if (purchaseRes.body.status !== 'Success' || !purchaseRes.body.notification_sent) {
      throw new Error('Gagal memproses pembelian produk shop!');
    }
    const purchaseId = purchaseRes.body.transaction_id;

    // Verifikasi saldo GP setelah pembelian shop (128 - 15 = 113 GP)
    const checkRes5 = await request('GET', `/api/dashboard/myby-coin/${traineeId}`);
    console.log('Wallet Setelah Pembelian Shop:', JSON.stringify(checkRes5.body.data, null, 2));
    if (checkRes5.body.data.gp_balance !== 113) {
      throw new Error(`Saldo GP setelah pembelian salah! Sisa: ${checkRes5.body.data.gp_balance}, diharapkan 113.`);
    }

    // Verifikasi stok produk berkurang (50 - 1 = 49)
    const productDetailRes2 = await request('GET', '/api/dashboard/myby-coin/shop/product/P-01');
    if (productDetailRes2.body.product.stock !== 49) {
      throw new Error(`Stok produk tidak berkurang! Sisa: ${productDetailRes2.body.product.stock}, diharapkan 49.`);
    }
    console.log('✅ Pembelian produk shop sukses.\n');

    // 13. Tes Modul Shop Baru - Beli produk P-01 dengan saldo GP kurang - HARUS GAGAL
    // Kita buat user baru tanpa saldo atau kurangi saldo untuk tes gagal.
    // Alternatif: Beli produk P-01 oleh user yang tidak ada wallet-nya
    console.log("12. Testing POST /api/dashboard/myby-coin/shop/purchase (Beli P-01 dengan user non-existent - HARUS GAGAL)...");
    const purchaseFailRes = await request('POST', '/api/dashboard/myby-coin/shop/purchase', {
      trainer_id: '999999',
      trainer_name: 'Non Existent User',
      product_id: 'P-01'
    });
    console.log('Failed Purchase Status:', purchaseFailRes.status);
    console.log('Failed Purchase Response:', JSON.stringify(purchaseFailRes.body, null, 2));
    if (purchaseFailRes.status !== 404 || purchaseFailRes.body.success !== false) {
      throw new Error('Pembelian berhasil diproses meskipun dompet user tidak ditemukan!');
    }
    console.log('✅ Validasi kegagalan pembelian shop sukses.\n');

    // 14. Tes GET Shop History
    console.log('13. Testing GET /api/dashboard/myby-coin/shop/history?trainer_id=858...');
    const shopHistoryRes = await request('GET', `/api/dashboard/myby-coin/shop/history?trainer_id=${traineeId}`);
    console.log('Shop History Status:', shopHistoryRes.status);
    console.log('Jumlah Riwayat Pembelian:', shopHistoryRes.body.history.length);
    if (shopHistoryRes.body.history.length !== 1 || shopHistoryRes.body.history[0].transaction_id !== purchaseId) {
      throw new Error('Catatan riwayat pembelian shop tidak cocok!');
    }
    console.log('✅ Get shop history sukses.\n');

    // 15. Tes Modul Ledger Baru - Ambil semua ledger
    console.log('14. Testing GET /api/dashboard/myby-coin/ledger (Ambil semua ledger)...');
    const ledgerAllRes = await request('GET', '/api/dashboard/myby-coin/ledger');
    console.log('Ledger All Status:', ledgerAllRes.status);
    console.log(`Jumlah Total Catatan Ledger di DB: ${ledgerAllRes.body.ledger.length}`);
    console.log('✅ Ambil semua ledger sukses.\n');

    // 16. Tes Modul Ledger Baru - Get ledger history per trainer
    console.log('15. Testing GET /api/dashboard/myby-coin/ledger/history?trainer_id=858...');
    const ledgerHistoryRes = await request('GET', `/api/dashboard/myby-coin/ledger/history?trainer_id=${traineeId}`);
    console.log('Ledger History Status:', ledgerHistoryRes.status);
    console.log('Jumlah Catatan Ledger Trainee 858:', ledgerHistoryRes.body.ledger.length);
    
    // Aliran transaksi GP untuk 858:
    // 1. Konversi MYBY ke GP: Credit, 3 GP (Success)
    // 2. Transfer GP ke Arthur: Debit, 5 GP (Success)
    // 3. Transfer GP ke Arthur (Overlimit): Debit, 200 GP (Failed)
    // 4. Deposit GP dari Charles: Credit, 10 GP (Success)
    // 5. Purchase P-01: Debit, 15 GP (Success)
    // Total Ledger = 5
    if (ledgerHistoryRes.body.ledger.length !== 5) {
      throw new Error(`Jumlah catatan ledger salah! Didapat: ${ledgerHistoryRes.body.ledger.length}, diharapkan 5.`);
    }
    
    const firstLedgerId = ledgerHistoryRes.body.ledger[0].ledger_id;
    console.log('✅ Get ledger history sukses.\n');

    // 17. Tes Modul Ledger Baru - Get ledger detail
    console.log(`16. Testing GET /api/dashboard/myby-coin/ledger/detail/${firstLedgerId}...`);
    const ledgerDetailRes = await request('GET', `/api/dashboard/myby-coin/ledger/detail/${firstLedgerId}`);
    console.log('Ledger Detail Status:', ledgerDetailRes.status);
    console.log('Ledger Detail Data:', JSON.stringify(ledgerDetailRes.body.ledger, null, 2));
    if (!ledgerDetailRes.body.ledger.ledger_id || ledgerDetailRes.body.ledger.ledger_id !== firstLedgerId) {
      throw new Error('Data detail catatan ledger tidak cocok!');
    }
    console.log('✅ Get ledger detail sukses.\n');

    // 18. Tes Modul Ledger Baru - Filter Ledger
    console.log('17. Testing GET /api/dashboard/myby-coin/ledger/filter (Filter by transaction_type and status)...');
    
    // Filter Transfer
    const filterTransferRes = await request('GET', `/api/dashboard/myby-coin/ledger/filter?trainer_id=${traineeId}&transaction_type=Transfer`);
    console.log('Jumlah Filter Transfer:', filterTransferRes.body.ledger.length);
    if (filterTransferRes.body.ledger.length !== 2) {
      throw new Error(`Jumlah filter transfer salah! Didapat: ${filterTransferRes.body.ledger.length}, diharapkan 2.`);
    }

    // Filter status Failed
    const filterFailedRes = await request('GET', `/api/dashboard/myby-coin/ledger/filter?trainer_id=${traineeId}&status=Failed`);
    console.log('Jumlah Filter Failed:', filterFailedRes.body.ledger.length);
    if (filterFailedRes.body.ledger.length !== 1) {
      throw new Error(`Jumlah filter Failed salah! Didapat: ${filterFailedRes.body.ledger.length}, diharapkan 1.`);
    }

    // Filter Purchase
    const filterPurchaseRes = await request('GET', `/api/dashboard/myby-coin/ledger/filter?trainer_id=${traineeId}&transaction_type=Purchase`);
    console.log('Jumlah Filter Purchase:', filterPurchaseRes.body.ledger.length);
    if (filterPurchaseRes.body.ledger.length !== 1) {
      throw new Error(`Jumlah filter Purchase salah! Didapat: ${filterPurchaseRes.body.ledger.length}, diharapkan 1.`);
    }

    console.log('✅ Filter ledger sukses.\n');

    console.log('🎉🎉🎉 ALL SHOP & LEDGER INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉🎉🎉');

  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
  } finally {
    await db.pool.end();
    console.log('🔌 DB connection closed.');
  }
})();
