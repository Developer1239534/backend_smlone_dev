const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const strictPath = path.join(__dirname, 'matching_results_strict.json');

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

function cleanString(str) {
  return str.toLowerCase()
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
}

async function main() {
  try {
    if (!fs.existsSync(strictPath)) {
      console.error('strict matching results not found');
      process.exit(1);
    }

    const { matches, ambiguousMatches, unmatchedUrls } = JSON.parse(fs.readFileSync(strictPath, 'utf8'));
    console.log(`Loaded ${ambiguousMatches.length} ambiguous matches.`);

    const resolved = [];
    const remainingAmbiguous = [];

    for (const item of ambiguousMatches) {
      const cleanTitle = cleanString(item.title);
      const titleWords = cleanTitle.split(/\s+/).filter(w => w.length > 2);

      const candidateScores = [];

      for (const candidate of item.candidates) {
        const cleanName = cleanString(candidate.name);
        const nameWords = cleanName.split(/\s+/).filter(w => w.length > 2);

        // Calculate score
        let exactWordsMatched = 0;
        let fuzzyWordsMatched = 0;

        for (const word of nameWords) {
          if (cleanTitle.includes(word)) {
            exactWordsMatched++;
          } else {
            for (const tWord of titleWords) {
              if (levenshtein(word, tWord) <= 1) {
                fuzzyWordsMatched++;
                break;
              }
            }
          }
        }

        const totalMatched = exactWordsMatched + fuzzyWordsMatched;
        // Penality for unmatched words of the trainee name
        const unmatchedTraineeWords = Math.max(0, nameWords.length - totalMatched);

        // Exact match score boost
        const isExactNameIncluded = cleanTitle.includes(cleanName);

        const finalScore = (totalMatched * 10) + (isExactNameIncluded ? 50 : 0) - (unmatchedTraineeWords * 5);
        candidateScores.push({ candidate, score: finalScore, isExactNameIncluded, totalMatched, nameWordsCount: nameWords.length });
      }

      // Sort candidates by score descending
      candidateScores.sort((a, b) => b.score - a.score);

      // If the top candidate has a significantly higher score than the runner-up (difference >= 15)
      const top = candidateScores[0];
      const runnerUp = candidateScores[1];

      if (top.score - runnerUp.score >= 10) {
        resolved.push({
          traineeId: top.candidate.id,
          traineeName: top.candidate.name,
          url: item.url,
          title: item.title,
          reason: `Score difference: ${top.score} vs ${runnerUp.score} (Exact included: ${top.isExactNameIncluded})`
        });
      } else {
        remainingAmbiguous.push({
          url: item.url,
          title: item.title,
          candidates: candidateScores.map(c => ({ id: c.candidate.id, name: c.candidate.name, score: c.score }))
        });
      }
    }

    console.log(`\nResolved ${resolved.length} of ${ambiguousMatches.length} ambiguous matches.`);
    console.log(`Remaining ambiguous: ${remainingAmbiguous.length}`);

    // Update resolved in DB
    if (resolved.length > 0) {
      console.log('\nUpdating resolved ambiguous matches in DB...');
      for (const item of resolved) {
        await db.query('UPDATE dashboard_trainne SET screening_test = $1 WHERE id = $2', [item.url, item.traineeId]);
      }
      console.log(`Successfully updated ${resolved.length} resolved records in DB.`);
    }

    // Save final report
    fs.writeFileSync(
      path.join(__dirname, 'resolved_ambiguities_report.json'),
      JSON.stringify({ resolved, remainingAmbiguous }, null, 2),
      'utf8'
    );

    console.log('\n=== SAMPLE RESOLVED ===');
    console.log(resolved.slice(0, 10));

    if (remainingAmbiguous.length > 0) {
      console.log('\n=== REMAINING AMBIGUOUS ===');
      console.log(remainingAmbiguous.slice(0, 10));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
