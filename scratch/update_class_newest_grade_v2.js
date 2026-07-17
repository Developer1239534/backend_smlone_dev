const fs = require('fs');
const db = require('../src/db/neonClient');

async function main() {
  try {
    const text = fs.readFileSync('scratch/latest-user-request-v2.txt', 'utf8');
    const lines = text.split('\n');
    let headerLine = null;
    let dataStart = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Timestamp\tEmail Address\tFull Name')) {
        headerLine = lines[i];
        dataStart = i + 1;
        break;
      }
    }
    
    if (!headerLine) {
      console.log('Header not found!');
      process.exit(1);
    }
    
    const headers = headerLine.split('\t').map(h => h.trim());
    
    let cleanIdx = headers.lastIndexOf('Clean');
    let newestGradeIdx = headers.lastIndexOf('Newest Grade');
    let classIdx = headers.indexOf('Kelas (Peserta Training)');
    
    console.log(`Indices -> Clean: ${cleanIdx}, NewestGrade: ${newestGradeIdx}, Class: ${classIdx}`);
    
    let updatedCount = 0;
    
    for (let i = dataStart; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('</USER_REQUEST>')) continue;
      
      const parts = line.split('\t');
      
      let cleanName = parts[cleanIdx]?.trim();
      let newestGrade = parts[newestGradeIdx]?.trim();
      let kelas = parts[classIdx]?.trim();
      
      if (!cleanName && parts[2]) {
        cleanName = parts[2].trim(); // Fallback to Full Name
      }
      
      if (!cleanName) continue;
      
      // Look up trainee
      const res = await db.query(`
        SELECT id, raw_data, grade, level, name 
        FROM level_1_ca_cleaned_trainee 
        WHERE name ILIKE $1 OR raw_data->>'full_name' ILIKE $1 OR raw_data->>'Full Name' ILIKE $1
      `, [`%${cleanName}%`]);
      
      if (res.rows.length > 0) {
        for (const row of res.rows) {
            let rawData = row.raw_data || {};
            let updated = false;
            
            // Clean up old bad keys just in case
            const keysToRemove = ['Kelas', 'kelas', 'kelas_peserta', 'CLASS', 'class', 'Kelas (Peserta Training)'];
            for (const k of keysToRemove) {
              if (rawData.hasOwnProperty(k)) {
                delete rawData[k];
                updated = true;
              }
            }
            
            if (kelas && kelas !== '-') {
               rawData['Kelas (Peserta)'] = kelas;
               updated = true;
            }
            if (newestGrade && newestGrade !== '-') {
               rawData['Newest Grade'] = newestGrade;
               rawData['newest_grade'] = newestGrade;
               rawData['level'] = newestGrade;
               rawData['Level'] = newestGrade;
               updated = true;
            }
            
            if (updated) {
               await db.query(`
                 UPDATE level_1_ca_cleaned_trainee
                 SET raw_data = $1,
                     grade = COALESCE($2, grade),
                     level = COALESCE($3, level)
                 WHERE id = $4
               `, [rawData, (kelas && kelas !== '-' ? kelas : null), (newestGrade && newestGrade !== '-' ? newestGrade : null), row.id]);
               updatedCount++;
            }
        }
      }
    }
    
    console.log(`\nDone. Updated: ${updatedCount} rows with new correct data format.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

main();
