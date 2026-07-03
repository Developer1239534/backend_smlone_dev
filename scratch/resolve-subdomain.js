const dns = require('dns');

dns.resolve4('api.smlone.com', (err, addresses) => {
  if (err) {
    console.error('DNS Resolve Error:', err.message);
  } else {
    console.log('IP Addresses for api.smlone.com:', addresses);
  }
});
