const fs = require('fs');
const path = require('path');
const https = require('https');
const urlModule = require('url');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

function getUrlInfo(targetUrl, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) {
      return resolve({ status: 'Error', error: 'Too many redirects' });
    }

    try {
      if (!targetUrl || !targetUrl.startsWith('http')) {
        return resolve({ status: 'Error', error: 'Invalid URL' });
      }

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

async function main() {
  try {
    if (!fs.existsSync(transcriptPath)) {
      console.error('Transcript not found');
      process.exit(1);
    }

    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n');
    
    let latestUserInput = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj.type === 'USER_INPUT') {
          // Check if this input contains the table pattern
          if (obj.content.includes('Real Stage Report') || obj.content.includes('Real Stage')) {
            latestUserInput = obj.content;
            break;
          }
        }
      } catch (e) {}
    }

    if (!latestUserInput) {
      console.error('Latest user input containing the link list not found');
      process.exit(1);
    }

    // Parse the lines
    const rows = [];
    const inputLines = latestUserInput.split('\n');
    for (const line of inputLines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3 && parts[parts.length - 1].startsWith('http')) {
        const url = parts[parts.length - 1];
        const period = parts.slice(1, parts.length - 1).join(' ');
        const id = parts[0];
        if (id !== 'ID') {
          rows.push({ id, period, url });
        }
      }
    }

    console.log(`Parsed ${rows.length} rows to check.`);
    
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`Checking batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}...`);
      
      const promises = batch.map(async (row) => {
        const info = await getUrlInfo(row.url);
        results.push({ ...row, ...info });
      });
      
      await Promise.all(promises);
      await new Promise(r => setTimeout(r, 100)); // sleep 100ms
    }

    console.log('\n=== RESULTS SUMMARY ===');
    const notFound = results.filter(r => r.status === 'Not Found');
    const accessible = results.filter(r => r.status === 'Accessible');
    const privateLinks = results.filter(r => r.status === 'Private/Sign-in');
    const errors = results.filter(r => r.status === 'Error');

    console.log(`Accessible:     ${accessible.length}`);
    console.log(`Not Found:      ${notFound.length}`);
    console.log(`Private:        ${privateLinks.length}`);
    console.log(`Errors/Timeout: ${errors.length}`);

    console.log('\n=== NOT FOUND / INACCESSIBLE LINKS ===');
    if (notFound.length === 0) {
      console.log('None found!');
    } else {
      notFound.forEach(r => {
        console.log(`ID: ${r.id} | Period: ${r.period} | URL: ${r.url}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n=== ERROR LINKS ===');
      errors.forEach(r => {
        console.log(`ID: ${r.id} | Period: ${r.period} | Error: ${r.error} | URL: ${r.url}`);
      });
    }

  } catch (err) {
    console.error('Error in main:', err);
  }
}

main();
