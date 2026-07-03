const dns = require('dns');
const { Resolver } = dns.promises;
const resolver = new Resolver();

// We can query DNS SOA or search whois via a web request or use a public WHOIS API/search.
// Let's perform a simple DNS TXT or WHOIS check by querying a public WHOIS JSON API.
// Or we can just use search_web to look up whois of smlone.com!
// Yes, search_web is very fast and easy!
