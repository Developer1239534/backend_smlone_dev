const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

async function main() {
  const logPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\9beb73e7-e676-4eaa-a35f-bc916c6c9b49\\.system_generated\\logs\\transcript_full.jsonl';
  const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
  
  let lastUserMsg = '';
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT' && obj.content) {
        lastUserMsg = obj.content;
      }
    } catch(e) {}
  }

  console.log('Last user msg length:', lastUserMsg.length);
  
  // Extract text starting from "Report Title" or after header
  const idx = lastUserMsg.indexOf('Report Title');
  const targetText = idx !== -1 ? lastUserMsg.slice(idx) : lastUserMsg;
  
  // Save raw data to a text file for parsing
  fs.writeFileSync(path.join(__dirname, 'raw_report_data.txt'), targetText, 'utf8');
  console.log('Saved raw_report_data.txt');
}

main().catch(console.error);
