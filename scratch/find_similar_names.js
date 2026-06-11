require('dotenv').config();
const db = require('../src/db/neonClient');

const missingNames = [
  "Hafiqa Raikhsa",
  "Diandra Ezra N Simatupang",
  "Abigail Carissa Wurara",
  "Sakina Regune",
  "Daniel Gih",
  "Rachel Nathania Christine Situmorang",
  "Patricia Loh",
  "Miho Qohnita Sihombing",
  "William",
  "Jadellyne Gretchenagata Zhuotio",
  "Gita Junika Pasaribu",
  "Ʝєσνєηηα ¢Αηgιє",
  "Jeneiro Joe",
  "Alvin Syahroni",
  "Ryan Aurelio Bustamin",
  "Carlen Edeline Boru Keliat",
  "Omcom",
  "Klarissa",
  "Samantha Clarine Wu",
  "Darren Gabriel Wijaya",
  "Uttika Anisya",
  "Jolie Charlotte Huang",
  "Phebe Lalita",
  "Queensya Lovely",
  "Ethan Kenny",
  "Kenneth Lim",
  "Rafaelsitorus6@Gmail.Com",
  "Angelina Cenata",
  "Jesslyn Osei Wijaya",
  "Hardey Moledoki Law",
  "Malcolm Archer Tjhin",
  "M. Rafly Arkan",
  "Fredella Alexa",
  "Cedric Damon Yago",
  "Senny Chairani",
  "Clairine Angela Indrjaya",
  "Felicia Grace",
  "Alesha Sofia Andihka",
  "Modric Agusta Daruam",
  "Chaden Ettienne Halim",
  "Mulyanita Br Damanik",
  "Annabella Himeko Winarta",
  "Mikaella Huetteleigh Ng",
  "Reagan Thierry Wijaya",
  "Josevin Carel Hamdani",
  "Rakha",
  "Keigo Kusumo Soh",
  "Ricky Tionardy",
  "Gywen Stefani Wiley",
  "Carine Susanto Lie"
];

(async () => {
  try {
    const r = await db.query('SELECT id, trainee_name FROM dashboard_trainne');
    const dbTrainees = r.rows;

    console.log('=== FUZZY / SIMILARITY MATCH ANALYSIS ===\n');

    for (const name of missingNames) {
      const words = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
      
      const matches = [];
      for (const d of dbTrainees) {
        const dbNameLower = d.trainee_name.toLowerCase();
        
        // 1. Direct word inclusion
        let matchScore = 0;
        for (const w of words) {
          if (dbNameLower.includes(w)) {
            matchScore += 1;
          }
        }

        // 2. Levenshtein or specific character mapping for special text (like Ʝєσνєηηα)
        let isSpecialMatch = false;
        if (name.includes('Ʝєσνєηηα') && dbNameLower.includes('jeovenna')) {
          isSpecialMatch = true;
          matchScore += 5;
        }

        if (matchScore > 0 || isSpecialMatch) {
          matches.push({ id: d.id, name: d.trainee_name, score: matchScore });
        }
      }

      // Sort matches by score descending
      matches.sort((a, b) => b.score - a.score);

      if (matches.length > 0) {
        console.log(`🔍 For "${name}":`);
        matches.slice(0, 3).forEach(m => {
          console.log(`   👉 Match: "${m.name}" (ID: ${m.id}, Score: ${m.score})`);
        });
      } else {
        console.log(`❌ For "${name}": No matches found at all.`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await db.pool.end();
  }
})();
