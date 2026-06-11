require('dotenv').config();
const db = require('../src/db/neonClient');

const trituraRaw = `Gabriella Theofanny Putri Meliala	Asheville	Havaria	TRUE
Hafiqa Raikhsa	Asheville	Havaria	TRUE
Faqih Fadhilah Wijaya 	Asheville	Quorion	TRUE
Akhdan Arief Athaya	Asheville	Havaria	TRUE
Syakirah Khairani Jamilah	Asheville	Thenova	TRUE
Lionel Maverick 	Asheville 	Havaria	TRUE
Arya Satya	Asheville. 	Reverion	TRUE
Jessica Sharon	Athens	Havaria	TRUE
Dewi Syaahira Sabina Siregar	Athens	Quorion	TRUE
Faza Kiyana Azdah	Athens	Thenova	TRUE
Diandra Ezra N Simatupang	Athens	Havaria	TRUE
Bryan Taslim	Athens	Thenova	TRUE
Andrea Tabitha Florencia Simatupang	Athens	Creanova	TRUE
Diandra Santika	Athens	Quorion	TRUE
Darrel Hizkia Tambunan	Athens	Thenova	TRUE
Stella Aprilia Sianipar	Athens	Reverion	TRUE
Radinka Agra Sitepu	Athens	Quorion	TRUE
Kaleb Edgar Goel Hasugian	Athens	Quorion	TRUE
Lyvia Verlynn	Atlanta	Thenova	TRUE
Gracelyn Patricia	Atlanta	Thenova	TRUE
Davina Elisha Ginting	Atlanta	Havaria	TRUE
Kirania Inara Azalea	Atlanta	Thenova	TRUE
Gabriel Ihut Martuaro Sihombing 	Atlanta	Havaria	TRUE
Marwa Alya Sakinah Rangkuti 	Atlanta	Thenova	TRUE
Abigail Carissa Wurara	Atlanta	Thenova	TRUE
Fathi Arkan Wiyatmika	Atlanta	Havaria	TRUE
Fakhira Idris Harahap	Atlanta	Havaria	TRUE
Rahma Nakita Afifah	Atlanta	Thenova	TRUE
Keysha Kania Ramaditya 	Atlanta 	Reverion	TRUE
Sakina Regune	Atlanta Class	Thenova	TRUE
Daniel Gih	Auckland	Thenova	TRUE
Khezya Queen Zareen Br. Panggabean	Auckland	Quorion	TRUE
Muhammad Rafa Al Siena	Auckland	Quorion	TRUE
Daniella Demeintieva	Auckland	Thenova	TRUE
Shane Anthony Jawson	Auckland	Quorion	TRUE
Jaeson Nathan Yap	Auckland 	Quorion	TRUE
Adib Nufal Wibowo	Cairo	Thenova	TRUE
Keyzia Faiana Daulay	Cairo	Quorion	TRUE
Nichole Hasan 	Cairo	Thenova	TRUE
Evonne Gwen Lim	Cairo	Thenova	TRUE
Elaine Gwen Lim	Cairo	Quorion	TRUE
Erland Sohilida Laia	Cairo	Thenova	TRUE
Nathan Immanuel Winanto	Denver	Havaria	TRUE
Maryam. Shareen  Anandifa	Denver	Havaria	TRUE
Raisha Adila Gunawan	Denver	Creanova	TRUE
Dareen Davinci Ginting	Denver	Havaria	TRUE
Jordan Noel Yap 	Denver	Thenova	TRUE
Annisa Letizia Shanum	Eldorado	Reverion	TRUE
Shafiqa Adeeva Lubis	Eldorado	Thenova	TRUE
Dareen Azel Matthew Sembiring	Eldorado	Thenova	TRUE
Nadia Fathaniah Chandra	Eldorado	Thenova	TRUE
Muhammad Al Khawarizmi Fairel	Eldorado	Thenova	TRUE
Rachel Nathania Christine Situmorang	Eldorado	Creanova	TRUE
Rebecca Florencia Siregar	Eldorado	Havaria	TRUE
Calysta Celorine Bakara	Eldorado	Quorion	TRUE
Nadhira Calista Purba	Eldorado	Thenova	TRUE
Alexa Brianna Tambunan	Eldorado	Thenova	TRUE
Shadrina Azheema Lubis	Eldoraldo	Creanova	TRUE
Tengku Muhammad Malik Al Fatih	Elorado	Havaria	TRUE
Maro Louis Dear Purba	Kairo	Thenova`;

