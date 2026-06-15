const db = require('../src/db/neonClient');
const https = require('https');
const urlModule = require('url');

// Helper to fetch page title following redirects
function getPageTitle(targetUrl, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) {
      return resolve({ title: null, error: 'Too many redirects', finalUrl: targetUrl });
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
        timeout: 5000 // 5 seconds timeout
      };

      const req = https.get(options, (res) => {
        // Handle redirect
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (!redirectUrl.startsWith('http')) {
            redirectUrl = urlModule.resolve(targetUrl, redirectUrl);
          }
          return resolve(getPageTitle(redirectUrl, maxRedirects - 1));
        }

        if (res.statusCode !== 200) {
          return resolve({ title: null, error: `HTTP ${res.statusCode}`, finalUrl: targetUrl });
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          // Stop downloading if we already have the title tag
          if (data.includes('</title>')) {
            req.destroy();
          }
        });

        res.on('close', () => {
          const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch) {
            // Decode simple HTML entities if any
            let title = titleMatch[1]
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim();
            resolve({ title, finalUrl: targetUrl });
          } else {
            resolve({ title: null, error: 'No title tag', finalUrl: targetUrl });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ title: null, error: err.message, finalUrl: targetUrl });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ title: null, error: 'Timeout', finalUrl: targetUrl });
      });
    } catch (err) {
      resolve({ title: null, error: err.message, finalUrl: targetUrl });
    }
  });
}

// Check if two strings correspond (name matching check)
function isMatching(traineeName, docTitle) {
  if (!docTitle) return false;
  
  const cleanTitle = docTitle.toLowerCase().replace(/- google drive/gi, '').trim();
  const cleanName = traineeName.toLowerCase().trim();

  // 1. Direct contains check
  if (cleanTitle.includes(cleanName) || cleanName.includes(cleanTitle)) {
    return true;
  }

  // 2. Check if main name words are present in the title
  // Split name into words, filter out short words/initials
  const nameWords = cleanName.split(/\s+/).filter(w => w.length > 2);
  if (nameWords.length > 0) {
    // If at least 2 words match, or if it's a short name and the only word matches
    let matchCount = 0;
    for (const word of nameWords) {
      if (cleanTitle.includes(word)) {
        matchCount++;
      }
    }
    if (matchCount >= Math.min(2, nameWords.length)) {
      return true;
    }
  }

  return false;
}

async function main() {
  try {
    console.log('Fetching non-null screening_test records...');
    const result = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE screening_test IS NOT NULL ORDER BY id ASC');
    console.log(`Loaded ${result.rows.length} records.`);

    const report = {
      matches: [],
      mismatches: [],
      privateOrSignIn: [],
      errors: []
    };

    let processed = 0;
    // We can run them in chunks of 10 to be fast but respectful
    const chunkSize = 10;
    for (let i = 0; i < result.rows.length; i += chunkSize) {
      const chunk = result.rows.slice(i, i + chunkSize);
      const promises = chunk.map(async (row) => {
        const { id, trainee_name, screening_test } = row;
        const res = await getPageTitle(screening_test);
        processed++;
        
        if (processed % 20 === 0 || processed === result.rows.length) {
          console.log(`Progress: ${processed}/${result.rows.length} checked...`);
        }

        if (res.error) {
          report.errors.push({ id, name: trainee_name, url: screening_test, error: res.error });
        } else if (!res.title) {
          report.errors.push({ id, name: trainee_name, url: screening_test, error: 'Empty Title' });
        } else {
          const titleLower = res.title.toLowerCase();
          // Check if it's a login / sign-in screen (indicating a private file)
          const isSignIn = titleLower.includes('sign-in') || titleLower.includes('login') || titleLower.includes('google accounts') || titleLower.includes('masuk');
          
          if (isSignIn) {
            report.privateOrSignIn.push({ id, name: trainee_name, url: screening_test, title: res.title });
          } else if (isMatching(trainee_name, res.title)) {
            report.matches.push({ id, name: trainee_name, url: screening_test, title: res.title });
          } else {
            report.mismatches.push({ id, name: trainee_name, url: screening_test, title: res.title });
          }
        }
      });

      await Promise.all(promises);
      // Brief sleep between chunks
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n=======================================');
    console.log('            SCAN COMPLETE              ');
    console.log('=======================================');
    console.log(`Total Checked:      ${result.rows.length}`);
    console.log(`Matches:            ${report.matches.length}`);
    console.log(`Mismatches:         ${report.mismatches.length}`);
    console.log(`Private / Sign-in:  ${report.privateOrSignIn.length}`);
    console.log(`Errors / Timeouts:  ${report.errors.length}`);
    console.log('=======================================\n');

    if (report.mismatches.length > 0) {
      console.log('--- SAMPLE OF MISMATCHED RECORDS ---');
      console.log(JSON.stringify(report.mismatches.slice(0, 30), null, 2));
    }

    if (report.privateOrSignIn.length > 0) {
      console.log('\n--- SAMPLE OF PRIVATE/SIGN-IN RECORDS ---');
      console.log(JSON.stringify(report.privateOrSignIn.slice(0, 10), null, 2));
    }

    if (report.errors.length > 0) {
      console.log('\n--- SAMPLE OF ERROR/TIMEOUT RECORDS ---');
      console.log(JSON.stringify(report.errors.slice(0, 10), null, 2));
    }

    // Write full scan report to file for auditing
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(
      path.join(__dirname, 'screening_test_scan_report.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );
    console.log(`\nDetailed report written to scratch/screening_test_scan_report.json`);

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
