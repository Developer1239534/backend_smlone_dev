const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db/neonClient');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const filePath = path.join(__dirname, 'full-request.txt');
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the lines
    const lines = content.split('\n');
    const dataRows = [];
    let dataStarted = false;

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      if (cleanLine.includes('ID') && cleanLine.includes('Nama Trainee') && cleanLine.includes('Total Gold/Periode')) {
        dataStarted = true;
        continue;
      }

      if (!dataStarted) continue;

      const parts = cleanLine.split(/\t+/);
      if (parts.length < 8) continue;

      const id = parts[0].trim();
      const name = parts[1].trim();
      
      // Ensure ID is numeric
      if (isNaN(id) || !id) continue;

      // Extract values by index matching the headers:
      const level = parts[3] ? parts[3].trim() : '';
      const house = parts[4] ? parts[4].trim() : '';
      const className = parts[5] ? parts[5].trim() : '';
      const cabang = parts[6] ? parts[6].trim() : '';
      
      // Index 7: Total Gold/Periode
      const totalGold = parts[7] ? parts[7].trim() : '';
      const juniorYouth = parts[8] ? parts[8].trim() : '';
      
      // Indexes 9 to 16: Ranks
      const rankJunior = parts[9] ? parts[9].trim() : '';
      const rankYouth = parts[10] ? parts[10].trim() : '';
      const rankJuniorTimor = parts[11] ? parts[11].trim() : '';
      const rankYouthTimor = parts[12] ? parts[12].trim() : '';
      const rankJuniorTritura = parts[13] ? parts[13].trim() : '';
      const rankYouthTritura = parts[14] ? parts[14].trim() : '';
      const rankJuniorCemara = parts[15] ? parts[15].trim() : '';
      const rankYouthCemara = parts[16] ? parts[16].trim() : '';

      dataRows.push({
        id,
        name,
        level,
        house,
        class: className,
        cabang,
        totalGold,
        juniorYouth,
        rankJunior,
        rankYouth,
        rankJuniorTimor,
        rankYouthTimor,
        rankJuniorTritura,
        rankYouthTritura,
        rankJuniorCemara,
        rankYouthCemara
      });
    }

    console.log(`Parsed ${dataRows.length} trainees for gp_month.`);
    console.log('Sample parsed data (first 3 rows):', dataRows.slice(0, 3));

    if (dataRows.length === 0) {
      console.error('❌ No data parsed! Exiting.');
      return;
    }

    // Default password hash for new trainees
    const defaultPasswordHash = await bcrypt.hash('SmlOneDev2026', 10);

    // Get all existing trainee IDs from DB
    const existingRes = await pool.query('SELECT id FROM dashboard_trainne');
    const existingIds = new Set(existingRes.rows.map(r => r.id));

    console.log(`Checking for missing trainees in dashboard_trainne...`);
    let missingCount = 0;
    for (const row of dataRows) {
      if (!existingIds.has(row.id)) {
        // Insert missing trainee
        await pool.query(
          `INSERT INTO dashboard_trainne (
            id, trainee_name, level, house_sml, class, cabang, junior_youth, password, plain_password
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            row.id,
            row.name,
            row.level || null,
            row.house || null,
            row.class || null,
            row.cabang || null,
            row.juniorYouth || null,
            defaultPasswordHash,
            'SmlOneDev2026'
          ]
        );
        existingIds.add(row.id);
        missingCount++;
      }
    }
    console.log(`Added ${missingCount} missing trainees to dashboard_trainne.`);

    // Now insert them to the database
    console.log('🧹 Clearing existing gp_month data for June...');
    await pool.query("DELETE FROM gp_month WHERE periode = 'June'");

    console.log('🌱 Seeding gp_month table...');
    const batchSize = 100;
    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize);
      
      const valueStrings = [];
      const queryParams = [];
      batch.forEach((row, index) => {
        const offset = index * 11;
        valueStrings.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11})`);
        
        queryParams.push(
          row.id,
          'June',
          row.totalGold || null,
          row.rankJunior || null,
          row.rankYouth || null,
          row.rankJuniorTimor || null,
          row.rankYouthTimor || null,
          row.rankJuniorTritura || null,
          row.rankYouthTritura || null,
          row.rankJuniorCemara || null,
          row.rankYouthCemara || null
        );
      });

      const batchQuery = `
        INSERT INTO gp_month (
          trainee_id, periode, total_gold_periode,
          rank_id_junior, rank_id_youth,
          rank_id_junior_timor, rank_id_youth_timor,
          rank_id_junior_tritura, rank_id_youth_tritura,
          rank_id_junior_cemara, rank_id_youth_cemara
        )
        VALUES ${valueStrings.join(', ')}
        ON CONFLICT (trainee_id) DO UPDATE SET
          total_gold_periode = EXCLUDED.total_gold_periode,
          rank_id_junior = EXCLUDED.rank_id_junior,
          rank_id_youth = EXCLUDED.rank_id_youth,
          rank_id_junior_timor = EXCLUDED.rank_id_junior_timor,
          rank_id_youth_timor = EXCLUDED.rank_id_youth_timor,
          rank_id_junior_tritura = EXCLUDED.rank_id_junior_tritura,
          rank_id_youth_tritura = EXCLUDED.rank_id_youth_tritura,
          rank_id_junior_cemara = EXCLUDED.rank_id_junior_cemara,
          rank_id_youth_cemara = EXCLUDED.rank_id_youth_cemara,
          periode = EXCLUDED.periode
      `;
      await pool.query(batchQuery, queryParams);
    }

    console.log('✅ gp_month table updated successfully!');

    // Verification count
    const countCheck = await pool.query("SELECT COUNT(*) FROM gp_month WHERE periode = 'June'");
    console.log('Total records in gp_month for June:', countCheck.rows[0].count);

  } catch (err) {
    console.error('❌ Error updating gp_month:', err);
  } finally {
    await pool.end();
  }
}

main();
