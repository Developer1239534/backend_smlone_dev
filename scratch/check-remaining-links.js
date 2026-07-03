const https = require('https');
const urlModule = require('url');

const timeoutUrls = [
  { id: '1003', period: 'Real Stage 48', url: 'https://drive.google.com/file/d/1fSqbZ0brqU_V4ZpUYlVdgXmjrDU5mP1e/view?usp=drivesdk' },
  { id: '90100140', period: 'Real Stage 48', url: 'https://drive.google.com/file/d/1HrI2-6K-24bpfOIG4Xi9geYhovjZN-oF/view?usp=drivesdk' },
  { id: '1088', period: 'Real Stage 48', url: 'https://drive.google.com/file/d/1OyUMWMh5Eo9KytYS3bojAcMP45M6-NSQ/view?usp=drivesdk' },
  { id: '90100114', period: 'Real Stage 48', url: 'https://drive.google.com/file/d/1bKCmSs7844uOkZJi5VLfSpk9F5p5K3HN/view?usp=drivesdk' },
  { id: '70100041', period: 'Real Stage 48', url: 'https://drive.google.com/file/d/1XB-i-PDcQ9eKDChQGVaSrG-sW4naCa-0/view?usp=drivesdk' }
];

function getUrlInfo(targetUrl, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) {
      return resolve({ status: 'Error', error: 'Too many redirects' });
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
        timeout: 15000 // 15 seconds
      };

      const req = https.get(options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            redirectUrl = urlModule.resolve(targetUrl, redirectUrl);
          }
          return resolve(getUrlInfo(redirectUrl, maxRedirects - 1));
        }

        if (res.statusCode === 404) {
          return resolve({ status: 'Not Found', statusCode: 404 });
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          if (data.includes('</title>') || data.includes('Sorry, the file you have requested does not exist') || data.length > 50000) {
            req.destroy();
          }
        });

        res.on('close', () => {
          const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : null;

          const doesNotExist = data.includes('Sorry, the file you have requested does not exist') || 
                               data.includes('Make sure that you have the correct URL and the file exists') ||
                               (title && title.includes('Google Drive - Page Not Found')) ||
                               (title && title.includes('Google Drive - Tidak ditemukan'));

          const isSignIn = title && (title.includes('Sign-in') || title.includes('masuk') || title.includes('Google Accounts') || title.includes('Login'));

          if (doesNotExist) {
            resolve({ status: 'Not Found', statusCode: res.statusCode, title });
          } else if (isSignIn) {
            resolve({ status: 'Private/Sign-in', statusCode: res.statusCode, title });
          } else {
            resolve({ status: 'Accessible', statusCode: res.statusCode, title });
          }
        });
      });

      req.on('error', (err) => resolve({ status: 'Error', error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 'Error', error: 'Timeout' });
      });
    } catch (err) {
      resolve({ status: 'Error', error: err.message });
    }
  });
}

(async () => {
  console.log('Re-checking 5 timeout links...');
  for (const item of timeoutUrls) {
    const result = await getUrlInfo(item.url);
    console.log(`ID: ${item.id} | Period: ${item.period} | Status: ${result.status} | Title: ${result.title || 'N/A'} | URL: ${item.url}`);
  }
})();
