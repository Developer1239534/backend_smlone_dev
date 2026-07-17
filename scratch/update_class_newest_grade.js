const fs = require('fs');
const db = require('../src/db/neonClient');

async function main() {
  try {
    const text = fs.readFileSync('scratch/latest-user-request-new.txt', 'utf8');
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
    let emailIdx = headers.indexOf('Email Address');
    
    console.log(`Indices -> Clean: ${cleanIdx}, NewestGrade: ${newestGradeIdx}, Class: ${classIdx}`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (let i = dataStart; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('</USER_REQUEST>')) continue;
      
      const parts = line.split('\t');
      
      let cleanName = parts[cleanIdx]?.trim();
      let newestGrade = parts[newestGradeIdx]?.trim();
      let kelas = parts[classIdx]?.trim();
      let email = parts[emailIdx]?.trim();
      
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
        // Let's update the first match (or all matches if duplicate)
        for (const row of res.rows) {
            let rawData = row.raw_data || {};
            
            let updated = false;
            
            if (kelas && kelas !== '-') {
               rawData['kelas'] = kelas;
               rawData['Kelas'] = kelas;
               rawData['kelas_peserta'] = kelas;
               rawData['Kelas (Peserta)'] = kelas;
               updated = true;
            }
            if (newestGrade && newestGrade !== '-') {
               rawData['level'] = newestGrade;
               rawData['Level'] = newestGrade;
               rawData['newest_grade'] = newestGrade;
               rawData['Newest Grade'] = newestGrade;
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
               console.log(`Updated: ${row.name} - Class: ${kelas}, Newest Grade: ${newestGrade}`);
            }
        }
      } else {
        notFoundCount++;
        console.log(`Not found: ${cleanName}`);
      }
    }
    
    console.log(`\nDone. Updated: ${updatedCount}. Not found: ${notFoundCount}`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

main();
