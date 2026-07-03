const net = require('net');

function getWhois(domain) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let response = '';
    
    client.connect(43, 'whois.verisign-grs.com', () => {
      client.write(domain + '\r\n');
    });
    
    client.on('data', (data) => {
      response += data.toString();
    });
    
    client.on('close', () => {
      resolve(response);
    });
    
    client.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    const raw = await getWhois('smlone.com');
    // Extract Registrar Name
    const lines = raw.split('\n');
    const registrarLine = lines.find(l => l.includes('Registrar:'));
    console.log('WHOIS Raw Result:');
    console.log(raw);
    console.log('\nParsed Registrar:', registrarLine);
  } catch (err) {
    console.error('Error fetching WHOIS:', err.message);
  }
}

main();
