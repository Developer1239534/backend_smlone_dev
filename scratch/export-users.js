require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('🔌 Connecting to Neon database for export...');
    
    const query = `
      SELECT id, trainee_name, status, gender, cabang, plain_password 
      FROM dashboard_trainne 
      ORDER BY id
    `;
    const { rows } = await pool.query(query);

    console.log(`📊 Retrieved ${rows.length} users. Generating CSV...`);

    // Helper to escape CSV values
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    // Construct CSV content
    const headers = ['ID', 'Trainee Name', 'Status', 'Gender', 'Cabang', 'Plain Password'];
    const csvRows = [headers.join(',')];

    for (const r of rows) {
      const rowData = [
        escapeCSV(r.id),
        escapeCSV(r.trainee_name),
        escapeCSV(r.status),
        escapeCSV(r.gender),
        escapeCSV(r.cabang),
        escapeCSV(r.plain_password)
      ];
      csvRows.push(rowData.join(','));
    }

    const csvContent = csvRows.join('\n');
    const outputPath = path.join(__dirname, '..', 'trainees_list.csv');
    
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    
    console.log(`\n🎉 Export Successful!`);
    console.log(`📂 File saved to: trainees_list.csv`);

  } catch (err) {
    console.error('❌ Export failed:', err.message);
  } finally {
    await pool.end();
  }
}

run();
