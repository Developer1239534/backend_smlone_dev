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

let content = fs.readFileSync('./src/server.js', 'utf8');

const requireStr = `const level1TrCleanedTraineeRoutes = require('./routes/level1TrCleanedTraineeRoutes');\nconst level2ReportSeluruhCabangRoutes = require('./routes/level2ReportSeluruhCabangRoutes');`;
content = content.replace(`const level1TrCleanedTraineeRoutes = require('./routes/level1TrCleanedTraineeRoutes');`, requireStr);

const adminStr = `app.use('/api/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\napp.use('/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\napp.use('/api/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);\napp.use('/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);`;
content = content.replace(`app.use('/api/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\r\napp.use('/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);`, adminStr);
content = content.replace(`app.use('/api/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\napp.use('/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);`, adminStr); // Fallback for LF

const webhookStr = `}, level1TrCleanedTraineeRoutes);\n\napp.use('/api/webhook/level-2-report-seluruh-cabang', (req, res, next) => {\n  const apiKey = req.headers['x-api-key'];\n  if (apiKey !== 'smlone-n8n-secret-key-2026') {\n    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });\n  }\n  next();\n}, level2ReportSeluruhCabangRoutes);`;
content = content.replace(`}, level1TrCleanedTraineeRoutes);`, webhookStr);

const schemaReplacement = serverCode + '\n    // Create level_1_tr_cleaned_trainee table';
content = content.replace('    // Create level_1_tr_cleaned_trainee table', schemaReplacement);

fs.writeFileSync('./src/server.js', content, 'utf8');
console.log("Successfully injected level 2 report into server.js directly in JS!");
