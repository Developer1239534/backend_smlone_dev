const dns = require('dns');

dns.resolve4('api.smlone.com', (err, addresses) => {
  if (err) {
    console.error('DNS Resolve Error:', err);
  } else {
    console.log('DNS Addresses for api.smlone.com:', addresses);
  }
});
