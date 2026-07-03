const dns = require('dns');

dns.resolve4('srv1774474.hstgr.cloud', (err, addresses) => {
  if (err) {
    console.error('DNS Resolve Error:', err.message);
  } else {
    console.log('IP Addresses for srv1774474.hstgr.cloud:', addresses);
  }
});
