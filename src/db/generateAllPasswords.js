const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./neonClient');

// Helper to generate a secure random alphanumeric password
function generateRandomPassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function generateAllPasswords() {
  try {
    console.log('🔄 Fetching all trainees from Neon database...');
    const result = await db.query('SELECT id, trainee_name, email, password FROM dashboard_trainne ORDER BY id ASC');
    const trainees = result.rows;
    console.log(`📋 Found ${trainees.length} trainees in the database.`);

    const generatedList = [];
    let updatedCount = 0;

    for (const trainee of trainees) {
      let plainPassword = '';
      
      // If the trainee doesn't have a password yet, generate one
      if (!trainee.password) {
        plainPassword = generateRandomPassword(8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        // Update password in database
        await db.query(
          'UPDATE dashboard_trainne SET password = $1 WHERE id = $2',
          [hashedPassword, trainee.id]
        );
        updatedCount++;
      } else {
        plainPassword = '[ALREADY REGISTERED / HAS PASSWORD]';
      }

      generatedList.push({
        id: trainee.id,
        name: trainee.trainee_name,
        email: trainee.email || 'N/A',
        password: plainPassword
      });
    }

    // Create a beautiful text report
    let reportContent = '============================================================\n';
    reportContent += '          SMLONE TRAINEE STUDENT CREDENTIALS LIST          \n';
    reportContent += '============================================================\n\n';
    reportContent += `Total Trainees: ${trainees.length}\n`;
    reportContent += `Passwords Generated & Updated Now: ${updatedCount}\n\n`;
    reportContent += '------------------------------------------------------------\n';
    reportContent += 'ID\t| Name\t\t\t\t| Email\t\t| Password\n';
    reportContent += '------------------------------------------------------------\n';

    for (const item of generatedList) {
      // Pad name for layout alignment
      const paddedName = item.name.padEnd(30, ' ').substring(0, 30);
      const paddedId = item.id.padEnd(6, ' ');
      const paddedEmail = item.email.padEnd(18, ' ').substring(0, 18);
      reportContent += `${paddedId}\t| ${paddedName}\t| ${paddedEmail}\t| ${item.password}\n`;
    }

    reportContent += '\n============================================================\n';

    // Write to a local file in the workspace
    const outputPath = path.join(__dirname, '..', '..', 'trainee_passwords.txt');
    fs.writeFileSync(outputPath, reportContent, 'utf8');

    console.log(`\n✅ Successfully generated passwords for ${updatedCount} trainees!`);
    console.log(`📄 Credentials list has been written to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating passwords:', error);
    process.exit(1);
  }
}

generateAllPasswords();
