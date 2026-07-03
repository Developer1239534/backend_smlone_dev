const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
  const transcriptPath = 'C:\\Users\\ASUS ROG\\.gemini\\antigravity\\brain\\7708b8af-fc75-445b-9958-18e15e5fbc17\\.system_generated\\logs\\transcript_full.jsonl';
  
  if (!fs.existsSync(transcriptPath)) {
    console.error('❌ Transcript file does not exist at:', transcriptPath);
    return;
  }

  console.log('🔄 Listing all USER_INPUT steps in transcript...');
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const steps = [];
  for await (const line of rl) {
    if (line.trim()) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === 'USER_INPUT') {
          steps.push({ index: parsed.step_index, length: parsed.content ? parsed.content.length : 0 });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  console.log('USER_INPUT Steps:', steps);
  
  if (steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    console.log(`\nLast USER_INPUT step index: ${lastStep.index}, length: ${lastStep.length}`);
    
    // Rewrite it
    const fileStream2 = fs.createReadStream(transcriptPath);
    const rl2 = readline.createInterface({
      input: fileStream2,
      crlfDelay: Infinity
    });
    
    for await (const line of rl2) {
      if (line.trim()) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.step_index === lastStep.index) {
            const outputPath = 'c:\\Users\\ASUS ROG\\Documents\\BE\\backend_smlone_dev\\scratch\\full-request.txt';
            fs.writeFileSync(outputPath, parsed.content);
            console.log('✅ Successfully wrote last USER_INPUT to full-request.txt!');
            break;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
}

main();
