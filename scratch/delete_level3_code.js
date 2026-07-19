const fs = require('fs');

// 1. Delete route file
try {
  fs.unlinkSync('./src/routes/level3StudentsFeedbackRoutes.js');
  console.log('Deleted level3StudentsFeedbackRoutes.js');
} catch (e) {
  console.log('Route file already deleted or not found.');
}

// 2. Clean up server.js
let content = fs.readFileSync('./src/server.js', 'utf8');

// Remove require
content = content.replace("const level3StudentsFeedbackRoutes = require('./routes/level3StudentsFeedbackRoutes');\n", "");
content = content.replace("const level3StudentsFeedbackRoutes = require('./routes/level3StudentsFeedbackRoutes');\r\n", "");

// Remove admin routes
content = content.replace("app.use('/api/admin/level-3-students-feedback', verifyToken, level3StudentsFeedbackRoutes);\n", "");
content = content.replace("app.use('/admin/level-3-students-feedback', verifyToken, level3StudentsFeedbackRoutes);\n", "");
content = content.replace("app.use('/api/admin/level-3-students-feedback', verifyToken, level3StudentsFeedbackRoutes);\r\n", "");
content = content.replace("app.use('/admin/level-3-students-feedback', verifyToken, level3StudentsFeedbackRoutes);\r\n", "");

// Remove webhook route
const webhookRegex = /app\.use\('\/api\/webhook\/level-3-students-feedback',[\s\S]+?\}, level3StudentsFeedbackRoutes\);\n\n/;
content = content.replace(webhookRegex, "");

// Remove create table block
const createTableRegex = /\s*\/\/ Create level_3_students_feedback table\s*await db\.query\(`\s*CREATE TABLE IF NOT EXISTS level_3_students_feedback \([\s\S]+?\);\s*`\);\n/;
content = content.replace(createTableRegex, "\n");

fs.writeFileSync('./src/server.js', content, 'utf8');
console.log('Cleaned up server.js');

