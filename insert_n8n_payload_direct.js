const { pool } = require('./src/db/neonClient');

const payload = [
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100112", "nama_trainee": "Fathi Arkan Wiyatmika", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Atlanta", "branch": "TRITURA", "total_gold": 850, "kategori": "Youth", "rank": "1" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100076", "nama_trainee": "Marwa Alya Sakinah Rangkuti", "status": "Active", "level": "Lt. Colonel", "house": "House of Thenova", "class": "Athens", "branch": "TRITURA", "total_gold": 760, "kategori": "Youth", "rank": "2" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "90100176", "nama_trainee": "Rahma Nakita Afifah", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Atlanta", "branch": "TRITURA", "total_gold": 560, "kategori": "Youth", "rank": "3" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "716", "nama_trainee": "Chloe Vallerie Jie", "status": "Active (Grace Period)", "level": "Lt. Colonel", "house": "House of Reverion", "class": "Clinton (Fri 3-5)", "branch": "TIMOR", "total_gold": 540, "kategori": "Youth", "rank": "4" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "850", "nama_trainee": "Karin Destynsia", "status": "Active (Grace Period)", "level": "Lt. Colonel", "house": "House of Thenova", "class": "DaVinci", "branch": "TIMOR", "total_gold": 495, "kategori": "Youth", "rank": "5" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100151", "nama_trainee": "Fakhira Idris Harahap", "status": "Active (Grace Period)", "level": "Private", "house": "House of Havaria", "class": "Atlanta", "branch": "TRITURA", "total_gold": 490, "kategori": "Youth", "rank": "6" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100148", "nama_trainee": "Davina Elisha Ginting", "status": "Active (Grace Period)", "level": "Private", "house": "House of Havaria", "class": "Atlanta", "branch": "TRITURA", "total_gold": 470, "kategori": "Youth", "rank": "7" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100005", "nama_trainee": "Lyvia Verlynn", "status": "Active", "level": "Lt. Colonel", "house": "House of Thenova", "class": "Almeria", "branch": "TRITURA", "total_gold": 450, "kategori": "Youth", "rank": "8" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100135", "nama_trainee": "Adib Nufal Wibowo", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Asheville", "branch": "TRITURA", "total_gold": 440, "kategori": "Youth", "rank": "9" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "1033", "nama_trainee": "Shelvina Howie", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Canfield", "branch": "TIMOR", "total_gold": 430, "kategori": "Youth", "rank": "10" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100173", "nama_trainee": "Muhammad Naufal Athariz Ritonga", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Atlanta", "branch": "TRITURA", "total_gold": 400, "kategori": "Youth", "rank": "11" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100070", "nama_trainee": "Keysha Kania Ramaditya", "status": "Active", "level": "Lt. Colonel", "house": "House of Reverion", "class": "Asheville", "branch": "TRITURA", "total_gold": 380, "kategori": "Youth", "rank": "12" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100047", "nama_trainee": "Keyzia Faiana Daulay", "status": "Active", "level": "Lt. Colonel", "house": "House of Quorion", "class": "Almeria", "branch": "TRITURA", "total_gold": 370, "kategori": "Youth", "rank": "13" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "90100020", "nama_trainee": "Winston Hubert", "status": "Active", "level": "Colonel", "house": "House of Thenova", "class": "Ruby", "branch": "CEMARA", "total_gold": 370, "kategori": "Youth", "rank": "14" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "90100206", "nama_trainee": "Metta Louise ellen", "status": "Active", "level": "Private", "house": "House of Havaria", "class": "Azurite", "branch": "CEMARA", "total_gold": 340, "kategori": "Youth", "rank": "15" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100127", "nama_trainee": "Gabriel Ihut Martuaro Sihombing", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Atlanta", "branch": "TRITURA", "total_gold": 330, "kategori": "Youth", "rank": "16" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "90100112", "nama_trainee": "Richie Alvaro Tandinata", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Azurite", "branch": "CEMARA", "total_gold": 320, "kategori": "Youth", "rank": "17" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "90100127", "nama_trainee": "Davin Bradford", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Azurite", "branch": "CEMARA", "total_gold": 310, "kategori": "Youth", "rank": "18" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "880", "nama_trainee": "Joel Edward", "status": "Active (Grace Period)", "level": "Lt. Colonel", "house": "House of Havaria", "class": "Gates (Sat 10-12)", "branch": "TIMOR", "total_gold": 300, "kategori": "Youth", "rank": "19" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "90100083", "nama_trainee": "Filbert Laithen", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Ruby", "branch": "CEMARA", "total_gold": 300, "kategori": "Youth", "rank": "20" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100078", "nama_trainee": "Sakina Alima Regune Harahap", "status": "Active", "level": "Colonel", "house": "House of Thenova", "class": "Atlanta", "branch": "TRITURA", "total_gold": 290, "kategori": "Youth", "rank": "21" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "90100056", "nama_trainee": "Thalissha Yeonan", "status": "Active", "level": "Sergeant", "house": "House of Quorion", "class": "Ruby", "branch": "CEMARA", "total_gold": 290, "kategori": "Youth", "rank": "22" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "1144", "nama_trainee": "Kayla Shilyn Gani", "status": "Active", "level": "Private", "house": "House of Havaria", "class": "Millman (Sat 1-3)", "branch": "TIMOR", "total_gold": 280, "kategori": "Youth", "rank": "23" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "48", "nama_trainee": "Justin Maxwell", "status": "Active", "level": "General", "house": "House of Havaria", "class": "Millman (Sat 1-3)", "branch": "TIMOR", "total_gold": 270, "kategori": "Youth", "rank": "24" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "896", "nama_trainee": "Nicolas Carlie Kuwira", "status": "Active", "level": "Colonel", "house": "House of Havaria", "class": "Galileo (Wed 4-6)", "branch": "TIMOR", "total_gold": 270, "kategori": "Youth", "rank": "25" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "1027", "nama_trainee": "Elnino Jehanra Saragih", "status": "Active", "level": "Sergeant", "house": "House of Creanova", "class": "Spielberg (Sat 4-6)", "branch": "TIMOR", "total_gold": 270, "kategori": "Youth", "rank": "26" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100188", "nama_trainee": "Latisya Naya Alamsyah Nasution", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Eldorado", "branch": "TRITURA", "total_gold": 0, "kategori": "Youth", "rank": "162" },
  { "group_key": "ALL_BRANCH_YOUTH", "id": "70100191", "nama_trainee": "Yosihana Hutasoit", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Cairo", "branch": "TRITURA", "total_gold": 0, "kategori": "Youth", "rank": "162" }
];

