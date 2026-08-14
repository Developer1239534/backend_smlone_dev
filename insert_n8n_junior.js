const { pool } = require('./src/db/neonClient');

const payloadJunior = [
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "1025", "nama_trainee": "Hermione Lovely Susanto", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Winfrey (Thursday 4-6)", "branch": "TIMOR", "total_gold": 490, "kategori": "Junior", "rank": 1 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "927", "nama_trainee": "Richela Stanlay", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Dale (Sat 4-6)", "branch": "TIMOR", "total_gold": 450, "kategori": "Junior", "rank": 2 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100023", "nama_trainee": "Evonne Gwen Lim", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Cairo", "branch": "TRITURA", "total_gold": 310, "kategori": "Junior", "rank": 3 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100061", "nama_trainee": "Colleen Blaine", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Quartz", "branch": "CEMARA", "total_gold": 295, "kategori": "Junior", "rank": 4 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100156", "nama_trainee": "Tengku Muhammad Malik Al Fatih", "status": "Active", "level": "Private", "house": "House of Havaria", "class": "Eldorado", "branch": "TRITURA", "total_gold": 295, "kategori": "Junior", "rank": 4 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "999", "nama_trainee": "Annabelle Grace Wu", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Lincoln", "branch": "TIMOR", "total_gold": 290, "kategori": "Junior", "rank": 6 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "988", "nama_trainee": "Gavyn Wijaya", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Maxwell", "branch": "TIMOR", "total_gold": 280, "kategori": "Junior", "rank": 7 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100098", "nama_trainee": "Erland Sohilida Laia", "status": "Active (Grace Period)", "level": "Sergeant", "house": "House of Thenova", "class": "Cairo", "branch": "TRITURA", "total_gold": 280, "kategori": "Junior", "rank": 7 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "604", "nama_trainee": "Hugo Viandi", "status": "Active (Grace Period)", "level": "Sergeant", "house": "House of Havaria", "class": "Robbins (Sat 1-3)", "branch": "TIMOR", "total_gold": 270, "kategori": "Junior", "rank": 9 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "874", "nama_trainee": "Muhammad Rafli Arkan", "status": "Active (Grace Period)", "level": "Sergeant", "house": "House of Thenova", "class": "Graham", "branch": "TIMOR", "total_gold": 270, "kategori": "Junior", "rank": 9 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100028", "nama_trainee": "Elaine Gwen Lim", "status": "Active", "level": "Lt. Colonel", "house": "House of Quorion", "class": "Cairo", "branch": "TRITURA", "total_gold": 265, "kategori": "Junior", "rank": 11 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "90100055", "nama_trainee": "Felicia Tham", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Quartz", "branch": "CEMARA", "total_gold": 250, "kategori": "Junior", "rank": 12 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "90100066", "nama_trainee": "Celine Oubre", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Quartz", "branch": "CEMARA", "total_gold": 245, "kategori": "Junior", "rank": 13 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "440", "nama_trainee": "Sofia Grace Wu", "status": "Active", "level": "Colonel", "house": "House of Creanova", "class": "Gladwell", "branch": "TIMOR", "total_gold": 240, "kategori": "Junior", "rank": 14 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "90100109", "nama_trainee": "Jolin Thianda", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Amethyst", "branch": "CEMARA", "total_gold": 240, "kategori": "Junior", "rank": 14 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "90100070", "nama_trainee": "Jack Austin Sia", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Quartz", "branch": "CEMARA", "total_gold": 235, "kategori": "Junior", "rank": 16 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "707", "nama_trainee": "Samho Gunawan", "status": "Active", "level": "Lt. Colonel", "house": "House of Thenova", "class": "Robbins (Sat 1-3)", "branch": "TIMOR", "total_gold": 230, "kategori": "Junior", "rank": 17 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "1155", "nama_trainee": "Howard Winston Louis", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Tracy (Sat 4-6)", "branch": "TIMOR", "total_gold": 230, "kategori": "Junior", "rank": 17 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100063", "nama_trainee": "Calysta Celorine Bakara", "status": "Active", "level": "Sergeant", "house": "House of Quorion", "class": "Eldorado", "branch": "TRITURA", "total_gold": 230, "kategori": "Junior", "rank": 17 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "858", "nama_trainee": "Delmond Osyan Sudilan", "status": "Active", "level": "Sergeant", "house": "House of Thenova", "class": "Mandela", "branch": "TIMOR", "total_gold": 220, "kategori": "Junior", "rank": 20 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "90100081", "nama_trainee": "Hayden Fredderick Halim", "status": "Active", "level": "Lt. Colonel", "house": "House of Havaria", "class": "Diamond", "branch": "CEMARA", "total_gold": 220, "kategori": "Junior", "rank": 20 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "638", "nama_trainee": "Chloe Olivia Ruslie", "status": "Active", "level": "Lt. Colonel", "house": "House of Quorion", "class": "Alexandrite", "branch": "CEMARA", "total_gold": 215, "kategori": "Junior", "rank": 22 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "939", "nama_trainee": "Rexcaden Jazper Shu", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Winfrey (Thursday 4-6)", "branch": "TIMOR", "total_gold": 215, "kategori": "Junior", "rank": 22 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "90100160", "nama_trainee": "Klarissa Evania Buhari", "status": "Active", "level": "Private", "house": "House of Reverion", "class": "Pearl", "branch": "CEMARA", "total_gold": 215, "kategori": "Junior", "rank": 22 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "1029", "nama_trainee": "Luna Antoinette Linne", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Winfrey (Thursday 4-6)", "branch": "TIMOR", "total_gold": 210, "kategori": "Junior", "rank": 25 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "1044", "nama_trainee": "Dominic Kie", "status": "Active (Grace Period)", "level": "Private", "house": "House of Quorion", "class": "Tracy (Sat 4-6)", "branch": "TIMOR", "total_gold": 210, "kategori": "Junior", "rank": 25 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "1135", "nama_trainee": "Cherysse Auryn Khobert", "status": "Active", "level": "Private", "house": "House of Havaria", "class": "Marley", "branch": "TIMOR", "total_gold": 210, "kategori": "Junior", "rank": 25 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100106", "nama_trainee": "Dareen Davinci Ginting", "status": "Active", "level": "Sergeant", "house": "House of Havaria", "class": "Denver", "branch": "TRITURA", "total_gold": 210, "kategori": "Junior", "rank": 25 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100192", "nama_trainee": "Kania Laviza Andhini", "status": "Active", "level": "Private", "house": "House of Thenova", "class": "Denver", "branch": "TRITURA", "total_gold": 0, "kategori": "Junior", "rank": 162 },
  { "group_key": "ALL_BRANCH_JUNIOR", "id": "70100193", "nama_trainee": "Nadhira Ayria Verdian", "status": "Active", "level": "Private", "house": "House of Havaria", "class": "Cairo", "branch": "TRITURA", "total_gold": 0, "kategori": "Junior", "rank": 162 }
];

async function insertJunior() {
  console.log(`Inserting ${payloadJunior.length} Junior trainees...`);
  for (let i = 0; i < payloadJunior.length; i++) {
    const item = payloadJunior[i];
    const id = String(item.id).trim();
    const name = String(item.nama_trainee).trim();
    const status = item.status || 'Active';
    const level = item.level || 'Sergeant';
    const house = item.house || 'House of Thenova';
    const className = item.class || 'Gladwell';
    const branch = item.branch || 'TIMOR';
    const totalGold = parseInt(item.total_gold || '0') || 0;
    const kategori = item.kategori || 'Junior';
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

  console.log('✅ Successfully inserted all 30 ALL_BRANCH_JUNIOR trainees into goldpoint_trainee table!');
  process.exit(0);
}

insertJunior();
