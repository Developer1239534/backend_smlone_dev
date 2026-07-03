const fs = require('fs');
const readline = require('readline');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'gp_Tahunan_Juni.txt');

async function main() {
  if (!fs.existsSync(targetPath)) {
    console.error('File not found:', targetPath);
    return;
  }

  const fileStream = fs.createReadStream(targetPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let emptyGoldLines = [];
  let invalidIdLines = [];
  let negativeGoldLines = [];

  for await (const line of rl) {
    lineCount++;
    const clean = line.trim();
    if (!clean || clean.includes('Student Name') || clean.includes('Total Gold') || clean.includes('Period:')) {
      continue;
    }

    const parts = clean.includes('\t') ? clean.split(/\t+/) : clean.split(',');
    
    const traineeId = parts[0] ? parts[0].trim() : '';
    const date = parts[1] ? parts[1].trim() : '';
    const goldRaw = parts[2] ? parts[2].trim() : '';

    if (!traineeId || isNaN(traineeId)) {
      invalidIdLines.push({ lineNum: lineCount, content: line });
      continue;
    }

    if (!goldRaw) {
      emptyGoldLines.push({ lineNum: lineCount, content: line });
      continue;
    }

    const goldVal = parseInt(goldRaw, 10);
    if (isNaN(goldVal)) {
      emptyGoldLines.push({ lineNum: lineCount, content: line });
    } else if (goldVal < 0) {
      negativeGoldLines.push({ lineNum: lineCount, content: line, gold: goldVal });
    }
  }

  console.log(`=========================================`);
  console.log(`🔍 DETAIL PEMERIKSAAN gp_Tahunan_Juni.txt`);
  console.log(`=========================================`);
  console.log(`Total Baris: ${lineCount}`);
  console.log(`Baris dengan ID Tidak Valid/Kosong: ${invalidIdLines.length}`);
  console.log(`Baris dengan Emas Kosong: ${emptyGoldLines.length}`);
  console.log(`Baris dengan Emas Negatif (Pengurangan): ${negativeGoldLines.length}`);
  console.log(`=========================================`);

  if (emptyGoldLines.length > 0) {
    console.log('\nContoh baris dengan Emas Kosong (pertama 5):');
    console.table(emptyGoldLines.slice(0, 5));
  }

  if (negativeGoldLines.length > 0) {
    console.log('\nContoh baris dengan Emas Negatif (pertama 5):');
    console.table(negativeGoldLines.slice(0, 5));
  }

  if (invalidIdLines.length > 0) {
    console.log('\nContoh baris dengan ID Tidak Valid (pertama 5):');
    console.table(invalidIdLines.slice(0, 5));
  }
}

main();