const cemaraRaw = `Daphne Nathania Ang	Aexandrite	Thenova
Denzel Geraldo Wijaya	Alexandrite	Reverion
Chloe Olivia Ruslie	Alexandrite	Quorion
Rebecca Kelly Ashari 	Alexandrite	Thenova
Feliks Ananda Lee	Alexandrite	Havaria
Shane Ferrucio Lim	Alexandrite	Havaria
Bianca Olivia Ruslie	Alexandrite	Thenova
Harvey Susanto	Alexandrite	Havaria
Finn Maxwell	Alexandrite	Havaria
Tyra Louise Tohnika	Alexandrite	Thenova
Alvyn Zhu	Alvyn	Reverion
Alfred Smaver Tanasal	Amber	Thenova
Enzo Howell	Amber	Thenova
Trevor Toh	Amber	Reverion
Patricia Loh	Amber	Thenova
Bryant Maximus Ling	Amber	Thenova
Josh Andrew	Amber	Thenova
Lincolnblaine 	Amber	Havaria
Chloe Marche Khu	Amerald	Quorion
Vergio Gavino Chaikoff	Amethst	Havaria
Jolin Thianda	Amethyst	Thenova
Velove Alexa Winstan	Amethyst	Creanova
Miho Qohnita Sihombing	Amethyst	Reverion
Dustin Bradley	Amethyst	Havaria
William	Amethyst	Havaria
David Howard	Amethyst	Thenova
Jadellyne Gretchenagata Zhuotio 	Amethyst 	Creanova
Kate Elizabeth Huang 	Amethyst 	Thenova
Metta Louise Ellen	Azurite	Havaria
Jason Lewis Theo	Azurite	Quorion
Davin Bradford	Azurite	Thenova
Richie Alvaro Tandinata	Azurite	Thenova
Galent Hansen Wuner	Azurite	Quorion
Gita Junika Pasaribu	Cro	Thenova
Feodora Meidy Leandra	Diamond	Havaria
Chloe Quisha Anggara	Diamond	Thenova
Hannah Sophia Salim	Diamond	Thenova
Ʝєσνєηηα ¢Αηgιє	Diamond	Havaria
Emily Moraine Hakim	Diamond 	Thenova
Natasha Clairine Wu	Ember	Quorion
Jeneiro Joe	Emerald	Havaria
Alexandra Joan Micheline 	Emerald	Creanova
Heinz Victorio Zhou	Emerald	Thenova
Aidan Benjamin Yapar	Emerald	Thenova
Jarell Hofang	Emerald	Havaria
Eric Williarn	Emerald	Creanova
Janessa Hofang	Emerald	Thenova
Jayden Jiefferson	Emerald	Havaria
Alvin Syahroni	Ho	Thenova
Valentino Owen Liu	Jade	Thenova
Carlos Ferdinand Putra	Jade	Thenova
Valentino Owen Liu	Jade	Thenova
Emily Santo	Jade	Havaria
Ixchel Lowell Tankiono	Jade	Creanova
Ryan Aurelio Bustamin	Jade	Havaria
Callista Aurelia Alven	Jade Class	Havaria
Jovan Leonard Lui	Jovan Leonard Lui	Havaria
Khairiy Raka Azizi Hermansyah	Obsidian	Thenova
Felice Vallerie Angkasa	Obsidian	Creanova
Louis Kendrick	Obsidian	Thenova
Olson Arfayo	Obsidian	Reverion
Louis Adrian	Obsidian	Quorion
Tiffany Toh	Obsidian	Thenova
Carlen Edeline Boru Keliat	Obsidian	Havaria
Omcom	Obsidian	Reverion
Valerie Legolas Cen	Obsidian	Havaria
Elaine Gabriella Chandella 	Obsidian 	Thenova
Faulina Theresia Pangaribuan 	Obsidian 	Creanova
Jasmine Zhang	Pearl	Quorion
Felynn Holy Richson	Pearl	Thenova
Carlton Kho	Pearl	Havaria
Vyon Wynter Huang	Pearl	Thenova
Klarissa	Pearl	Reverion
Enrico Victorian	Pearl	Havaria
Enrico Victorian	Pearl	Havaria
Madelyn Henryetta Fang	Pearl	Havaria
Nicole Anastasia 	Pearl 	Havaria
George	Quart2	Thenova
Celine Oubre 	Quartz	Thenova
Vincenzo	Quartz	Thenova
Jack Austin Sia	Quartz	Thenova
Samantha Clarine Wu	Quartz	Thenova
Felicia Tham	Quartz	Thenova
Maxwell Tenar	Quartz	Thenova
Rowan Maverick Ang	Quartz	Thenova
Jayden Jingga	Ruby	Thenova
Jeanice Wu	Ruby	Quorion
Tang En Xin	Ruby	Quorion
Candice Julian Sakiwa 	Ruby	Reverion
Warren Emanuel	Ruby	Creanova
Carrick Classico	Ruby	Reverion
Ethan Putra Gotama	Ruby	Havaria
Jordan Philip Wihono	Ruby	Thenova
Filbert Laithen	Ruby	Havaria
Darren Gabriel Wijaya	Ruby	Reverion
Justin Nawi	Ruby	Creanova
Thalissha Yeonan	Ruby	Quorion
Jesslyn Lee	Ruby	Thenova
Rowan Tirta Lee	Ruby	Havaria
Sergio Garcia Ang	Ruby	Creanova
Winston Hubert 	Ruby And Sapphire	Thenova
Rodrick Stefano Halim	Saphire	Havaria
Vrederick Benaricco Tanjaya	Sapphire	Thenova
Jayden Zhang	Sapphire	Thenova
Rainie Lynn	Sapphire	Havaria
Gillian Natalie Wilfred	Sapphire	Quorion
Nathan Archie Gunawan	Sapphire	Thenova
Emmeline Aurelia Lie	Sapphire	Creanova
Winston Hubert	Sapphire 	Thenova
Otto Valerino Lim	Sapphire 	Thenova
Uttika Anisya	Staff	Quorion
Jordan Swiss Cliftan 	Topaz	Quorion
Bosco Lim	Topaz	Quorion
Jocelyn Sydney	Topaz	Reverion
Jacqueline Vallerie Chen	Topaz	Havaria
Annabel Audriana	Topaz	Quorion
Giselle Liandy	Topaz	Quorion
Vanessa Cangie	Topaz	Havaria
Jolie Charlotte Huang	Topaz	Havaria
Victor Alexander Winstan	Topaz	Thenova
Phebe Lalita	Topaz	Quorion`;

