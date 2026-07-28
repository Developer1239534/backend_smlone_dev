const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

const rawTraineeData = `
70100098	Erland Sohilida Laia	13 August 2026	Active (Grace Period)	Junior/Youth Program	Cairo		House of Thenova	Sergeant
70100102	Bryan Taslim	13 December 2026	Active	Junior/Youth Program	Athens		House of Thenova	Sergeant
70100106	Dareen Davinci Ginting	26 July 2027	Active	Junior/Youth Program	Denver		House of Havaria	Sergeant
70100112	Fathi Arkan Wiyatmika	18 January 2027	Active	Junior/Youth Program	Atlanta		House of Havaria	Sergeant
70100113	Jiselle Hartanto	6 November 2026	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Private
70100117	Akhdan Arief Athaya	25 October 2026	Active	Junior/Youth Program	Asheville		House of Havaria	Sergeant
70100118	Cladys Nadine Frietania	18 December 2026	Active	Junior/Youth Program	Sherwood Forest			
70100121	Shane Anthony Jawson	13 October 2026	Active	Junior/Youth Program	Auckland		House of Quorion	Sergeant
70100122	Shadrina Azheema Lubis	19 September 2026	Active	Junior/Youth Program	Eldorado		House of Creanova	Sergeant
70100123	Shafiqa Adeeva Lubis	19 September 2026	Active	Junior/Youth Program	Eldorado		House of Thenova	Sergeant
70100126	Berliando Lovely Sihombing	18 December 2026	Active	Junior/Youth Program	Sherwood Forest			
70100127	Gabriel Ihut Martuaro Sihombing	12 September 2026	Active	Junior/Youth Program	Atlanta		House of Havaria	Sergeant
70100128	Syia Kim	12 December 2026	Active	Junior/Youth Program	Sherwood Forest			
70100130	Muhammad Rafa Al Siena	27 September 2026	Active	Junior/Youth Program	Auckland		House of Quorion	Sergeant
70100131	Clairine Bellvania Gavrila Ginting	18 December 2026	Active	Junior/Youth Program	Narnia			
70100133	Lionel Maverick 	25 April 2027	Active	Junior/Youth Program	Asheville		House of Havaria	Sergeant
70100134	Diandra Santika	18 October 2026	Active	Junior/Youth Program	Athens		House of Quorion	Sergeant
70100135	Adib Nufal Wibowo	1 October 2026	Active	Junior/Youth Program	Asheville		House of Thenova	Sergeant
70100136	Syakirah Khairani Jamilah	25 October 2026	Active	Junior/Youth Program	Asheville		House of Thenova	Private
70100139	Daniella Demeintieva	18 April 2027	Active	Junior/Youth Program	Auckland		House of Thenova	Sergeant
70100140	Gabriella Theofanny Putri Meliala	25 October 2026	Active	Junior/Youth Program	Asheville		House of Havaria	Sergeant
70100143	Kaleb Edgar Goel Hasugian	24 January 2027	Active	Junior/Youth Program	Auckland		House of Quorion	Sergeant
70100144	Faqih Fadhilah Wijaya	24 March 2027	Active	Junior/Youth Program	Asheville		House of Quorion	Private
70100145	Hafiqa Raikhsa Karo Karo	24 August 2026	Active (Grace Period)	Junior/Youth Program	Asheville		House of Havaria	Private
70100146	Alexa Brianna Tambunan	14 January 2027	Active	Junior/Youth Program	Almeria		House of Thenova	Private
70100147	Faza Kiyana Azdah	31 January 2027	Active	Junior/Youth Program	Athens		House of Thenova	Sergeant
70100148	Davina Elisha Ginting	30 July 2026	Active (Grace Period)	Junior/Youth Program	Atlanta		House of Havaria	Sergeant
70100149	Jaeson Nathan Yap	11 October 2026	Active	Junior/Youth Program	Auckland		House of Quorion	Private
70100150	Nadhira Calista Purba	10 October 2026	Active	Junior/Youth Program	Eldorado		House of Thenova	Private
70100151	Fakhira Idris Harahap	6 August 2026	Active (Grace Period)	Junior/Youth Program	Atlanta		House of Havaria	Private
70100152	Abigail Carissa 	30 July 2026	Active (Grace Period)	Junior/Youth Program	Atlanta		House of Thenova	Private
70100153	Dareen Azel Matthew Sembiring	6 February 2027	Active	Junior/Youth Program	Eldorado		House of Thenova	Private
70100154	Ashera Natama Sitorus	24 December 2026	Active	Junior/Youth Program	Sherwood Forest			
70100155	Stella Aprilia Sianipar 	28 August 2026	Active	Junior/Youth Program	Athens		House of Reverion	Sergeant
70100156	Tengku Muhammad Malik Al Fatih	27 August 2026	Active (Grace Period)	Junior/Youth Program	Eldorado		House of Havaria	Private
70100157	Faqhan Asshadiq Winata	7 October 2026	Active	Junior/Youth Program	Athens			Private
70100158	Gracelyn Patricia	6 September 2026	Active	Junior/Youth Program	Atlanta		House of Thenova	Sergeant
70100159	Nadia Fathaniah Chandra	10 October 2026	Active	Junior/Youth Program	Eldorado		House of Thenova	Private
70100160	Jordan Noel Yap	11 October 2026	Active	Junior/Youth Program	Denver		House of Thenova	Private
70100161	Khezya Queen Zareen Br Panggabean 	18 October 2026	Active	Junior/Youth Program	Auckland		House of Quorion	Private
70100162	Arya Satya	11 October 2026	Active	Junior/Youth Program	Asheville		House of Reverion	Private
70100165	Ghazia Raesha Afthani Lubis	18 January 2027	Active	Junior/Youth Program	Athens		House of Thenova	Private
70100166	Farrin Rafania Shezan Lubis	17 January 2027	Active	Junior/Youth Program	Eldorado		House of Havaria	Private
70100167	Arsa Clianta Saragih	8 January 2027	Active	Junior/Youth Program	Almeria		House of Quorion	Private
70100168	Mora Leticia Sinaga	8 January 2027	Active	Junior/Youth Program	Almeria		House of Creanova	Private
70100169	Warren Leander Wichael	1 February 2027	Active	Junior/Youth Program	Auckland		House of Reverion	Private
70100173	Muhammad Naufal Athariz Ritonga	12 December 2026	Active	Junior/Youth Program	Atlanta		House of Thenova	Private
70100174	Jerrick Onggoro Hakim	13 December 2026	Active	Junior/Youth Program	Denver		House of Thenova	Private
70100175	Ondo Vico Fidelis Giant Sitohang 	8 January 2027	Active	Junior/Youth Program	Almeria		House of Havaria	Private
70100176	Muhammad Asyam Haris Tanjung 	17 June 2027	Active	Junior/Youth Program	Cairo		House of Quorion	Private
70100177	Raphael Evan Hiro Ompusunggu	3 January 2027	Active	Junior/Youth Program	Sherwood Forest			
70100179	Doria Marchisia Giussevine Saragih	1 January 2027	Active	Junior/Youth Program	Cairo		House of Thenova	Private
70100180	Jevano Septarey Saragih	1 January 2027	Active	Junior/Youth Program	Cairo		House of Thenova	Private
70100184	Atha Malik Chairmawan	4 January 2027	Active	Junior/Youth Program	Denver		House of Thenova	Private
70100185	Alice Nathalie Brigitta	8 July 2027	Active	Junior/Youth Program	Almeria		House of Quorion	Private
70100186	Alvaro Gavriel Batara Sihotang	8 January 2027	Active	Junior/Youth Program	Cairo		House of Havaria	Private
70100187	Graccyella Martgehaan	11 January 2027	Active	Junior/Youth Program	Auckland		House of Quorion	Private
70100188	Latisya Naya Alamsyah Nasution	3 January 2027	Active	Junior/Youth Program	Eldorado		House of Thenova	Private
70100189	Lashira Naifa Alamsyah Nasution	3 January 2027	Active	Junior/Youth Program	Sherwood Forest			
70100190	Arta Glory Hutasoit	11 January 2027	Active	Junior/Youth Program	Auckland		House of Havaria	Private
70100191	Yosihana Hutasoit	8 January 2027	Active	Junior/Youth Program	Cairo		House of Thenova	Private
70100192	Kania Laviza Andhini	1 February 2027	Active	Junior/Youth Program	Denver		House of Thenova	Private
70100193	Nadhira Ayria Verdian	22 January 2027	Active	Junior/Youth Program	Cairo		House of Havaria	
70100194	Danella Christabel Hasean Saragih	31 December 2026	Active	Junior/Youth Program	Sherwood Forest			
`;

