const db = require('../src/db/neonClient');

async function main() {
  try {
    // Query trainees who have NO entries in real_stage (or whose entries have null/empty url)
    const res = await db.query(`
      SELECT dt.id, dt.trainee_name, dt.status
      FROM dashboard_trainne dt
      WHERE NOT EXISTS (
        SELECT 1 
        FROM real_stage rs 
        WHERE rs.trainee_id = dt.id 
          AND rs.url IS NOT NULL 
          AND rs.url != '' 
          AND rs.url LIKE 'http%'
      )
      ORDER BY 
        CASE WHEN dt.id ~ '^[0-9]+$' THEN dt.id::bigint ELSE 9999999999 END, 
        dt.id
    `);

    console.log(`Found ${res.rows.length} trainees without any valid Real Stage links.`);
    
    // Log the first 50 as a sample to console
    console.log('\n=== SAMPLE OF MISSING TRAINEES (First 50) ===');
    console.log(res.rows.slice(0, 50));

    // Also write the complete list to an artifact file or JSON file
    const fs = require('fs');
    const path = require('path');
    
    // We can write it directly as a markdown table in an artifact
    let markdown = `# Trainees Missing Real Stage Links (${res.rows.length})\n\n`;
    markdown += `Berikut adalah daftar ${res.rows.length} trainee yang tidak memiliki link Real Stage terdaftar di database.\n\n`;
    markdown += `| ID Trainee | Nama Trainee | Status |\n`;
    markdown += `| :--- | :--- | :--- |\n`;
    
    for (const row of res.rows) {
      markdown += `| ${row.id} | ${row.trainee_name || 'N/A'} | ${row.status || 'N/A'} |\n`;
    }
    
    const artifactPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\trainees_missing_real_stage_links.md';
    fs.writeFileSync(artifactPath, markdown, 'utf8');
    console.log(`Successfully wrote artifact to ${artifactPath}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.pool.end();
  }
}

main();
