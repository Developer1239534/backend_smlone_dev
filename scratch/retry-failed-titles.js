const fs = require('fs');
const path = require('path');
const https = require('https');
const urlModule = require('url');
const db = require('../src/db/neonClient');

const cachePath = path.join(__dirname, 'screening_titles_cache.json');
const rawUrlsPath = path.join(__dirname, 'raw_urls.json');

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

// Strict Matching logic
function getMatchesForTitle(title, trainees) {
  const cleanTitle = title.toLowerCase()
    .replace(/- google drive/gi, '')
    .replace(/- google dokumen/gi, '')
    .replace(/- google docs/gi, '')
    .replace(/pre\s*-\s*test/gi, '')
    .replace(/pretest/gi, '')
    .replace(/hasil/gi, '')
    .replace(/disc/gi, '')
    .replace(/screening/gi, '')
    .replace(/test/gi, '')
    .replace(/result/gi, '')
    .replace(/\.pdf/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

  const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 2);
  const candidates = [];

  for (const trainee of trainees) {
    const cleanName = trainee.trainee_name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();

    if (cleanTitle.includes(cleanName) || cleanName.includes(cleanTitle)) {
      candidates.push({ trainee, score: 100 });
      continue;
    }

    const nameWords = cleanName.split(/\s+/).filter(w => w.length > 2);
    if (nameWords.length === 0) continue;

    let matchCount = 0;
    let matchedWords = [];
    for (const word of nameWords) {
      if (cleanTitle.includes(word)) {
        matchCount++;
        matchedWords.push(word);
      } else {
        for (const tWord of titleWords) {
          if (levenshtein(word, tWord) <= 1) {
            matchCount++;
            matchedWords.push(word);
            break;
          }
        }
      }
    }

    let isMatched = false;
    if (nameWords.length === 1 && matchCount === 1) {
      isMatched = true;
    } else if (nameWords.length === 2 && matchCount === 2) {
      isMatched = true;
    } else if (nameWords.length >= 3 && matchCount >= 2) {
      const genericWords = ['muhammad', 'ahmad', 'putra', 'putri', 'binti', 'bin', 'van', 'der', 'von', 'the', 'and', 'sitorus', 'sinaga', 'ginting', 'lubis', 'siregar', 'harahap'];
      const nonGenericMatches = matchedWords.filter(w => !genericWords.includes(w));
      if (nonGenericMatches.length >= 1) {
        isMatched = true;
      } else if (matchCount >= 3) {
        isMatched = true;
      }
    }

    if (isMatched) {
      candidates.push({ trainee, score: matchCount });
    }
  }

  return candidates;
}

