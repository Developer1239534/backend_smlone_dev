const fs = require('fs');
const path = require('path');

const strictPath = path.join(__dirname, 'matching_results_strict.json');
const cachePath = path.join(__dirname, 'screening_titles_cache.json');

function main() {
  const { unmatchedUrls } = JSON.parse(fs.readFileSync(strictPath, 'utf8'));
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  console.log('=== UNMATCHED URLs AND THEIR TITLES ===');
  unmatchedUrls.forEach((item, index) => {
    const cached = cache[item.url] || {};
    console.log(`${index + 1}. Title: "${cached.title || 'Error/Private'}" | Reason: ${item.reason} | URL: ${item.url}`);
  });
}

main();
