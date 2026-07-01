const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/neonClient');

async function main() {
  try {
    const filePath = path.join(__dirname, 'full-request.txt');
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the lines
    const lines = content.split('\n');
    const dataRows = [];

    // Simple parser
    let dataStarted = false;
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      if (cleanLine.includes('Student Name') && cleanLine.includes('Date')) {
        dataStarted = true;
        continue;
      }

      if (!dataStarted) continue;

      // Split by tab or multiple spaces
      const parts = cleanLine.split(/\t+/);
      if (parts.length < 2) continue;

      const studentId = parts[0].trim();
      const dateVal = parts[1].trim();
      // Total Gold can be blank or empty
      const totalGoldStr = parts[2] ? parts[2].trim() : '0';
      const totalGold = totalGoldStr === '' ? 0 : parseInt(totalGoldStr, 10);

      // Verify student ID is numeric or valid format
      if (!studentId || studentId.includes('HOUSE') || studentId.includes('Period')) continue;

      dataRows.push({
        studentId,
        date: dateVal,
        totalGold: isNaN(totalGold) ? 0 : totalGold
      });
    }

    console.log(`Parsed ${dataRows.length} data rows.`);
    console.log('Sample data (first 10 rows):', dataRows.slice(0, 10));

    if (dataRows.length === 0) {
      console.log('❌ No rows parsed. Exiting.');
      return;
    }

    // Now insert them to the database
    console.log('🔄 Creating gp_tahunan table in database if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gp_tahunan (
        id SERIAL PRIMARY KEY,
        trainee_id VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        total_gold INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_gp_tahunan_trainee ON gp_tahunan(trainee_id);
    `);

    console.log('🧹 Clearing existing gp_tahunan database data...');
    await pool.query('DELETE FROM gp_tahunan');

    console.log('🌱 Inserting parsed rows to gp_tahunan table...');
    // We can do bulk insert for speed
    const batchSize = 100;
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      
      const valueStrings = [];
      const queryParams = [];
      batch.forEach((row, index) => {
        const offset = index * 3;
        valueStrings.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
        queryParams.push(row.studentId, row.date, row.totalGold);
      });

      const batchQuery = `
        INSERT INTO gp_tahunan (trainee_id, date, total_gold)
        VALUES ${valueStrings.join(', ')}
      `;
      await pool.query(batchQuery, queryParams);
    }

    console.log('✅ All data seeded to database successfully!');

    // Verification count
    const countCheck = await pool.query('SELECT COUNT(*) FROM gp_tahunan');
    console.log('Total records in gp_tahunan:', countCheck.rows[0].count);

  } catch (err) {
    console.error('❌ Error parsing/seeding:', err);
  } finally {
    await pool.end();
  }
}

main();
