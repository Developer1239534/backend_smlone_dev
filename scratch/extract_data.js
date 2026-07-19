const fs = require('fs');

const transcriptPath = 'C:\\\\Users\\\\ASUS ROG\\\\.gemini\\\\antigravity\\\\brain\\\\4e7b0000-3f60-4b74-8e2f-25f94561fde3\\\\.system_generated\\\\logs\\\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
console.log('Total lines in transcript:', lines.length);

const userInputLines = lines.filter(l => l.includes('"type":"USER_INPUT"') && l.includes('Annabela Himeko Winarta'));
console.log('Matches found:', userInputLines.length);

if (userInputLines.length > 0) {
  const obj = JSON.parse(userInputLines[userInputLines.length - 1]);
  const content = obj.content;
  const dataIdx = content.indexOf('Annabela Himeko Winarta');
  
  if (dataIdx > -1) {
    console.log('Data found at index:', dataIdx, 'Total content length:', content.length);
    const dataSection = content.substring(dataIdx - 150);
    fs.writeFileSync('scratch/user_data.tsv', dataSection);
    console.log('Successfully saved to scratch/user_data.tsv');
  }
}
