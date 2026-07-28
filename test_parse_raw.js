const fs = require('fs');
const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

// Save raw text to file first for reliable parsing
const rawText = fs.readFileSync(__dirname + '/raw_trainee_input.txt', 'utf8');

function parseDateStr(str) {
  if (!str) return null;
  const cleaned = str.trim();
  if (!cleaned || cleaned === '-' || cleaned.toLowerCase() === 'null') return null;
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function getBranch(id, cabangId) {
  if (id.startsWith('7') && id.length > 4) return 'tritura';
  if (id.startsWith('9') && id.length > 4) return 'cemara';
  const num = parseInt(id, 10);
  if (!isNaN(num) && num >= 1 && num <= 1500) return 'cp';
  if (cabangId) {
    const c = cabangId.toLowerCase();
    if (c.includes('tritura')) return 'tritura';
    if (c.includes('cemara')) return 'cemara';
    if (c.includes('timor') || c.includes('cp')) return 'cp';
  }
  return 'cp';
}

async function main() {
  const lines = rawText.split(/\r?\n/);
  console.log(`Total raw lines: ${lines.length}`);

  // Let's parse records by checking lines that start with an ID (digits)
  const records = [];
  let currentTokens = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line starts with ID or tab-separated ID
    const tokens = line.split('\t').map(t => t.trim()).filter(Boolean);
    currentTokens.push(...tokens);
  }

  console.log(`Total tokens collected: ${currentTokens.length}`);
}

main().catch(console.error);
