const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

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

// Name matching check
function isMatching(traineeName, docTitle) {
  if (!docTitle) return false;
  
  const cleanTitle = docTitle.toLowerCase()
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

  const cleanName = traineeName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

  // 1. Direct contains check
  if (cleanTitle.includes(cleanName) || cleanName.includes(cleanTitle)) {
    return true;
  }

  const nameWords = cleanName.split(/\s+/).filter(w => w.length > 2);
  const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 2);

  if (nameWords.length === 0) return false;

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

  const firstWord = nameWords[0];
  const firstWordMatch = cleanTitle.includes(firstWord) || titleWords.some(tw => levenshtein(firstWord, tw) <= 1);
  if (matchCount >= 1 && firstWordMatch) {
    return true;
  }

  return matchCount >= 2;
}

async function main() {
  try {
    if (!fs.existsSync(cachePath)) {
      console.error('Cache not found.');
      process.exit(1);
    }
    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

    const res = await db.query('SELECT id, trainee_name, screening_test FROM dashboard_trainne WHERE screening_test IS NOT NULL ORDER BY id ASC');
    const trainees = res.rows;
    console.log(`Checking ${trainees.length} database entries...`);

    const mismatches = [];
    const missingCache = [];
    const matches = [];

    for (const trainee of trainees) {
      const url = trainee.screening_test;
      const cacheItem = cache[url];

      if (!cacheItem) {
        missingCache.push(trainee);
        continue;
      }

      if (cacheItem.error) {
        missingCache.push({ ...trainee, error: cacheItem.error });
        continue;
      }

      const title = cacheItem.title;
      // Skip check if it is private/sign-in
      const isSignIn = title.toLowerCase().includes('sign-in') || 
                        title.toLowerCase().includes('login') || 
                        title.toLowerCase().includes('google accounts') || 
                        title.toLowerCase().includes('masuk');

      if (isSignIn) {
        matches.push({ ...trainee, title, type: 'Private' });
        continue;
      }

      if (isMatching(trainee.trainee_name, title)) {
        matches.push({ ...trainee, title, type: 'Match' });
      } else {
        mismatches.push({ ...trainee, title });
      }
    }

    console.log('\n=== FINAL VERIFICATION SUMMARY ===');
    console.log(`Total Checked:       ${trainees.length}`);
    console.log(`Valid Matches:       ${matches.length}`);
    console.log(`Mismatches:          ${mismatches.length}`);
    console.log(`Could not verify:    ${missingCache.length}`);

    if (mismatches.length > 0) {
      console.log('\n=== MISMATCHED ENTRIES ===');
      mismatches.forEach(m => {
        console.log(`ID: ${m.id} | Trainee Name: "${m.trainee_name}" | Link Title: "${m.title}" | URL: ${m.screening_test}`);
      });
    }

    if (missingCache.length > 0) {
      console.log('\n=== COULD NOT VERIFY (Missing Cache/Error) ===');
      missingCache.slice(0, 10).forEach(m => {
        console.log(`ID: ${m.id} | Name: "${m.trainee_name}" | Error: ${m.error || 'No cache entry'} | URL: ${m.screening_test}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
