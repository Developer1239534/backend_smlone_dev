const db = require('../src/db/neonClient');

const PERIOD = '7/31/2026';

const data = [
  // ======================== ALL BRANCH - Junior (27 rows) ========================
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '440', trainee_name: 'Sofia Grace Wu', membership_status: 'Active', level: 'Colonel', house: 'House of Creanova', class_name: 'Gladwell', branch: 'TIMOR', total_gold: 890, ranking: 1 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100138', trainee_name: 'Vyon Wynter Huang', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Pearl', branch: 'CEMARA', total_gold: 710, ranking: 2 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100005', trainee_name: 'Felynn Holy Richson', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Pearl', branch: 'CEMARA', total_gold: 545, ranking: 3 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '914', trainee_name: 'Leia Kaytlyn Tioe', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Creanova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 500, ranking: 4 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '950', trainee_name: 'Audrey Madison Loewe', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 480, ranking: 5 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100153', trainee_name: 'Dareen Azel Matthew Sembiring', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 480, ranking: 5 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100160', trainee_name: 'Klarissa Evania Buhari', membership_status: 'Active', level: 'Private', house: 'House of Reverion', class_name: 'Pearl', branch: 'CEMARA', total_gold: 460, ranking: 7 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100232', trainee_name: 'Kathrine Chrestella', membership_status: 'Active', level: 'Private', house: '', class_name: 'Pearl', branch: 'CEMARA', total_gold: 460, ranking: 7 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100098', trainee_name: 'Erland Sohilida Laia', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 455, ranking: 9 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '683', trainee_name: 'Stanley Ace Lorence', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Thenova', class_name: 'Tracy', branch: 'TIMOR', total_gold: 450, ranking: 10 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '1146', trainee_name: 'Charis Yafa Tobing', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Maxwell', branch: 'TIMOR', total_gold: 430, ranking: 11 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100160', trainee_name: 'Jordan Noel Yap', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Denver', branch: 'TRITURA', total_gold: 405, ranking: 12 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100190', trainee_name: 'Daphne Nathania Ang', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 370, ranking: 13 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100166', trainee_name: 'Farrin Rafania Shezan Lubis', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 360, ranking: 14 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100191', trainee_name: 'Yosihana Hutasoit', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 360, ranking: 14 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100028', trainee_name: 'Elaine Gwen Lim', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Quorion', class_name: 'Cairo', branch: 'TRITURA', total_gold: 340, ranking: 16 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100023', trainee_name: 'Evonne Gwen Lim', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 330, ranking: 17 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '809', trainee_name: 'Emilia Niko Nyoman', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Thenova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 320, ranking: 18 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '999', trainee_name: 'Annabelle Grace Wu', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 310, ranking: 19 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '1040', trainee_name: 'Shane Anastasya Kristy Simangunsong', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Graham', branch: 'TIMOR', total_gold: 310, ranking: 19 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100001', trainee_name: 'Rowan Maverick Ang', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Quartz', branch: 'CEMARA', total_gold: 310, ranking: 19 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100183', trainee_name: 'Heinz victorio zhou', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Emerald', branch: 'CEMARA', total_gold: 295, ranking: 22 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '255', trainee_name: 'Denzel Geraldo Wijaya', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 280, ranking: 23 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100059', trainee_name: 'Rebecca Florencia Siregar', membership_status: 'Active', level: 'Colonel', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 280, ranking: 23 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100156', trainee_name: 'Tengku Muhammad Malik Al Fatih', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 280, ranking: 23 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100174', trainee_name: 'Jerrick Onggoro Hakim', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Denver', branch: 'TRITURA', total_gold: 280, ranking: 23 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100055', trainee_name: 'Felicia Tham', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Quartz', branch: 'CEMARA', total_gold: 280, ranking: 23 },

  // ======================== ALL BRANCH - Youth (25 rows) ========================
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100078', trainee_name: 'Sakina Alima Regune Harahap', membership_status: 'Active', level: 'Lt. General', house: 'House of Thenova', class_name: 'Atlanta', branch: 'TRITURA', total_gold: 1400, ranking: 1 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '482', trainee_name: 'Reizo Kazuo Wong', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Havaria', class_name: 'Grande', branch: 'TIMOR', total_gold: 830, ranking: 2 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '896', trainee_name: 'Nicolas Carlie Kuwira', membership_status: 'Active', level: 'Lt. General', house: 'House of Havaria', class_name: 'Galileo', branch: 'TIMOR', total_gold: 620, ranking: 3 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100020', trainee_name: 'Winston Hubert', membership_status: 'Active', level: 'Lt. General', house: 'House of Thenova', class_name: 'Ruby', branch: 'CEMARA', total_gold: 570, ranking: 4 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100052', trainee_name: 'Darrel Hizkia Tambunan', membership_status: 'Active (Grace Period)', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Athens', branch: 'TRITURA', total_gold: 530, ranking: 5 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100206', trainee_name: 'Metta Louise ellen', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Azurite', branch: 'CEMARA', total_gold: 530, ranking: 5 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100143', trainee_name: 'Kaleb Edgar Goel Hasugian', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Auckland', branch: 'TRITURA', total_gold: 490, ranking: 7 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '803', trainee_name: 'Lovea Fendy Kho', membership_status: 'Active', level: 'Lt. General', house: 'House of Quorion', class_name: 'Grande', branch: 'TIMOR', total_gold: 460, ranking: 8 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '745', trainee_name: 'Jesslyn', membership_status: 'Active', level: 'General', house: 'House of Thenova', class_name: 'Galileo', branch: 'TIMOR', total_gold: 450, ranking: 9 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '442', trainee_name: 'Beatrys Vanesa Moiras', membership_status: 'Active (Grace Period)', level: 'Lt. General', house: 'House of Thenova', class_name: 'Kiyosaki', branch: 'TIMOR', total_gold: 440, ranking: 10 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '483', trainee_name: 'Jolie Charlotte Huang', membership_status: 'Active', level: 'Lt. General', house: '', class_name: 'Topaz', branch: 'CEMARA', total_gold: 440, ranking: 10 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100155', trainee_name: 'Stella Aprilia Sianipar', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Athens', branch: 'TRITURA', total_gold: 430, ranking: 12 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '48', trainee_name: 'Justin Maxwell', membership_status: 'Active (Grace Period)', level: 'General', house: 'House of Havaria', class_name: 'Millman', branch: 'TIMOR', total_gold: 400, ranking: 13 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '716', trainee_name: 'Chloe Vallerie Jie', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Reverion', class_name: 'Clinton', branch: 'TIMOR', total_gold: 400, ranking: 13 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100143', trainee_name: 'Jason Lewis Theo', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Azurite', branch: 'CEMARA', total_gold: 390, ranking: 15 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100153', trainee_name: 'Ethan Putra Gotama', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Ruby', branch: 'CEMARA', total_gold: 390, ranking: 15 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '872', trainee_name: 'Kenneth Samuel Lim', membership_status: 'Active (Grace Period)', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'DaVinci', branch: 'TIMOR', total_gold: 385, ranking: 17 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '1027', trainee_name: 'Elnino Jehanra Saragih', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'Spielberg', branch: 'TIMOR', total_gold: 360, ranking: 18 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100042', trainee_name: 'Jessica Sharon', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Athens', branch: 'TRITURA', total_gold: 360, ranking: 18 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100047', trainee_name: 'Keyzia Faiana Daulay', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Quorion', class_name: 'Almeria', branch: 'TRITURA', total_gold: 335, ranking: 20 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100127', trainee_name: 'Davin Bradford', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Azurite', branch: 'CEMARA', total_gold: 330, ranking: 21 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '767', trainee_name: 'Theodore Joachim Wihardjo', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Grande', branch: 'TIMOR', total_gold: 320, ranking: 22 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100200', trainee_name: 'Galent hansen wuner', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Azurite', branch: 'CEMARA', total_gold: 320, ranking: 22 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100046', trainee_name: 'Kirania Inara Azalea', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Almeria', branch: 'TRITURA', total_gold: 310, ranking: 24 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100097', trainee_name: 'Annabel Audriana', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Topaz', branch: 'CEMARA', total_gold: 310, ranking: 24 },
];

