const net = require('net');

function checkPort(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const host = '72.62.2.160';
  console.log(`Long polling ports on ${host}...`);
  for (let i = 0; i < 10; i++) {
    const p22 = await checkPort(22, host);
    const p80 = await checkPort(80, host);
    const p443 = await checkPort(443, host);
    console.log(`Attempt ${i + 1}: Port 22=${p22}, Port 80=${p80}, Port 443=${p443}`);
    if (p22 || p80 || p443) {
      break;
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

main();
