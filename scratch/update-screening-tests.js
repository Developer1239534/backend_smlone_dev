const db = require('../src/db/neonClient');
const https = require('https');
const urlModule = require('url');

// Levenshtein distance helper
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Check if two strings correspond (name matching check)
function isMatching(traineeName, docTitle) {
  if (!docTitle) return false;
  
  const cleanTitle = docTitle.toLowerCase().replace(/- google drive/gi, '').replace(/pre\s*-\s*test/gi, '').replace(/pretest/gi, '').trim();
  const cleanName = traineeName.toLowerCase().trim();

  // 1. Direct contains check
  if (cleanTitle.includes(cleanName) || cleanName.includes(cleanTitle)) {
    return true;
  }

  const nameWords = cleanName.split(/\s+/).filter(w => w.length > 2);
  const titleWords = cleanTitle.split(/[^a-zA-Z0-9]+/).filter(w => w.length > 2);

  if (nameWords.length === 0) return false;

  // Let's count how many words from cleanName are present in cleanTitle.
  let matchCount = 0;
  for (const word of nameWords) {
    if (cleanTitle.includes(word)) {
      matchCount++;
    } else {
      for (const tWord of titleWords) {
        if (levenshtein(word, tWord) <= 1) {
          matchCount++;
          break;
        }
      }
    }
  }

  // If at least one word matches and it's the first name
  const firstWord = nameWords[0];
  const firstWordMatch = cleanTitle.includes(firstWord) || titleWords.some(tw => levenshtein(firstWord, tw) <= 1);
  if (matchCount >= 1 && firstWordMatch) {
    return true;
  }

  return matchCount >= 2;
}

// Helper to fetch page title following redirects
function getPageTitle(targetUrl, maxRedirects = 5) {
  return new Promise((resolve) => {
    if (maxRedirects <= 0) {
      return resolve({ title: null, error: 'Too many redirects', finalUrl: targetUrl });
    }

    try {
      if (!targetUrl || !targetUrl.startsWith('http')) {
        return resolve({ title: null, error: 'Invalid URL format', finalUrl: targetUrl });
      }

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
          if (data.includes('</title>')) {
            req.destroy();
          }
        });

        res.on('close', () => {
          const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch) {
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

async function main() {
  try {
    console.log('Fetching screening_test records...');
    const result = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE screening_test IS NOT NULL ORDER BY id ASC');
    console.log(`Loaded ${result.rows.length} records.`);

    let clearedCount = 0;
    let checkedCount = 0;

    // Process in chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < result.rows.length; i += chunkSize) {
      const chunk = result.rows.slice(i, i + chunkSize);
      const promises = chunk.map(async (row) => {
        const { id, trainee_name, screening_test } = row;
        checkedCount++;

        const res = await getPageTitle(screening_test);

        let isCorrect = false;
        let reason = '';

        if (res.error) {
          // If it is not a valid URL format, null it out.
          if (res.error === 'Invalid URL format') {
            isCorrect = false;
            reason = 'Invalid URL';
          } else {
            // Keep other network errors/timeouts as they are for safety (could be temporary network issues)
            isCorrect = true;
          }
        } else if (res.title) {
          const titleLower = res.title.toLowerCase();
          const isSignIn = titleLower.includes('sign-in') || titleLower.includes('login') || titleLower.includes('google accounts') || titleLower.includes('masuk');
          
          if (isSignIn) {
            // If it is a private / login page, keep it as-is (we cannot verify, so we assume it was correct)
            isCorrect = true;
          } else if (isMatching(trainee_name, res.title)) {
            isCorrect = true;
          } else {
            isCorrect = false;
            reason = `Mismatch: "${res.title}"`;
          }
        } else {
          isCorrect = false;
          reason = 'Empty title';
        }

        if (!isCorrect) {
          console.log(`Setting NULL for ID ${id} (${trainee_name}) -> Reason: ${reason}`);
          await db.query('UPDATE dashboard_trainne SET screening_test = NULL WHERE id = $1', [id]);
          clearedCount++;
        }
      });

      await Promise.all(promises);
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n=======================================');
    console.log('         CLEANUP PROCESS COMPLETE      ');
    console.log('=======================================');
    console.log(`Total Checked:         ${checkedCount}`);
    console.log(`Set to NULL (Cleared): ${clearedCount}`);
    console.log('=======================================');

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