// Fetch helper
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
        timeout: 10000 // 10 seconds
      };

      const req = https.get(options, (res) => {
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
          if (data.includes('</title>') || data.includes('Sorry, the file you have requested does not exist') || data.length > 60000) {
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

      req.on('error', (err) => resolve({ title: null, error: err.message, finalUrl: targetUrl }));
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
    if (!fs.existsSync(cachePath)) {
      console.error('Cache file not found.');
      process.exit(1);
    }
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

    const failedUrls = [];
    for (const [url, item] of Object.entries(cache)) {
      if (item.error) {
        failedUrls.push(url);
      }
    }

    console.log(`Found ${failedUrls.length} failed/rate-limited URLs in cache.`);

    // Re-fetch one by one with 1.2 second delay
    for (let i = 0; i < failedUrls.length; i++) {
      const url = failedUrls[i];
      console.log(`[${i + 1}/${failedUrls.length}] Re-fetching: ${url}`);
      
      const res = await getPageTitle(url);
      if (res.title) {
        console.log(`  Success: "${res.title}"`);
        cache[url] = { title: res.title, finalUrl: res.finalUrl };
      } else {
        console.log(`  Failed again: ${res.error}`);
        cache[url] = { error: res.error, finalUrl: res.finalUrl };
      }
      
      // Save cache progress
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
      await new Promise(r => setTimeout(r, 1200));
    }

    console.log('\nAll failed URLs re-fetched. Re-running strict matching...');

    // Run strict matching again
    const urls = JSON.parse(fs.readFileSync(rawUrlsPath, 'utf8'));
    const uniqueUrls = [...new Set(urls)];

    const traineesResult = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne ORDER BY id ASC');
    const trainees = traineesResult.rows;

    const matches = [];
    const ambiguousMatches = [];
    const unmatchedUrls = [];
    const matchedTraineeIds = new Set();

    for (const url of uniqueUrls) {
      const cacheItem = cache[url];
      if (!cacheItem || cacheItem.error) {
        unmatchedUrls.push({ url, reason: cacheItem ? cacheItem.error : 'Not fetched' });
        continue;
      }

      const title = cacheItem.title;
      const isSignIn = title.toLowerCase().includes('sign-in') || 
                        title.toLowerCase().includes('login') || 
                        title.toLowerCase().includes('google accounts') || 
                        title.toLowerCase().includes('masuk');

      if (isSignIn) {
        unmatchedUrls.push({ url, reason: `Private/Sign-in: "${title}"` });
        continue;
      }

      const candidates = getMatchesForTitle(title, trainees);

      if (candidates.length === 1) {
        const bestCandidate = candidates[0].trainee;
        if (!matchedTraineeIds.has(bestCandidate.id)) {
          matches.push({
            traineeId: bestCandidate.id,
            traineeName: bestCandidate.trainee_name,
            url,
            title
          });
          matchedTraineeIds.add(bestCandidate.id);
        } else {
          unmatchedUrls.push({ url, reason: `Trainee ${bestCandidate.trainee_name} (ID: ${bestCandidate.id}) already matched.` });
        }
      } else if (candidates.length > 1) {
        ambiguousMatches.push({
          url,
          title,
          candidates: candidates.map(c => ({ id: c.trainee.id, name: c.trainee.trainee_name }))
        });
      } else {
        unmatchedUrls.push({ url, reason: `No candidate match for: "${title}"` });
      }
    }

    // Special override check for Stephanie Evelyn Luo (ID: 1129)
    const stephanieUrl = uniqueUrls.find(url => {
      const entry = cache[url];
      return entry && entry.title && entry.title.toLowerCase().includes('stephanie evelyn luo');
    });

    if (stephanieUrl) {
      console.log(`Stephanie Evelyn Luo URL: ${stephanieUrl}`);
      const idx = matches.findIndex(m => m.traineeId === '1129');
      if (idx !== -1) {
        matches[idx].url = stephanieUrl;
        matches[idx].title = cache[stephanieUrl].title;
      } else {
        matches.push({
          traineeId: '1129',
          traineeName: 'Stephanie Evelyn Luo',
          url: stephanieUrl,
          title: cache[stephanieUrl].title
        });
      }
      matchedTraineeIds.add('1129');
    }

    console.log(`\n=== STRICT MATCHING SUMMARY AFTER RETRY ===`);
    console.log(`Unique Matches Found: ${matches.length}`);
    console.log(`Ambiguous Matches:    ${ambiguousMatches.length}`);
    console.log(`Unmatched URLs:       ${unmatchedUrls.length}`);

    // Update DB with strict matches
    console.log('\nUpdating database records...');
    let updateCount = 0;
    for (const match of matches) {
      await db.query(
        'UPDATE dashboard_trainne SET screening_test = $1 WHERE id = $2',
        [match.url, match.traineeId]
      );
      updateCount++;
    }
    console.log(`Successfully updated ${updateCount} records in database.`);

    // Write audit files
    fs.writeFileSync(
      path.join(__dirname, 'matching_results_strict.json'),
      JSON.stringify({ matches, ambiguousMatches, unmatchedUrls }, null, 2),
      'utf8'
    );

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
