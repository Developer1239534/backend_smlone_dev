const fs = require('fs');
const path = require('path');
const db = require('./neonClient');

async function main() {
  try {
    console.log('🔄 Fetching all active trainees from the database...');
    const result = await db.query(
      `SELECT id, trainee_name, status, cabang, plain_password, progress_video 
       FROM dashboard_trainne 
       ORDER BY CAST(id AS INTEGER) ASC`
    );

    const trainees = result.rows;
    console.log(`📋 Retrieved ${trainees.length} active trainees.`);

    let content = '========================================================================================================================================================\n';
    content += '                                              SMLONE TRAINEE LIST, CREDENTIALS, AND YOUTUBE PLAYLISTS\n';
    content += '========================================================================================================================================================\n\n';
    content += `Total Active Trainees: ${trainees.length}\n\n`;
    content += '--------------------------------------------------------------------------------------------------------------------------------------------------------\n';
    content += 'ID\t| Trainee Name\t\t\t\t| Status\t\t\t| Cabang\t| Plain Password\t| YouTube Playlist Link\n';
    content += '--------------------------------------------------------------------------------------------------------------------------------------------------------\n';

    for (const t of trainees) {
      const paddedId = t.id.padEnd(6, ' ');
      const paddedName = (t.trainee_name || '').padEnd(35, ' ').substring(0, 35);
      const paddedStatus = (t.status || '').padEnd(25, ' ').substring(0, 25);
      const paddedCabang = (t.cabang || 'N/A').padEnd(10, ' ').substring(0, 10);
      const paddedPassword = (t.plain_password || 'N/A').padEnd(20, ' ').substring(0, 20);
      const youtubeLink = t.progress_video || 'N/A';

      content += `${paddedId}\t| ${paddedName}\t| ${paddedStatus}\t| ${paddedCabang}\t| ${paddedPassword}\t| ${youtubeLink}\n`;
    }

    content += '--------------------------------------------------------------------------------------------------------------------------------------------------------\n';

    const outputPath = path.join(__dirname, '..', '..', 'trainee_credentials_and_playlists.txt');
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ Report successfully generated and saved to: ${outputPath}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error generating report:', err);
    process.exit(1);
  }
}

main();