async function run() {
  console.log(`📊 Total rows to insert: ${data.length}`);
  console.log('🗑️  Truncating gold_point_rankings table...');
  
  await db.query('TRUNCATE TABLE gold_point_rankings RESTART IDENTITY CASCADE;');
  
  const valueRows = [];
  const queryParams = [];
  let paramIdx = 1;

  for (const r of data) {
    valueRows.push(`(
      $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
      $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++},
      $${paramIdx++}, $${paramIdx++}, NOW(), NOW()
    )`);
    queryParams.push(
      PERIOD, r.category, r.program, r.trainee_id, r.trainee_name,
      r.membership_status, r.level, r.house, r.class_name, r.branch,
      r.total_gold, r.ranking
    );
  }

  await db.query(`
    INSERT INTO gold_point_rankings (
      period, category, program, trainee_id, trainee_name,
      membership_status, level, house, class_name, branch,
      total_gold, ranking, created_at, updated_at
    )
    VALUES ${valueRows.join(',')}
    ON CONFLICT (period, category, program, trainee_id) DO NOTHING;
  `, queryParams);

  const countRes = await db.query('SELECT COUNT(*) FROM gold_point_rankings;');
  console.log(`✅ Done! Total rows in gold_point_rankings: ${countRes.rows[0].count}`);

  // Also export as JSON seed for auto-population
  const allRows = await db.query('SELECT * FROM gold_point_rankings ORDER BY program, ranking ASC;');
  const fs = require('fs');
  const path = require('path');
  
  const seedData = allRows.rows.map(r => ({
    period: r.period,
    category: r.category,
    program: r.program,
    trainee_id: r.trainee_id,
    trainee_name: r.trainee_name,
    membership_status: r.membership_status,
    level: r.level,
    house: r.house,
    class_name: r.class_name,
    branch: r.branch,
    total_gold: r.total_gold,
    ranking: r.ranking
  }));

  const seedJson = JSON.stringify(seedData, null, 2);
  
  // Write to all seed locations
  fs.writeFileSync(path.join(__dirname, 'seed_gold_point_rankings.json'), seedJson);
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'routes', 'seed_gold_point_rankings.json'), seedJson);
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'db', 'seed_gold_point_rankings.json'), seedJson);
  
  console.log(`📁 Seed JSON files updated with ${seedData.length} rows!`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