async function insertAll() {
  console.log(`Inserting ${payload.length} trainees into goldpoint_trainee table...`);

  for (let i = 0; i < payload.length; i++) {
    const item = payload[i];
    const id = String(item.id).trim();
    const name = String(item.nama_trainee).trim();
    const status = item.status || 'Active';
    const level = item.level || 'Sergeant';
    const house = item.house || 'House of Thenova';
    const className = item.class || 'Gladwell';
    const branch = item.branch || 'TIMOR';
    const totalGold = parseInt(item.total_gold || '0') || 0;
    const kategori = item.kategori || 'Youth';
    const rank = parseInt(item.rank || '0') || (i + 1);

    const queryText = `
      INSERT INTO goldpoint_trainee 
        (id, nama_trainee, status, level, house, class, branch, total_gold_periode, gp_month, kategori, rank, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET
        nama_trainee = EXCLUDED.nama_trainee,
        status = EXCLUDED.status,
        level = EXCLUDED.level,
        house = EXCLUDED.house,
        class = EXCLUDED.class,
        branch = EXCLUDED.branch,
        total_gold_periode = EXCLUDED.total_gold_periode,
        gp_month = EXCLUDED.gp_month,
        kategori = EXCLUDED.kategori,
        rank = EXCLUDED.rank,
        updated_at = NOW();
    `;

    await pool.query(queryText, [id, name, status, level, house, className, branch, totalGold, totalGold, kategori, rank]);
  }

  console.log('✅ Successfully inserted all 28 trainees from n8n into goldpoint_trainee table!');
  process.exit(0);
}

insertAll();
