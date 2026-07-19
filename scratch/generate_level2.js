const fs = require('fs');

const userColumns = [
  "ID", "Name", "BRANCH", "Membership Expiry Date", "Active/ Expired", 
  "Cleaned Program", "Cleaned Class", "House", "Students Report Link", 
  "ID vs Student Report Link", "Total Gold", "Level",
  "L1. S.Project 1", "L1. S.Project 2", "L1. S.Project 3", "L1. S.Project 4", 
  "L1. S.Project 5", "L1. S.Project 6", "L1. S.Project 7", "L1. S.Project 8",
  "L2. S.Project 1", "L2. S.Project 2", "L2. S.Project 3", "L2. S.Project 4", 
  "L2. S.Project 5", "L2. S.Project 6", "L2. S.Project 7", "L2. S.Project 8", 
  "L2. S.Project 9", "L2. S.Project 10",
  "L3. S.Project 1", "L3. S.Project 2", "L3. S.Project 3", "L3. S.Project 4", 
  "L3. S.Project 5", "L3. S.Project 6", "L3. S.Project 7", "L3. S.Project 8", 
  "L3. S.Project 9", "L3. S.Project 10",
  "L4. S.Project 1", "L4. S.Project 2", "L4. S.Project 3", "L4. S.Project 4", 
  "L4. S.Project 5", "L4. S.Project 6", "L4. S.Project 7", "L4. S.Project 8", 
  "L4. S.Project 9", "L4. S.Project 10",
  "L5. S.Project 1", "L5. S.Project 2", "L5. S.Project 3", "L5. S.Project 4", 
  "L5. S.Project 5", "L5. S.Project 6", "L5. S.Project 7", "L5. S.Project 8", 
  "L5. S.Project 9", "L5. S.Project 10",
  "L6. S.Project 1", "L6. S.Project 2", "L6. S.Project 3", "L6. S.Project 4", 
  "L6. S.Project 5", "L6. S.Project 6", "L6. S.Project 7", "L6. S.Project 8", 
  "L6. S.Project 9", "L6. S.Project 10",
  "Latest Speaking Project", "Speaking Project to Next Level",
  "Level 6 Link", "Last Speaker date", "Last Life Project date", 
  "Last Life Project", "Last Attendance"
];

function toSnakeCase(str) {
  if (str === "ID") return "trainee_id";
  if (str === "Name") return "name";
  return str.toLowerCase().replace(/[\/\.]/g, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').trim();
}

const snakeColumns = userColumns.map(toSnakeCase);

let serverCode = `    // Create level_2_report_seluruh_cabang table\n    await db.query(\`\n      CREATE TABLE IF NOT EXISTS level_2_report_seluruh_cabang (\n        id SERIAL PRIMARY KEY,\n        trainee_id TEXT UNIQUE,\n`;
for (let i = 1; i < snakeColumns.length; i++) {
  serverCode += `        ${snakeColumns[i]} TEXT,\n`;
}
serverCode += `        raw_data JSONB,\n        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      );\n    \`);\n`;

console.log("SERVER.JS SCHEMA:");
console.log(serverCode);

// Route code
let routeVars = snakeColumns.map(c => `const ${c} = row['${userColumns[snakeColumns.indexOf(c)]}'] || '';`).join('\n      ');

let upsertFields = snakeColumns.join(', ');
let upsertValues = snakeColumns.map((_, i) => `$${i+1}`).join(', ');
let upsertSet = snakeColumns.filter(c => c !== 'trainee_id').map(c => `${c} = EXCLUDED.${c}`).join(',\n            ');

const routeCode = `
const express = require('express');
const router = express.Router();
const db = require('../db');

// N8N Webhook - Upsert data
router.post('/push', async (req, res) => {
  try {
    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }
    
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      ${routeVars}
      const raw_data = JSON.stringify(row);

      if (!trainee_id && !name) {
        console.warn(\`[n8n Push L2 Report] Skipping row \${i}: empty ID and Name.\`);
        skippedCount++;
        continue;
      }

      try {
        const upsertQuery = \`
          INSERT INTO level_2_report_seluruh_cabang (
            ${upsertFields}, raw_data
          ) VALUES (
            ${upsertValues}, $${snakeColumns.length + 1}
          ) ON CONFLICT (trainee_id) DO UPDATE SET
            ${upsertSet},
            raw_data = EXCLUDED.raw_data,
            created_at = CURRENT_TIMESTAMP;
        \`;

        await db.query(upsertQuery, [
          ${snakeColumns.join(', ')}, raw_data
        ]);
        
        insertedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: name, error: rowError.message });
        console.error(\`[n8n Push L2 Report] Error on row \${i} (\${name} / \${trainee_id}):\`, rowError.message);
      }
    }

    res.json({
      success: true,
      message: \`Berhasil menyimpan \${insertedCount} data, \${skippedCount} di-skip, \${errorCount} error.\`,
      details: { inserted: insertedCount, skipped: skippedCount, errors: errorCount, error_list: errors }
    });

  } catch (error) {
    console.error('[n8n Push L2 Report] Fatal error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Admin Panel - GET All
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM level_2_report_seluruh_cabang ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching L2 reports:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - PUT (Update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Allow updating all columns except id and raw_data/created_at
    const allowedColumns = [${snakeColumns.map(c => `'${c}'`).join(', ')}];
    
    const setQuery = [];
    const values = [];
    let queryIndex = 1;

    for (const key of Object.keys(updates)) {
      if (allowedColumns.includes(key)) {
        setQuery.push(\`"\${key}" = $\${queryIndex}\`);
        values.push(updates[key]);
        queryIndex++;
      }
    }

    if (setQuery.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    values.push(id);
    const updateQueryString = \`
      UPDATE level_2_report_seluruh_cabang 
      SET \${setQuery.join(', ')} 
      WHERE id = $\${queryIndex} RETURNING *
    \`;

    const result = await db.query(updateQueryString, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating L2 report:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM level_2_report_seluruh_cabang WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    
    res.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting L2 report:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
`;

fs.writeFileSync('./src/routes/level2ReportSeluruhCabangRoutes.js', routeCode);
console.log('Successfully generated route file!');
