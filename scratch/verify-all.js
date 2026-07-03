const { execSync } = require('child_process');

console.log('==================================================');
console.log('     MENJALANKAN SELURUH UJI KEAMANAN BACKEND     ');
console.log('==================================================\n');

const runScript = (name, scriptPath) => {
  console.log(`\n>>> [MENJALANKAN: ${name}] <<<`);
  try {
    const output = execSync(`node ${scriptPath}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`\n❌ GAGAL: Terjadi error pada ${name}`);
  }
};

runScript('Uji Keamanan JWT & Rute', 'scratch/test-security-middleware.js');
runScript('Uji Proteksi Spam (Rate Limiting)', 'scratch/verify-rate-limiting.js');
runScript('Uji Keamanan HTTP Headers (Helmet)', 'scratch/verify-helmet.js');
runScript('Uji Pencegahan Kebocoran Password', 'scratch/verify-password-omission.js');

console.log('\n==================================================');
console.log('         SEMUA PENGUJIAN SELESAI DIJALANKAN        ');
console.log('==================================================\n');
