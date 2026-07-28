const fs = require('fs');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('./src/db/neonClient');

async function main() {
  const fullTranscriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\135cf0c9-3c8b-440c-ab9e-a5fde03f6157\\.system_generated\\logs\\transcript_full.jsonl';

  if (!fs.existsSync(fullTranscriptPath)) {
    console.error('Full transcript file not found at:', fullTranscriptPath);
    process.exit(1);
  }

  console.log('📖 Reading full transcript for ID list and classification rules...');

  const fileStream = fs.createReadStream(fullTranscriptPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lastUserText = '';

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        lastUserText = obj.content;
      }
    } catch (e) {}
  }

  console.log('📊 Got FULL user text length:', lastUserText.length);

  const lines = lastUserText.split(/\r?\n/);
  const uniqueIds = new Set();

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (/^[a-zA-Z0-9]+$/.test(line) &&
        line.toUpperCase() !== 'ID' &&
        !line.toLowerCase().includes('masukin') &&
        !line.toLowerCase().includes('portal') &&
        !line.toLowerCase().includes('login') &&
        !line.toLowerCase().includes('password') &&
        !line.toLowerCase().includes('angka') &&
        !line.toLowerCase().includes('depan') &&
        !line.toLowerCase().includes('branch') &&
        !line.toLowerCase().includes('tritura') &&
        !line.toLowerCase().includes('cemara') &&
        !line.toLowerCase().includes('nominal') &&
        !line.toLowerCase().includes('sampai')) {
      uniqueIds.add(line);
    }
  }

  console.log(`🚀 Total UNIQUE trainee IDs parsed from prompt: ${uniqueIds.size}`);

  const trituraGroup = [];
  const cemaraGroup = [];
  const cpGroup = [];
  const otherGroup = [];

  for (const id of uniqueIds) {
    const num = parseInt(id, 10);

    if (id.startsWith('7')) {
      trituraGroup.push(id);
    } else if (id.startsWith('9') && id.length > 4) {
      cemaraGroup.push(id);
    } else if (!isNaN(num) && num >= 1 && num <= 1000) {
      cpGroup.push(id);
    } else if (id.startsWith('9')) {
      cemaraGroup.push(id);
    } else {
      otherGroup.push(id);
    }
  }

  console.log(`📊 Classification Results:`);
  console.log(`   - Tritura (IDs starting with 7): ${trituraGroup.length}`);
  console.log(`   - Cemara (IDs starting with 9):  ${cemaraGroup.length}`);
  console.log(`   - CP (IDs 1 to 1000):            ${cpGroup.length}`);
  console.log(`   - Other IDs:                      ${otherGroup.length}`);

  // Combine all items with their assigned branch_id
  const itemsToInsert = [
    ...trituraGroup.map(id => ({ id, branch: 'tritura' })),
    ...cemaraGroup.map(id => ({ id, branch: 'cemara' })),
    ...cpGroup.map(id => ({ id, branch: 'cp' })),
    ...otherGroup.map(id => ({ id, branch: 'cp' }))
  ];

  console.log(`💾 Inserting ${itemsToInsert.length} total trainees into DB...`);

  let portalInserted = 0;
  let loginInserted = 0;

  for (const item of itemsToInsert) {
    const plainPassword = `SML${item.id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert portal_trainee
    await db.query(`
      INSERT INTO portal_trainee (trainee_id, branch_id, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (trainee_id) DO UPDATE
      SET branch_id = EXCLUDED.branch_id,
          updated_at = NOW();
    `, [item.id, item.branch]);
    portalInserted++;

    // Insert login_trainee
    await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (student_id) DO UPDATE
      SET password = EXCLUDED.password,
          plain_password = EXCLUDED.plain_password,
          updated_at = NOW();
    `, [item.id, hashedPassword, plainPassword]);
    loginInserted++;
  }

  console.log('--- Final Summary ---');
  console.log(`✅ portal_trainee inserted/updated: ${portalInserted}`);
  console.log(`✅ login_trainee inserted/updated:  ${loginInserted}`);

  const branchStats = await db.query('SELECT branch_id, COUNT(*) FROM portal_trainee GROUP BY branch_id ORDER BY COUNT(*) DESC;');
  console.log('--- Branch Distribution in Database ---');
  console.table(branchStats.rows);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