const cpRaw = `Kellyn Chandra 	Apsley	Quorion
Timothy Anwi Panca 	Canfield	Creanova
Gracia Tiffany Susanto	Canfield	Thenova
Devon Jau	Canfield	Creanova
Felicia Liangso	Canfield	Thenova
Elaine Clemence Annabell 	Canfield	Havaria
Chloe Taydey	Canfield	Reverion
Reagan Khei Subroto	Canfield	Quorion
Shelvina Howie	Canfield	Havaria
Joey Frederica Ang	Chesterfield	Havaria
Charrelle Anthony	Clinton	Creanova
Cayden Louis Auwrich	Clinton	Quorion
Queensya Lovely	Clinton	Thenova
Jacques Lewinsky	Clinton	Thenova
Fransisca 	Clinton	Quorion
Chloe Vallerie Jie	Clinton	Reverion
Silvario Soedidjo	Clinton	Thenova
Alqueenza Syifa Winona	Clinton	Thenova
Kayden Ethan Zhou	Clinton	Thenova
Clairine Joshanley	Clinton	Thenova
Rayden Chiang	Da Vinci	Thenova
Hazel Natalie Ten	Dale	Havaria
Elaine Viandi	Dale	Havaria
Richela Stanlay	Dale	Thenova
Louis Xavier Leonardi	Dale	Thenova
Zac Aldrich Mayor	Dale	Thenova
Ethan Moeritz	Dale	Thenova
Karin Destynsia	Davinci	Thenova
Ethan Kenny	Davinci	Thenova
Jovin Limcoln	Davinci	Havaria
Yamin Yenardo	Davinci	Creanova
Grace Alexandra	Davinci	Havaria
Hillary Calista Tamado Panjaitan	Davinci	Thenova
Filia Cielo Lim	Davinci	Thenova
Felicia Ivana Silalahi	Davinci	Creanova
Kenneth Lim	Davinci 	Creanova
Winston Lawrence	Doyle	Reverion
Jayxen Maxwell 	Doyle	Havaria
Evelynn Lee	Doyle	Thenova
Gwyneth Louisa Yap	Doyle	Creanova
Mike Louis Wijaya	Doyle	Thenova
Vierra Cleevany Ryu	Doyle	Thenova
Gwyneth Louisa Yap 	Doyle	Creanova
Mavin Jericho Phen	Doyle	Reverion
Caren Pandiago	Doyle	Thenova
Galang Roland Besch 	Doyle	Havaria
Rafaelsitorus6@Gmail.Com	Doyle	Havaria
Clarissa Fredelyn Jeoh	Doyle	Thenova
Angelina Cenata	Doyle	Creanova
Cellistia Cangdiago	Galileo	Quorion
Vallerio	Galileo	Thenova
Abbygael Mikaela Tangelyn	Galileo	Quorion
Brayden Lisman	Galileo	Quorion
Nicolas Carlie Kuwira	Galileo	Havaria
Meivellynn Thamida 	Galileo	Thenova
Jesslyn Osei Wijaya 	Galileo	Thenova
Callista Aurelia Tasma 	Galileo 	Thenova
Howie Leonard Wijaya	Galileo Wednesday 4-6	Havaria
Elnino Jehanra Saragih	Gandhi	Creanova
Ethan Aldrich Lie	Gandhi	Havaria
Stephanie Evelyn Luo	Gandhi	Thenova
Aca Raymond Tjemerlang	Gandhi	Creanova
Nayyara Ayaskara Prakasita	Gandhi	Quorion
Caitlyn Allison Yaphen 	Gandhi	Havaria
Yeslin Yap	Gandhi	Thenova
Cherryl Riquelme Potan	Gandhi	Havaria
Naafa Maisyva Ginting	Gandhi	Havaria
Kendrick Melvern Djohan	Gates	Reverion
Josh Seravino Zhang	Gates	Quorion
Chloe Aurelia Ten	Gates	Quorion
Fiona Jolys Chong	Gates	Havaria
Clarissa Olivia Anne Lammora Panjaitan	Gates	Havaria
Kenward Melvern Djohan	Gates	Havaria
Ufaira Tiandra Dalimunthe 	Gates	Thenova
Zia Arafa Khairina	Gates	Thenova
Valerie Ivana Chen	Gates	Quorion
Morgan Valentino Lowis 	Gates	Thenova
Aubree Lisman 	Ghandi	Thenova
Hardey Moledoki Law	Ghandi	Reverion
Yasmina Athirah Rifqi 	Gladwell	Creanova
Arthur Alexander Hakim	Gladwell	Thenova
Qori Putri Syahviah	Gladwell	Thenova
Queency Joycelyn Yieginia 	Gladwell	Havaria
Abigail Hazel Tamin	Gladwell	Havaria
Malcolm Archer Tjhin	Gladwell	Quorion
Harvardo Lovenzo Susanto	Gladwell	Havaria
Harvey Oliver Lee	Gladwell	Thenova
Federico Fredelyn Jeoh	Gladwell	Havaria
Sofia Grace Wu 	Gladwell 	Creanova
M. Rafly Arkan	Graham	Thenova
_Jordan Tanutama	Graham	Quorion
Renzo Tanaka	Graham	Thenova
Shane Anastasya Kristy Simangunsong	Graham	Thenova
Audrey Hartono Lee	Graham	Creanova
Naomi Grace Edward	Graham	Havaria
Fredella Alexa	Graham	Quorion
Claudine Joshanley	Graham	Creanova
Mandy Ellen Sanusi	Graham	Creanova
Jillian Claire Kuanrius	Graham	Thenova
Ashley Claire Lorence	Graham	Thenova
Clarissa Kho	Graham 	Thenova
Theodore Joachim Wihardjo	Grande	Havaria
Richelle Zheng	Grande	Thenova
Reizo Kazuo Wong	Grande	Havaria
Grace Anastasia Zeng	Grande	Havaria
Maria Jill Lumbantoruan	Grande	Thenova
Celine Angeline Yiandri 	Grande	Havaria
Lovea Fendy Kho	Grande	Quorion
Carlsen Simen	Grande	Reverion
Lovea Fendy Kho	Grande	Quorion
Kent Nanda Daruma	Grande	Quorion
Venesia Anggini Purba 	Grande 	Reverion
Ethan Ray Maxwell 	Grande (Thu 4-6 Pm)	Thenova
Sydney Princessa Lim	Kiyosaki	Quorion
Harvey Wijaya	Kiyosaki	Creanova
Natalie Willeen Zhang	Kiyosaki	Thenova
Beatrys Vanesa Moiras	Kiyosaki	Thenova
Nicholas Tjin	Kiyosaki	Thenova
Davina Grace Ong	Kiyosaki	Thenova
Kenichi Zhou	Kiyosaki	Thenova
Vivienne Zheng	Kiyosaki	Quorion
Clarence Aurelia Colim	Kiyosaki	Reverion
Cedric Damon Yago	Kiyosaki	Quorion
Vinxiero Carrick Francoiz	Kiyosaki	Thenova
Senny Chairani	Lincoln	Thenova
Efrata Iskandar Liunardi 	Lincoln	Havaria
Garrix Ardent Putra	Lincoln	Havaria
Audrey Madison Loewe	Lincoln	Havaria
Joanne Lynch	Lincoln	Reverion
Safira Reynia Hanum	Lincoln	Quorion
Emilia Niko Nyoman	Lincoln	Thenova
Finn Aldrich Luman	Lincoln	Thenova
Annabelle Grace Wu	Lincoln	Thenova
Clairine Angela Indrjaya	Lincoln	Reverion
Leia Kaytlyn Tioe	Lincoln	Creanova
Yazeed Abizar Rifqi	Lincoln 	Havaria
Florencia Hewi	Mandela	Quorion
Annabella Wijaya	Mandela	Thenova
Delmond Osyan Sudilan	Mandela	Thenova
Brandon Tiojaya	Mandela	Creanova
Abigail Rhea Lim 	Mandela	Havaria
Louis Clinton Chai	Mandela	Thenova
Gracielle Grace Ong	Mandela	Havaria
Felicia Grace 	Mandela	Thenova
Kendrick Eoghan	Mandela	Quorion
Ananda Putera Ngadiman	Mandela	Havaria
Joequinn Felysse Warsono 	Mandela 	Thenova
Liam John Rickson	Marley	Creanova
Cherysse Auryn Khobert	Marley	Havaria
Nicole Lee	Marley	Quorion
Talysha Sri Nayla	Marley	Thenova
Calista Kasih Aprilia Harahap	Marley	Reverion
Philippe Benedict Zhuang	Marly	Havaria
Olivia Tjoa	Maxewell	Thenova
Charis Yafa Tobing	Maxwell	Thenova
Gavyn Wijaya	Maxwell	Thenova
Alesha Sofia Andihka	Maxwell	Thenova
Modric Agusta Daruam	Maxwell	Thenova
Caren Axella Natania Lumbantoruan	Maxwell	Thenova
Joey Milan Phen	Maxwell	Thenova
James Ananda Wijaya	Maxwell	Thenova
Aileen Sophie Kesuma	Maxwell	Thenova
Fiorenza Eleanor Wijaya	Millman	Havaria
Justin Maxwell	Millman	Havaria
Chaden Ettienne Halim	Millman	Quorion
Jasmine Yenarti	Millman	Creanova
Yasmin Fadhila Azzakiyah	Millman	Thenova
Wilbert Wijaya	Millman	Quorion
Sharleen Velicia Lim	Millman	Havaria
Davar Aly Harahap	Millman	Quorion
Kayla Shilyn Gani	Millman	Havaria
Victoria Cenata	Millman Class	Thenova
Rayden Oh	Miss Devina	Thenova
Adeline Njo	Ms Loita And Ms Bila	Havaria
Meuthia Gadiza	Ms. Ghaitsa	Thenova
Gracelyn Yap	Ms. Yona	Quorion
Mulyanita Br Damanik	Narnia	Thenova
Lady Valery Sinambela 	Newton	Creanova
Elaine Velicia	Newton	Quorion
Efraim Lucas Dimitri	Newton	Thenova
Angeline Felice Theo	Newton	Havaria
Ezio Lim	Newton	Quorion
Christian Anderson Lee	Newton	Havaria
Wallace Evencio	Newton	Thenova
Trevor Hartono Lee	Newton	Creanova
Trevor Hartono Lee	Newton	Thenova
Roselie Kirana Wijaya	Newton	Creanova
Jason Allen Tjoa	Newton	Quorion
Annabella Himeko Winarta	Newton 	Thenova
Hugo Viandi	Robbins	Havaria
Healey Tjoe	Robbins	Quorion
Kiery Keionna Kie	Robbins	Havaria
Kelly Alyse Tanary	Robbins	Havaria
Mikaella Huetteleigh Ng	Robbins	Thenova
Gisella Nyoto	Robbins	Havaria
Reagan Nyoto	Robbins	Havaria
Keona Jaileynn Lawrence	Robbins	Havaria
Samho Gunawan 	Robbins	Thenova
Reagan Thierry Wijaya 	Robbins 	Thenova
Arthur Floyd Salim	Senny Chairani	Thenova
Theona Zefanya Purba	Sigmund	Havaria
Edric Luiz Ongka	Sigmund	Reverion
Fresia Victoria Chendry	Sigmund	Thenova
Kim Megumi 	Sigmund	Quorion
Josevin Carel Hamdani	Sigmund	Quorion
Javerson Joshua Tobing	Sigmund	Thenova
Brandon Chiang	Sigmund	Quorion
Valisha Sofi Tjandra	Sigmund	Havaria
Dyra Muntaz Sirah	Sigmund Class	Havaria
Michael Thamida 	Sigmund Class	Thenova
Aaron Goldwin Semarak 	Sir Ricky Tionardy	Havaria
Candyce Valezka Moiras	Spielberg	Havaria
Jollyn Felicia Wong	Spielberg	Havaria
Darryl Raynold Leowe	Spielberg	Thenova
Fiona Candiof	Spielberg	Havaria
Richmond Osyan Sudilan	Spielberg	Quorion
Zoefiker Putera Ngadiman	Spielberg	Reverion
Candice Winardi Wong	Spielberg	Havaria
Nicholas Zheng	Spielberg	Havaria
Khoo Shu Han	Spirlberg	Reverion
Rakha	Tes	Thenova
Arya Kho	Tracy	Quorion
Madelyn Odelia Lowis	Tracy	Thenova
Stanley Ace Lorence	Tracy	Thenova
Reynara Amber Koiman	Tracy	Reverion
Ayska Najya Prakasita	Tracy	Thenova
Keigo Kusumo Soh	Tracy	Reverion
Hogan Chan	Tracy	Thenova
Howard Winston Louis	Tracy	Thenova
Maxen Zo Leon	Tracy	Havaria
Howie Chan	Tracy	Thenova
Erick Winner Teo	Tracy	Thenova
Owen Linwood	Tracy	Thenova
Victoria Yap	Tracy	Thenova
Jiselle Hartanto	Tracy	Thenova
Ricky Tionardy	Trainer	Creanova
Hermione Lovely Susanto	Winfrey	Havaria
Russell William Tanner	Winfrey	Quorion
Cherlyn Simen	Winfrey	Quorion
Luna Antoinette Linne	Winfrey	Havaria
Rexcaden Jazper Shu	Winfrey	Havaria
Bonita Gaudeti Sinaga	Winfrey	Quorion
Dominic Kie	Winfrey	Quorion
Jayden Tarmidi	Winfrey 	Havaria
Gywen Stefani Wiley	Ziglar	Thenova
Fredericka Sigalingging	Ziglar	Quorion
Carine Susanto Lie	Ziglar	Havaria`;

