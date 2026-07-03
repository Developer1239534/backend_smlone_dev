const { Client } = require('ssh2');

const config = {
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'SmlOneDev2026'
};

function connectSSH() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn))
        .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
          finish([config.password]);
        })
        .on('error', reject)
        .connect({
          ...config,
          tryKeyboard: true
        });
  });
}

function runCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        resolve({ code, stdout, stderr });
      }).on('data', (data) => {
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        stderr += data.toString();
      });
    });
  });
}

async function main() {
  let conn;
  try {
    conn = await connectSSH();
    console.log('✅ Connected to VPS via SSH!');

    // 1. Check if cloudflared is installed
    console.log('🔄 Checking if cloudflared is installed...');
    const checkCf = await runCommand(conn, 'which cloudflared');
    
    if (checkCf.code !== 0) {
      console.log('📥 Downloading cloudflared deb package...');
      await runCommand(conn, 'wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb');
      
      console.log('📦 Installing cloudflared...');
      await runCommand(conn, 'dpkg -i cloudflared-linux-amd64.deb');
      await runCommand(conn, 'rm -f cloudflared-linux-amd64.deb');
      console.log('✅ cloudflared installed successfully!');
    } else {
      console.log('✅ cloudflared is already installed.');
    }

    // 2. Stop any existing cf-tunnel in PM2
    console.log('🧹 Cleaning up old tunnel process in PM2...');
    await runCommand(conn, 'pm2 delete cf-tunnel');

    // 3. Start a new cloudflared quick tunnel under PM2
    console.log('🚀 Starting Cloudflare Tunnel in PM2...');
    const pm2Start = await runCommand(conn, 'pm2 start "cloudflared tunnel --url http://localhost:4000" --name "cf-tunnel"');
    console.log(pm2Start.stdout);

    console.log('💾 Saving PM2 process list...');
    await runCommand(conn, 'pm2 save');

    // 4. Wait for a few seconds and read the PM2 logs to extract the trycloudflare.com URL
    console.log('⏳ Waiting for tunnel to establish (10 seconds)...');
    await new Promise(r => setTimeout(r, 10000));

    console.log('🔍 Reading PM2 logs to find the Cloudflare Tunnel URL...');
    const pm2Logs = await runCommand(conn, 'pm2 logs cf-tunnel --lines 40 --no-colors');
    const logOutput = pm2Logs.stdout || pm2Logs.stderr;
    
    // Find the trycloudflare.com link using regex
    const regex = /https:\/\/[a-zA-d0-9-]+\.trycloudflare\.com/g;
    const matches = logOutput.match(regex);
    
    if (matches && matches.length > 0) {
      const tunnelUrl = matches[0];
      console.log(`\n🎉 SUCCESS! Cloudflare Tunnel URL: ${tunnelUrl}\n`);
    } else {
      console.log('⚠️ Could not find trycloudflare.com URL in logs. Logs output:');
      console.log(logOutput);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (conn) conn.end();
  }
}

main();
