const https = require('https');
const urlModule = require('url');

const sampleFolderUrl = 'https://drive.google.com/drive/folders/1AmongAK-9MRWMSS_v7SRihMbXwOUo45X?usp=drive_link';

function getFolderHtml(targetUrl, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) {
      return resolve({ error: 'Too many redirects' });
    }

    try {
      const parsedUrl = urlModule.parse(targetUrl);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        port: parsedUrl.port || 443,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        },
        timeout: 5000
      };

      const req = https.get(options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            redirectUrl = urlModule.resolve(targetUrl, redirectUrl);
          }
          return resolve(getFolderHtml(redirectUrl, maxRedirects - 1));
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          if (data.length > 250000) {
            req.destroy();
          }
        });

        res.on('close', () => {
          resolve(data);
        });
      });

      req.on('error', (err) => resolve({ error: err.message }));
    } catch (err) {
      resolve({ error: err.message });
    }
  });
}

(async () => {
  console.log('Fetching sample folder HTML:', sampleFolderUrl);
  const html = await getFolderHtml(sampleFolderUrl);
  
  if (typeof html === 'string') {
    console.log(`Fetched ${html.length} bytes of HTML.`);
    
    // Check if there are signs of files or item names inside
    // Google Drive encodes file/item list inside window._state or similar JS variables
    const matches = [...html.matchAll(/\"[^\"]+\.(?:pdf|docx|xlsx|zip|png|jpg|mp4)\"/gi)];
    console.log('\nPotential files listed in HTML:');
    if (matches.length > 0) {
      console.log(matches.slice(0, 15).map(m => m[0]));
    } else {
      console.log('No direct file name matches found in static HTML (requires JS/API to list).');
    }
  } else {
    console.log('Error fetching:', html);
  }
})();
