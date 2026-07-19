const fs = require('fs');

const data = fs.readFileSync('scratch/user_data.tsv', 'utf8');
const lines = data.split('\n');

const headers = [
  'Student Name', 'ID', 'House', 'Class Trainers', 'Date', 'Coach Feedback', 
  'Challenge', 'Speaking Project', 'Role 2', 'Role 3', 'Role 4', 'Life Project', 
  'Win', 'Fav', '', 'Total Gold', 'House 2', 'Level', 'Latest Speaking Project', 
  'Last Time Speaking', 'Class', '', ''
];

const records = [];

// Skip line 1 because it's a corrupted header
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].replace(/\r/g, '');
  if (!line.trim()) continue;
  
  const cols = line.split('\t');
  if (cols.length < 2) continue; // Skip weird empty rows
  
  const record = {};
  for (let j = 0; j < headers.length; j++) {
    if (headers[j]) {
      record[headers[j]] = cols[j] || '';
    }
  }
  
  if (record['Student Name'] || record['ID']) {
    records.push(record);
  }
}

console.log(`Parsed ${records.length} records. Sending to API...`);

fetch('https://api.smlone.cloud/api/webhook/level-2-feedback-students/push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'smlone-n8n-secret-key-2026'
  },
  body: JSON.stringify(records)
})
.then(res => res.json())
.then(json => {
  console.log('Response from server:', json);
})
.catch(err => {
  console.error('Error posting data:', err);
});
