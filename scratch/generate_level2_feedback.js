const fs = require('fs');

const userColumns = [
  "Student Name", "ID", "House", "Class Trainers", "Date", "Coach Feedback", 
  "Challenge", "Speaking Project", "Role 2", "Role 3", "Role 4", "Life Project", 
  "Win", "Fav", "Total Gold", "House2", "Level", "Latest Speaking Project", 
  "Last Time Speaking", "Class"
];

function toSnakeCase(str) {
  if (str === "ID") return "trainee_id";
  if (str === "Class") return "class_name";
  if (str === "Date") return "date_text";
  if (str === "House") return "house_1";
  if (str === "House2") return "house_2";
  return str.toLowerCase().replace(/[\/\.]/g, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').trim();
}

const snakeColumns = userColumns.map(toSnakeCase);

let serverCode = `    // Create level_2_feedback_students table\n    await db.query(\`\n      CREATE TABLE IF NOT EXISTS level_2_feedback_students (\n        id SERIAL PRIMARY KEY,\n        row_hash TEXT UNIQUE,\n`;
for (let i = 0; i < snakeColumns.length; i++) {
  serverCode += `        ${snakeColumns[i]} TEXT,\n`;
}
serverCode += `        raw_data JSONB,\n        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      );\n    \`);\n`;

// Inject into server.js
let content = fs.readFileSync('./src/server.js', 'utf8');

const requireStr = `const level2ReportSeluruhCabangRoutes = require('./routes/level2ReportSeluruhCabangRoutes');\nconst level2FeedbackStudentsRoutes = require('./routes/level2FeedbackStudentsRoutes');`;
content = content.replace(`const level2ReportSeluruhCabangRoutes = require('./routes/level2ReportSeluruhCabangRoutes');`, requireStr);

const adminStr = `app.use('/api/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);\napp.use('/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);\napp.use('/api/admin/level-2-feedback-students', verifyToken, level2FeedbackStudentsRoutes);\napp.use('/admin/level-2-feedback-students', verifyToken, level2FeedbackStudentsRoutes);`;
content = content.replace(`app.use('/api/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);\r\napp.use('/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);`, adminStr);
content = content.replace(`app.use('/api/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);\napp.use('/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);`, adminStr); // Fallback LF

const webhookStr = `}, level2ReportSeluruhCabangRoutes);\n\napp.use('/api/webhook/level-2-feedback-students', (req, res, next) => {\n  const apiKey = req.headers['x-api-key'];\n  if (apiKey !== 'smlone-n8n-secret-key-2026') {\n    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });\n  }\n  next();\n}, level2FeedbackStudentsRoutes);`;
content = content.replace(`}, level2ReportSeluruhCabangRoutes);`, webhookStr);

const schemaReplacement = serverCode + '\n    // Create level_2_report_seluruh_cabang table';
content = content.replace('    // Create level_2_report_seluruh_cabang table', schemaReplacement);

fs.writeFileSync('./src/server.js', content, 'utf8');
console.log("Successfully injected level 2 feedback into server.js directly in JS!");

// Route code
let routeVars = snakeColumns.map(c => {
  let original = userColumns[snakeColumns.indexOf(c)];
  if (original === 'House2') original = 'House'; // to extract the second House if it comes in as array? Wait, sheet to json usually drops duplicate keys or renames them to House_1. Let's just use raw_data.
  return `const ${c} = row['${original}'] || '';`;
}).join('\n      ');

// Actually, since there might be duplicate keys like "House", JSON might only keep one. We'll just extract what we can safely.
routeVars = snakeColumns.map(c => `const ${c} = (row['${userColumns[snakeColumns.indexOf(c)] === "House2" ? "House 2" : userColumns[snakeColumns.indexOf(c)]}'] !== undefined ? row['${userColumns[snakeColumns.indexOf(c)] === "House2" ? "House 2" : userColumns[snakeColumns.indexOf(c)]}'] : row['${userColumns[snakeColumns.indexOf(c)]}']) || '';`).join('\n      ');

let upsertFields = snakeColumns.join(', ');
let upsertValues = snakeColumns.map((_, i) => `$${i+2}`).join(', ');

const routeCode = `
const express = require('express');
const router = express.Router();
const db = require('../db/neonClient');
const crypto = require('crypto');

// N8N Webhook - Insert data
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
      const row_hash = crypto.createHash('sha256').update(raw_data).digest('hex');

      if (!trainee_id && !student_name) {
        console.warn(\`[n8n Push L2 Feedback] Skipping row \${i}: empty ID and Name.\`);
        skippedCount++;
        continue;
      }

      try {
        const insertQuery = \`
          INSERT INTO level_2_feedback_students (
            row_hash, ${upsertFields}, raw_data
          ) VALUES (
            $1, ${upsertValues}, $${snakeColumns.length + 2}
          ) ON CONFLICT (row_hash) DO NOTHING;
        \`;

        const result = await db.query(insertQuery, [
          row_hash, ${snakeColumns.join(', ')}, raw_data
        ]);
        
        if (result.rowCount > 0) {
            insertedCount++;
        } else {
            skippedCount++; // Duplicate based on hash
        }
      } catch (rowError) {
        errorCount++;
        errors.push({ index: i, id: trainee_id, name: student_name, error: rowError.message });
        console.error(\`[n8n Push L2 Feedback] Error on row \${i} (\${student_name} / \${trainee_id}):\`, rowError.message);
      }
    }

    res.json({
      success: true,
      message: \`Berhasil menyimpan \${insertedCount} data baru, \${skippedCount} di-skip (kosong/duplikat), \${errorCount} error.\`,
      details: { inserted: insertedCount, skipped: skippedCount, errors: errorCount, error_list: errors }
    });

  } catch (error) {
    console.error('[n8n Push L2 Feedback] Fatal error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Admin Panel - GET All
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM level_2_feedback_students ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching L2 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - PUT (Update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
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
      UPDATE level_2_feedback_students 
      SET \${setQuery.join(', ')} 
      WHERE id = $\${queryIndex} RETURNING *
    \`;

    const result = await db.query(updateQueryString, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating L2 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Panel - DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM level_2_feedback_students WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }
    
    res.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting L2 feedback:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
`;

fs.writeFileSync('./src/routes/level2FeedbackStudentsRoutes.js', routeCode);
console.log('Successfully generated route file!');
