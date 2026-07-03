const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';

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
function getMatchesForName(name, trainees) {
  const cleanInputName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

  const titleWords = cleanInputName.split(/\s+/).filter(w => w.length > 2);
  const candidates = [];

  for (const trainee of trainees) {
    const cleanTraineeName = trainee.trainee_name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();

    // 1. Direct contains check
    if (cleanInputName.includes(cleanTraineeName) || cleanTraineeName.includes(cleanInputName)) {
      candidates.push({ trainee, score: 100 });
      continue;
    }

    const nameWords = cleanTraineeName.split(/\s+/).filter(w => w.length > 2);
    if (nameWords.length === 0) continue;

    let matchCount = 0;
    let matchedWords = [];
    for (const word of nameWords) {
      if (cleanInputName.includes(word)) {
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

    // Strict requirements
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

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

async function main() {
  try {
    if (!fs.existsSync(transcriptPath)) {
      console.error('Transcript not found.');
      process.exit(1);
    }

    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.trim().split('\n');
    
    let latestUserInput = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj.type === 'USER_INPUT') {
          if (obj.content.includes('Real Stage 47') && obj.content.includes('https://drive.google.com')) {
            latestUserInput = obj.content;
            break;
          }
        }
      } catch (e) {}
    }

    if (!latestUserInput) {
      console.error('Latest user input with link table not found in transcript.');
      process.exit(1);
    }

    // Parse the input lines
    const parsedRows = [];
    const inputLines = latestUserInput.split('\n');
    for (const line of inputLines) {
      const parts = line.trim().split(/\t/); // Tab-separated or fallback
      let name, period, url;
      if (parts.length >= 3) {
        name = parts[0].trim();
        period = parts[1].trim();
        url = parts[2].trim();
      } else {
        // Fallback space separated but only if last word is a URL
        const words = line.trim().split(/\s+/);
        if (words.length >= 3 && words[words.length - 1].startsWith('http')) {
          url = words[words.length - 1];
          period = words.slice(words.length - 3, words.length - 1).join(' '); // usually "Real Stage 47"
          name = words.slice(0, words.length - 3).join(' ');
        }
      }

      if (name && name !== 'ID' && name !== 'Periode' && name !== 'Data Baru' && url && url.startsWith('http')) {
        parsedRows.push({ name, period, url });
      }
    }

    console.log(`Parsed ${parsedRows.length} rows to update.`);
    if (parsedRows.length === 0) {
      console.log('No rows parsed. Please check format.');
      process.exit(1);
    }

    // Query trainees
    const traineesResult = await db.query('SELECT id, trainee_name FROM dashboard_trainne ORDER BY id ASC');
    const trainees = traineesResult.rows;
    console.log(`Loaded ${trainees.length} trainees from database.`);

    let insertCount = 0;
    let updateCount = 0;
    let unmatchedCount = 0;

    const report = {
      inserted: [],
      updated: [],
      unmatched: []
    };

    for (const row of parsedRows) {
      const candidates = getMatchesForName(row.name, trainees);

      if (candidates.length > 0) {
        const trainee = candidates[0].trainee;
        
        // Check if real_stage entry already exists for this trainee and period
        const existRes = await db.query(
          'SELECT id FROM real_stage WHERE trainee_id = $1 AND periode = $2',
          [trainee.id, row.period]
        );

        if (existRes.rows.length > 0) {
          // Update
          await db.query(
            'UPDATE real_stage SET url = $1 WHERE trainee_id = $2 AND periode = $3',
            [row.url, trainee.id, row.period]
          );
          updateCount++;
          report.updated.push({ name: row.name, matchedTrainee: trainee.trainee_name, id: trainee.id, url: row.url });
        } else {
          // Insert
          await db.query(
            'INSERT INTO real_stage (trainee_id, periode, url) VALUES ($1, $2, $3)',
            [trainee.id, row.period, row.url]
          );
          insertCount++;
          report.inserted.push({ name: row.name, matchedTrainee: trainee.trainee_name, id: trainee.id, url: row.url });
        }
      } else {
        unmatchedCount++;
        report.unmatched.push({ name: row.name, url: row.url });
      }
    }

    console.log('\n=== REAL STAGE 47 UPDATE COMPLETE ===');
    console.log(`Inserted:  ${insertCount}`);
    console.log(`Updated:   ${updateCount}`);
    console.log(`Unmatched: ${unmatchedCount}`);

    if (report.unmatched.length > 0) {
      console.log('\n=== UNMATCHED ENTRIES ===');
      console.log(report.unmatched);
    }

    // Save report file
    fs.writeFileSync(
      path.join(__dirname, 'real_stage_47_sync_report.json'),
      JSON.stringify(report, null, 2),
      'utf8'
    );

    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
