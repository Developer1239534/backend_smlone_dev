const { Pool } = require('pg');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    // 1. Truncate the table to start fresh
    await pool.query('TRUNCATE TABLE voucher_realstage RESTART IDENTITY');
    console.log('Table truncated.');

    const fileStream = fs.createReadStream('real stage_voucher.txt');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let count = 0;
    let isHeader = true;

    for await (const line of rl) {
      if (!line.trim()) continue;
      
      // Assume tab separated
      const parts = line.split('\t');
      
      // If the first row starts with "Issue Date", skip it
      if (isHeader) {
        if (parts[0].trim().toLowerCase() === 'issue date') {
          isHeader = false;
          continue;
        }
        // If not header, we process it as a normal row
        isHeader = false;
      }
      
      if (parts.length >= 4) {
        await pool.query(
          'INSERT INTO voucher_realstage (issue_date, no_voucher, nama_trainee, doc_url) VALUES ($1, $2, $3, $4)',
          [parts[0].trim(), parts[1].trim(), parts[2].trim(), parts[3].trim()]
        );
        count++;
      }
    }
    
    console.log('Total inserted rows from file:', count);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

main();