// Helper to parse a raw string, de-duplicate by name (case-insensitive key)
function parseGroup(rawText, cabangName) {
  const map = new Map();
  const lines = rawText.trim().split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 3) continue;

    // Clean name
    let name = parts[0].trim();
    // Clean class (strip trailing dots, clean whitespace)
    let className = parts[1].trim();
    if (className.endsWith('.')) {
      className = className.slice(0, -1).trim();
    }
    // Clean house
    let house = parts[2].trim();

    if (!name) continue;

    // Key is name in lowercase to de-duplicate case-insensitively
    const key = name.toLowerCase().replace(/\s+/g, ' ');
    if (!map.has(key)) {
      map.set(key, {
        originalName: name,
        class: className,
        house: house,
        cabang: cabangName
      });
    }
  }
  return map;
}

(async () => {
  try {
    console.log('🔄 Parsing raw text...');
    const trituraMap = parseGroup(trituraRaw, 'TRITURA');
    const cemaraMap = parseGroup(cemaraRaw, 'CEMARA');
    const cpMap = parseGroup(cpRaw, 'TIMOR'); // CP corresponds to TIMOR branch

    // Combine all mappings
    // Rule: "jika ada nama yang sama itu pilih satu yaa"
    // We combine maps. If there are duplicates across branches, we pick the first one we find.
    const allTrainees = new Map();
    
    const addAll = (map) => {
      for (const [key, val] of map.entries()) {
        if (!allTrainees.has(key)) {
          allTrainees.set(key, val);
        } else {
          console.log(`⚠️ Duplicate name found and skipped: "${val.originalName}" in branch ${val.cabang}`);
        }
      }
    };

    addAll(trituraMap);
    addAll(cemaraMap);
    addAll(cpMap);

    console.log(`✅ Loaded ${allTrainees.size} unique trainees from lists.`);

    // 1. Set class and house_sml to NULL for ALL trainees in DB first
    console.log('🔄 Resetting class and house_sml to NULL for all trainees in DB...');
    const resetResult = await db.query('UPDATE dashboard_trainne SET class = NULL, house_sml = NULL');
    console.log(`✅ Reset ${resetResult.rowCount} rows in database.`);

    // 2. Fetch all trainees in the DB to match their names case-insensitively
    console.log('🔄 Fetching trainees from database...');
    const dbTraineesResult = await db.query('SELECT id, trainee_name FROM dashboard_trainne');
    const dbTrainees = dbTraineesResult.rows;

    let matchCount = 0;
    let failCount = 0;
    const matchedIds = new Set();

    const nameAliases = {
      "hafiqa raikhsa": "Hafiqa Raikhsa Karo Karo",
      "diandra ezra n simatupang": "Diandra Ezra Nauli Simatupang",
      "abigail carissa wurara": "Abigail Carissa",
      "sakina regune": "Sakina Alima Regune Harahap",
      "rachel nathania christine situmorang": "Rachel Nathania Situmorang",
      "miho qohnita sihombing": "Miho Qanitah Sihombing",
      "william": "William Lauda",
      "jadellyne gretchenagata zhuotio": "Jadellyne Gretchenagatha Zhuotio",
      "Ʝєσνєηηα ¢Αηgιє": "Jeovenna Cangie",
      "carlen edeline boru keliat": "Carlen Edeline Br. Keliat",
      "samantha clarine wu": "Samantha Clairine Wu",
      "darren gabriel wijaya": "Darren Gabriel",
      "jolie charlotte huang": "Jolie Huang",
      "queensya lovely": "Queensya Lovely Reya",
      "ethan kenny": "Ethan Kenny Daruma",
      "kenneth lim": "Kenneth Samuel Lim",
      "hardey moledoki law": "Hardey Moeldoko Law",
      "m. rafly arkan": "Muhammad Rafli Arkan",
      "fredella alexa": "Fredella Alexa Maranggi Siregar",
      "cedric damon yago": "Cedric Yago",
      "clairine angela indrjaya": "Clairine Angela Indrajaya",
      "felicia grace": "Felicia Grace Ong",
      "alesha sofia andihka": "Alesha Sofia Andhika",
      "modric agusta daruam": "Modric Agusta Daruma",
      "annabella himeko winarta": "Annabela Himeko Winarta",
      "mikaella huetteleigh ng": "Mikaella Hutteleigh Ng",
      "josevin carel hamdani": "Josevin Carel H.",
      "keigo kusumo soh": "Keigo Kusuno Soh",
      "gywen stefani wiley": "Gywen Stefanie Wiley",
      "daniel gih": "Daniel Goh",
      "patricia loh": "Patricia",
      "klarissa": "Klarissa Evania Buhari",
      "rafaelsitorus6@gmail.com": "Rafael Maximillian Sitorus",
      "malcolm archer tjhin": "Malcolm"
    };

    // We iterate over the database trainees and try to find a match in our parsed list.
    // This handles minor spacing/case differences.
    for (const dbTrainee of dbTrainees) {
      const dbNameKey = dbTrainee.trainee_name.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Let's also check if name has a trailing dot or dot inside (like 'Maryam. Shareen  Anandifa' in list)
      // We will match both exact key and a dotless/special character cleaned key.
      const getCleanKey = (s) => s.replace(/[^a-zA-Z0-9]/g, '');
      const dbCleanKey = getCleanKey(dbNameKey);

      let matchedData = allTrainees.get(dbNameKey);
      
      if (!matchedData) {
        // Fallback 1: try to match via clean alphanumeric keys
        for (const [key, val] of allTrainees.entries()) {
          if (getCleanKey(key) === dbCleanKey) {
            matchedData = val;
            break;
          }
        }
      }

      if (!matchedData) {
        // Fallback 2: try to match via manual aliases mapping
        for (const [aliasKey, targetDbName] of Object.entries(nameAliases)) {
          const cleanAliasDbName = getCleanKey(targetDbName.toLowerCase().replace(/\s+/g, ' ').trim());
          if (dbCleanKey === cleanAliasDbName) {
            matchedData = allTrainees.get(aliasKey.toLowerCase().replace(/\s+/g, ' ').trim());
            if (matchedData) break;
          }
        }
      }

      if (matchedData) {
        // Update database row
        await db.query(
          `UPDATE dashboard_trainne 
           SET class = $1, house_sml = $2, cabang = $3 
           WHERE id = $4`,
          [matchedData.class, matchedData.house, matchedData.cabang, dbTrainee.id]
        );
        matchedIds.add(dbTrainee.id);
        matchCount++;
      } else {
        // Not in our lists, it remains class = NULL and house_sml = NULL (which we already reset above)
        failCount++;
      }
    }

    console.log(`✅ Update complete: matched and updated ${matchCount} trainees.`);
    console.log(`ℹ️ ${failCount} database trainees were not in the provided lists (and thus their class/house remain NULL).`);

    // Let's check which trainees from the user lists were NOT matched in the DB
    console.log('🔍 Checking if any trainees in lists are missing from DB...');
    let missingFromDbCount = 0;
    for (const [key, val] of allTrainees.entries()) {
      const getCleanKey = (s) => s.replace(/[^a-zA-Z0-9]/g, '');
      const cleanListKey = getCleanKey(key);

      let foundInDb = dbTrainees.some(d => {
        const cleanDbKey = getCleanKey(d.trainee_name.toLowerCase().replace(/\s+/g, ' ').trim());
        return cleanDbKey === cleanListKey;
      });

      if (!foundInDb && nameAliases[key]) {
        const targetDbName = nameAliases[key];
        const cleanTargetDbName = getCleanKey(targetDbName.toLowerCase().replace(/\s+/g, ' ').trim());
        foundInDb = dbTrainees.some(d => {
          const cleanDbKey = getCleanKey(d.trainee_name.toLowerCase().replace(/\s+/g, ' ').trim());
          return cleanDbKey === cleanTargetDbName;
        });
      }

      if (!foundInDb) {
        console.log(`❌ Trainee in list but NOT found in DB: "${val.originalName}" (${val.class} - ${val.house} - ${val.cabang})`);
        missingFromDbCount++;
      }
    }
    console.log(`ℹ️ Missing from DB total: ${missingFromDbCount} trainees.`);

  } catch (err) {
    console.error('❌ Error updating houses:', err);
  } finally {
    await db.pool.end();
    console.log('🔌 DB connection closed.');
  }
})();
