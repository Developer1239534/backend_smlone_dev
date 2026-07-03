const fs = require('fs');
const readline = require('readline');
const path = require('path');

const targetPath = 'C:\\Users\\ASUS ROG\\Documents\\BE\\backend_smlone_dev\\gp_Tahunan_Juni.txt';

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

  const rawLines = [];
  const mapOverwrite = new Map(); // key: traineeId_date, val: last gold
  const mapSum = new Map(); // key: traineeId_date, val: sum of gold

  let duplicateCount = 0;

  for await (const line of rl) {
    const clean = line.trim();
    if (!clean || clean.includes('Student Name') || clean.includes('Total Gold') || clean.includes('Period:')) {
      continue;
    }

    const parts = clean.includes('\t') ? clean.split(/\t+/) : clean.split(',');
    if (parts.length < 2) continue;

    const traineeId = parts[0].trim();
    const date = parts[1].trim();
    let totalGoldRaw = parts[2] ? parts[2].trim() : '0';
    if (!totalGoldRaw) totalGoldRaw = '0';
    const totalGold = parseInt(totalGoldRaw, 10);

    if (!traineeId || isNaN(traineeId) || !date || isNaN(totalGold)) continue;

    const key = `${traineeId}_${date}`;

    // Overwrite method
    mapOverwrite.set(key, totalGold);

    // Sum method
    if (mapSum.has(key)) {
      mapSum.set(key, mapSum.get(key) + totalGold);
      duplicateCount++;
    } else {
      mapSum.set(key, totalGold);
    }
  }

  console.log(`=============================================`);
  console.log(`📊 ANALISIS DUPLIKASI DATA gp_Tahunan_Juni.txt`);
  console.log(`=============================================`);
  console.log(`Total data baris ter-parse: ${mapSum.size + duplicateCount}`);
  console.log(`Total baris unik (trainee_id + tanggal): ${mapSum.size}`);
  console.log(`Jumlah baris duplikat tanggal yang sama: ${duplicateCount}`);
  console.log(`=============================================`);
  
  console.log('\nContoh duplikasi ID 90100128 pada 6 Jan 2026:');
  const sampleKey = '90100128_6 Jan 2026';
  console.log(`- Jika ditimpa (Overwrite): ${mapOverwrite.get(sampleKey)} gold`);
  console.log(`- Jika dijumlahkan (Sum): ${mapSum.get(sampleKey)} gold`);
}

main();
