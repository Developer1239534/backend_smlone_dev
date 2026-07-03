const https = require('https');
const urlModule = require('url');

function getUrlInfo(targetUrl, maxRedirects = 5) {
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
          return resolve(getUrlInfo(redirectUrl, maxRedirects - 1));
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          if (data.length > 50000 || data.includes('</title>')) {
            req.destroy();
          }
        });

        res.on('close', () => {
          const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : null;
          resolve({
            statusCode: res.statusCode,
            title,
            dataSample: data.substring(0, 1000),
            hasDoesNotExistText: data.includes('Sorry, the file you have requested does not exist') || data.includes('tidak ada')
          });
        });
      });

      req.on('error', (err) => resolve({ error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ error: 'Timeout' });
      });
    } catch (err) {
      resolve({ error: err.message });
    }
  });
}

(async () => {
  const url = 'https://drive.google.com/file/d/1bu8TSomnpKx6djPFnHq61-pwra5SqXir/view?usp=drivesdk';
  console.log('Testing: ', url);
  const info = await getUrlInfo(url);
  console.log(JSON.stringify(info, null, 2));
})();
