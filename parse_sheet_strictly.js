const fs = require('fs');
const { pool } = require('./src/db/neonClient');

const content = fs.readFileSync('./insert_official_sheet_data.js', 'utf8');
const startIdx = content.indexOf('const rawTsv = `') + 'const rawTsv = `'.length;
const endIdx = content.indexOf('`;', startIdx);
const rawTsv = content.substring(startIdx, endIdx);

const lines = rawTsv.trim().split('\n');
const validTraineesMap = new Map();

for (const line of lines) {
  const parts = line.split('\t');
  for (let i = 0; i < parts.length; i++) {
    const val = parts[i].trim();
    // Check if val is an ID (numeric digits)
    if (/^\d{3,9}$/.test(val)) {
      const potentialName = (parts[i+1] || '').trim();
      const potentialStatus = (parts[i+2] || '').trim();
      
      // A valid trainee row MUST have a valid person name and a status starting with 'Active' or 'Expired'
      if (potentialName && 
          potentialName !== 'Nama Trainee' && 
          potentialName !== 'Junior' && 
          potentialName !== 'Youth' && 
          (potentialStatus.startsWith('Active') || potentialStatus.startsWith('Expired'))) {
        
        const id = val;
        const name = potentialName;
        const status = potentialStatus;
        const level = (parts[i+3] || '').trim();
        const house = (parts[i+4] || '').trim();
        const className = (parts[i+5] || '').trim();
        const branch = (parts[i+6] || '').trim();
        const totalGold = parseInt((parts[i+7] || '').trim()) || 0;
        const kategori = (parts[i+8] || '').trim();
        const rank = parseInt((parts[i+9] || '').trim()) || 0;

        // Verify valid branch and kategori
        if (['TIMOR', 'TRITURA', 'CEMARA'].includes(branch) && ['Junior', 'Youth', 'YOUTH'].includes(kategori)) {
          validTraineesMap.set(id, {
            id,
            nama_trainee: name,
            status,
            level,
            house,
            class: className,
            branch,
            total_gold_periode: totalGold,
            gp_month: totalGold,
            kategori: kategori === 'YOUTH' ? 'Youth' : kategori,
            rank
          });
        }
      }
    }
  }
}

console.log('Total Strictly Parsed Valid Trainees:', validTraineesMap.size);

async function runCleanImport() {
  await pool.query('TRUNCATE TABLE goldpoint_trainee;');
  console.log('Cleared table goldpoint_trainee.');

  for (const [id, t] of validTraineesMap) {
    await pool.query(`
      INSERT INTO goldpoint_trainee 
        (id, nama_trainee, status, level, house, class, branch, total_gold_periode, gp_month, kategori, rank, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `, [t.id, t.nama_trainee, t.status, t.level, t.house, t.class, t.branch, t.total_gold_periode, t.gp_month, t.kategori, t.rank]);
  }

  // Recalculate ranks per branch & category so 100% ranks match sheet with 0 zero ranks
  await pool.query(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY kategori, branch 
        ORDER BY total_gold_periode DESC, nama_trainee ASC
      ) AS calculated_rank
      FROM goldpoint_trainee
    )
    UPDATE goldpoint_trainee g
    SET rank = r.calculated_rank
    FROM ranked r
    WHERE g.id = r.id;
  `);

  const rows = await pool.query('SELECT id, nama_trainee, status, level, house, class, branch, total_gold_periode, kategori, rank FROM goldpoint_trainee ORDER BY id LIMIT 10;');
  console.log('Sample clean inserted rows in database:');
  console.table(rows.rows);

  process.exit(0);
}

runCleanImport();
