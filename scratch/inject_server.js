const fs = require('fs');

let content = fs.readFileSync('./src/server.js', 'utf8');

const requireStr = `const level1TrCleanedTraineeRoutes = require('./routes/level1TrCleanedTraineeRoutes');\nconst level2ReportSeluruhCabangRoutes = require('./routes/level2ReportSeluruhCabangRoutes');`;
content = content.replace(`const level1TrCleanedTraineeRoutes = require('./routes/level1TrCleanedTraineeRoutes');`, requireStr);

const adminStr = `app.use('/api/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\napp.use('/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\napp.use('/api/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);\napp.use('/admin/level-2-report-seluruh-cabang', verifyToken, level2ReportSeluruhCabangRoutes);`;
content = content.replace(`app.use('/api/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\r\napp.use('/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);`, adminStr);
content = content.replace(`app.use('/api/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);\napp.use('/admin/level-1-tr-cleaned-trainee', verifyToken, level1TrCleanedTraineeRoutes);`, adminStr); // Fallback for LF

const webhookStr = `}, level1TrCleanedTraineeRoutes);\n\napp.use('/api/webhook/level-2-report-seluruh-cabang', (req, res, next) => {\n  const apiKey = req.headers['x-api-key'];\n  if (apiKey !== 'smlone-n8n-secret-key-2026') {\n    return res.status(401).json({ success: false, message: 'Unauthorized Webhook' });\n  }\n  next();\n}, level2ReportSeluruhCabangRoutes);`;
content = content.replace(`}, level1TrCleanedTraineeRoutes);`, webhookStr);

const schemaFile = fs.readFileSync('./scratch/schema.txt', 'utf8');
const startIndex = schemaFile.indexOf('// Create level_2_report_seluruh_cabang table');
const endIndex = schemaFile.indexOf('\`);', startIndex) + 3;
const schemaQuery = schemaFile.substring(startIndex, endIndex);

const schemaReplacement = schemaQuery + '\n\n    // Create level_1_tr_cleaned_trainee table';
content = content.replace('    // Create level_1_tr_cleaned_trainee table', schemaReplacement);

fs.writeFileSync('./src/server.js', content);
console.log("Successfully injected level 2 report into server.js");
