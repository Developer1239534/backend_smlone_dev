const { Client } = require('ssh2');

const credentials = [
  { host: '194.233.72.69', password: 'W@p0UxZcg7.b7D@' },
  { host: '194.233.72.69', password: '(6PQBskHxl2Ahc;.' },
  { host: '72.62.2.160', password: 'W@p0UxZcg7.b7D@' },
  { host: '187.127.206.193', password: '(6PQBskHxl2Ahc;.' }
];

function testCred(cred) {
  return new Promise((resolve) => {
    console.log(`Testing ${cred.host} with password ${cred.password.substring(0, 3)}...`);
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`\n✅ SUCCESS: Connected to ${cred.host} with password ${cred.password}\n`);
      conn.end();
      resolve(true);
    }).on('error', (err) => {
      console.log(`❌ FAILED: ${cred.host} error: ${err.message}`);
      resolve(false);
    }).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
      finish([cred.password]);
    }).connect({
      host: cred.host,
      port: 22,
      username: 'root',
      password: cred.password,
      tryKeyboard: true,
      readyTimeout: 10000
    });
  });
}

async function main() {
  for (const cred of credentials) {
    const success = await testCred(cred);
    if (success) {
      console.log('Found working credential!');
      break;
    }
  }
}

main();
