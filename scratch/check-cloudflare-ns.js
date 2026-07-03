const dns = require('dns');

function checkDns() {
  dns.resolve4('api.smlone.com', (err, addresses) => {
    if (err) {
      console.log('DNS Resolve Error:', err.message);
    } else {
      console.log('Current IP Addresses for api.smlone.com:', addresses);
      if (addresses.includes('72.62.2.160')) {
        console.log('❌ Still pointing directly to VPS IP (not proxied by Cloudflare yet).');
      } else {
        console.log('✅ Pointing to Cloudflare IPs! DNS propagation active and proxied successfully!');
      }
    }
  });
}

checkDns();
