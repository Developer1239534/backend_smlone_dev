/**
 * SMLONE - Sync Referral Codes & Real Stage Vouchers from Masterfile Portal
 * Source: Masterfile Portal Google Sheet (Tabs: 'Referal ' and 'Voucher Real Stage')
 * Target: MariaDB (Tables: referral_code & voucher_real_stage)
 */

const { google } = require('googleapis');
const mysql = require('/root/backend_smlone_dev/src/db/mysqlClient');
const { Pool } = require('/root/backend_smlone_dev/node_modules/pg');
require('/root/backend_smlone_dev/node_modules/dotenv').config({ path: '/root/backend_smlone_dev/.env' });

const MASTERFILE_SPREADSHEET_ID = '14XLu5-7umfsyVXy9bvIjdumBeOGF57wvxxxd5ZsS0jU';

async function syncReferralAndVouchers() {
  const startTime = Date.now();
  console.log('=== MEMULAI SINKRONISASI REFERRAL CODE & VOUCHER DARI MASTERFILE PORTAL ===');

  const auth = new google.auth.GoogleAuth({
    keyFile: '/root/service_account_n8n.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SINKRONISASI REFERRAL CODE (Tab 'Referal ')
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('1. Mengambil data dari tab "Referal "...');
  const refRes = await sheets.spreadsheets.values.get({
    spreadsheetId: MASTERFILE_SPREADSHEET_ID,
    range: "'Referal '!A3:E"
  });
  const rawRefRows = refRes.data.values || [];
  console.log(`   Ditemukan ${rawRefRows.length} baris di tab Referal .`);

  const refRecords = [];
  const seenRefIds = new Set();

  for (const r of rawRefRows) {
    const id = String(r[0] || '').trim();
    const code = String(r[4] || '').trim();
    const name = String(r[1] || '').trim();
    if (!id || !code || id === 'ID' || seenRefIds.has(id)) continue;

    seenRefIds.add(id);
    refRecords.push({ id, code, name });
  }
  console.log(`   Diproses ${refRecords.length} referral code unik.`);

  let refUpdated = 0;
  for (const rec of refRecords) {
    await mysql.query(`
      INSERT INTO referral_code (\`ID\`, \`Referral Code\`, \`Name\`, \`created_at\`, \`updated_at\`)
      VALUES (?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        \`Referral Code\` = VALUES(\`Referral Code\`),
        \`Name\` = VALUES(\`Name\`),
        \`updated_at\` = NOW()
    `, [rec.id, rec.code, rec.name]);
    refUpdated++;
  }
  console.log(`   ✅ Selesai memperbarui ${refUpdated} referral code di MariaDB.`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SINKRONISASI VOUCHER REAL STAGE (Tab 'Voucher Real Stage' Col A:E)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('2. Mengambil data voucher dari tab "Voucher Real Stage" (Col A:E)...');
  const vsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: MASTERFILE_SPREADSHEET_ID,
    range: "'Voucher Real Stage'!A3:E"
  });
  const rawVsRows = vsRes.data.values || [];
  console.log(`   Ditemukan ${rawVsRows.length} baris di tab Voucher Real Stage.`);

  let vsInserted = 0;
  for (const r of rawVsRows) {
    const noVoucher = String(r[0] || '').trim();
    const name = String(r[2] || '').trim();
    const id = String(r[3] || '').trim();
    const link = String(r[4] || '').trim();

    if (!noVoucher || noVoucher === 'Kode Voucher' || !link.startsWith('http')) continue;

    await mysql.query(`
      INSERT INTO voucher_real_stage (\`NoVoucher\`, \`NamaTrainee\`, \`ID\`, \`LinkVoucherRealStage\`)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`NamaTrainee\` = VALUES(\`NamaTrainee\`),
        \`ID\` = VALUES(\`ID\`),
        \`LinkVoucherRealStage\` = VALUES(\`LinkVoucherRealStage\`)
    `, [noVoucher, name, id, link]);
    vsInserted++;
  }
  console.log(`   ✅ Selesai memperbarui ${vsInserted} voucher real stage di MariaDB.`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🎉 SINKRONISASI SELESAI dalam ${duration} detik!`);
  process.exit(0);
}

if (require.main === module) {
  syncReferralAndVouchers().catch(err => {
    console.error('❌ Error sinkronisasi:', err);
    process.exit(1);
  });
}

module.exports = { syncReferralAndVouchers };