function getBranch(id) {
  if (id.startsWith('7') && id.length > 4) return 'tritura';
  if (id.startsWith('9') && id.length > 4) return 'cemara';
  const num = parseInt(id, 10);
  if (!isNaN(num) && num >= 1 && num <= 1500) return 'cp';
  return 'cp';
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

async function main() {
  await db.query(`
    ALTER TABLE portal_trainee 
    ADD COLUMN IF NOT EXISTS house VARCHAR(255);
  `);

  const lines = rawTraineeData.trim().split('\n');
  const seen = new Set();
  const trainees = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 2) continue;
    
    const id = parts[0];
    const name = parts[1];
    const expiryStr = parts[2] || null;
    const program = parts[4] || null;
    const className = parts[5] || null;
    const house = parts[7] || null;
    const level = parts[8] || null;

    if (!id || id === 'ID' || seen.has(id)) continue;
    seen.add(id);

    const expiryDate = parseDate(expiryStr) || expiryStr;
    const branch = getBranch(id);

    trainees.push({
      id,
      name,
      expiryDate,
      program,
      className,
      house,
      level,
      branch
    });
  }

  console.log(`🚀 Total Trainee Records to Import/Update: ${trainees.length}`);

  let updatedCount = 0;
  for (const t of trainees) {
    const plainPassword = `SML${t.id}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert into portal_trainee
    await db.query(`
      INSERT INTO portal_trainee 
        (trainee_id, name, membership_expired_date, program, class, house, level, branch_id, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (trainee_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, portal_trainee.name),
        membership_expired_date = COALESCE(EXCLUDED.membership_expired_date, portal_trainee.membership_expired_date),
        program = COALESCE(EXCLUDED.program, portal_trainee.program),
        class = COALESCE(EXCLUDED.class, portal_trainee.class),
        house = COALESCE(EXCLUDED.house, portal_trainee.house),
        level = COALESCE(EXCLUDED.level, portal_trainee.level),
        branch_id = COALESCE(portal_trainee.branch_id, EXCLUDED.branch_id),
        updated_at = NOW();
    `, [t.id, t.name, t.expiryDate, t.program, t.className, t.house, t.level, t.branch]);

    // Sync with login_trainee
    await db.query(`
      INSERT INTO login_trainee (student_id, password, plain_password, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (student_id) DO UPDATE SET
        password = EXCLUDED.password,
        plain_password = EXCLUDED.plain_password,
        updated_at = NOW();
    `, [t.id, hashedPassword, plainPassword]);

    updatedCount++;
  }

  console.log(`✅ Successfully updated ${updatedCount} trainee details in portal_trainee & login_trainee!`);
}

main().catch(err => {
  console.error('❌ Import error:', err);
  process.exit(1);
});
