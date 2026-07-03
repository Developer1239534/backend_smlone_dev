const fs = require('fs');
const path = require('path');
const https = require('https');
const urlModule = require('url');
const db = require('../src/db/neonClient');

const rawUrlsPath = path.join(__dirname, 'raw_urls.json');
const cachePath = path.join(__dirname, 'screening_titles_cache.json');

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

    // 1. Direct contains check (if the whole name or title is fully contained)
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

    // Strict requirements:
    // If trainee name has 1 word: must match that word
    // If trainee name has 2 words: both words must match
    // If trainee name has 3+ words: at least 2 words must match
    let isMatched = false;
    if (nameWords.length === 1 && matchCount === 1) {
      isMatched = true;
    } else if (nameWords.length === 2 && matchCount === 2) {
      isMatched = true;
    } else if (nameWords.length >= 3 && matchCount >= 2) {
      // Avoid matching if matched words are only generic words (like Muhammad, Lubis, etc.)
      const genericWords = ['muhammad', 'ahmad', 'putra', 'putri', 'binti', 'bin', 'van', 'der', 'von', 'the', 'and', 'sitorus', 'sinaga', 'ginting', 'lubis', 'siregar', 'harahap'];
      const nonGenericMatches = matchedWords.filter(w => !genericWords.includes(w));
      
      // If we only matched generic words, we need more matches
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

async function main() {
  try {
    // 1. Load URLs
    if (!fs.existsSync(rawUrlsPath)) {
      console.error('raw_urls.json not found.');
      process.exit(1);
    }
    const urls = JSON.parse(fs.readFileSync(rawUrlsPath, 'utf8'));
    const uniqueUrls = [...new Set(urls)];
    console.log(`Loaded ${uniqueUrls.length} unique URLs to match.`);

    // 2. Load Cache
    if (!fs.existsSync(cachePath)) {
      console.error('Cache not found. Run sync-screening-tests.js once first.');
      process.exit(1);
    }
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

    // 3. Query all trainees from DB
    const traineesResult = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne ORDER BY id ASC');
    const trainees = traineesResult.rows;
    console.log(`Loaded ${trainees.length} trainees from database.`);

    const matches = []; // { traineeId, traineeName, url, title }
    const ambiguousMatches = []; // { url, title, candidates }
    const unmatchedUrls = [];
    
    // We keep track of which trainee IDs have been matched to avoid double-matching
    const matchedTraineeIds = new Set();

    for (const url of uniqueUrls) {
      const cacheItem = cache[url];
      if (!cacheItem || cacheItem.error) {
        unmatchedUrls.push({ url, reason: cacheItem ? cacheItem.error : 'Not fetched' });
        continue;
      }

      const title = cacheItem.title;
      // Skip if it is a sign-in or login screen
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
          unmatchedUrls.push({ url, reason: `Trainee ${bestCandidate.trainee_name} (ID: ${bestCandidate.id}) already matched to another link.` });
        }
      } else if (candidates.length > 1) {
        ambiguousMatches.push({
          url,
          title,
          candidates: candidates.map(c => ({ id: c.trainee.id, name: c.trainee.trainee_name }))
        });
      } else {
        unmatchedUrls.push({ url, reason: `No candidate match for title: "${title}"` });
      }
    }

    // Special override check for Stephanie Evelyn Luo (ID: 1129)
    const stephanieUrl = uniqueUrls.find(url => {
      const entry = cache[url];
      return entry && entry.title && entry.title.toLowerCase().includes('stephanie evelyn luo');
    });

    if (stephanieUrl) {
      console.log(`Stephanie Evelyn Luo URL: ${stephanieUrl}`);
      // Remove any other match for Stephanie
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

    console.log(`\n=== STRICT MATCHING SUMMARY ===`);
    console.log(`Unique Matches Found: ${matches.length}`);
    console.log(`Ambiguous Matches:    ${ambiguousMatches.length}`);
    console.log(`Unmatched URLs:       ${unmatchedUrls.length}`);

    if (ambiguousMatches.length > 0) {
      console.log('\n--- SAMPLE AMBIGUOUS MATCHES ---');
      console.log(JSON.stringify(ambiguousMatches.slice(0, 10), null, 2));
    }

    // Save strict matching results for audit
    fs.writeFileSync(
      path.join(__dirname, 'matching_results_strict.json'),
      JSON.stringify({ matches, ambiguousMatches, unmatchedUrls }, null, 2),
      'utf8'
    );

    // 6. Database updates
    console.log('\nUpdating database records with STRICT matches...');
    let updateCount = 0;
    for (const match of matches) {
      await db.query(
        'UPDATE dashboard_trainne SET screening_test = $1 WHERE id = $2',
        [match.url, match.traineeId]
      );
      updateCount++;
    }

    console.log(`Successfully updated ${updateCount} records in dashboard_trainne.`);

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
