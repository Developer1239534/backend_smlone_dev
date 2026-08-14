require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const rawInput = `
[ALL BRANCH]		Junior						27		TOP 25 	[ALL BRANCH]		Youth							26		TOP 25 	TIMOR		Junior						25		25		TOP 25 	TIMOR		Youth									27		TOP 25 	TRITURA		Junior										25		TOP 25 	TRITURA		Youth											25		TOP 25 	CEMARA		Junior												26		TOP 25 	CEMARA		YOUTH													25
Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth	RANK/ID		ID	Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth		RANK/ID		ID	Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth	RANK/ID		RANK/ID		ID	Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth				RANK/ID		ID	Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth					RANK/ID		ID	Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth						RANK/ID		ID	Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth							RANK/ID		ID	Nama Trainee	Active/Expired	Level	House	Class	Branch	Total Gold/Periode	Junior/Youth								RANK/ID
Sofia Grace Wu	Active	Lt. General	House of Creanova	Gladwell	TIMOR	890	Junior	1		70100078	Sakina Alima Regune Harahap	Active (Grace Period)	Lt. General	House of Thenova	Atlanta	TRITURA	1400	Youth		1		440	Sofia Grace Wu	Active	Lt. General	House of Creanova	Gladwell	TIMOR	890	Junior	1		1		482	Reizo Kazuo Wong	Active	Colonel	House of Havaria	Grande (Thu 4-6 PM)	TIMOR	830	Youth		2		1		70100153	Dareen Azel Matthew Sembiring	Active	Private	House of Thenova	Eldorado	TRITURA	480	Junior	4				1		70100078	Sakina Alima Regune Harahap	Active (Grace Period)	Lt. General	House of Thenova	Atlanta	TRITURA	1400	Youth		1				1		90100138	Vyon Wynter Huang	Active	Sergeant	House of Thenova	Pearl	CEMARA	710	Junior	2						1		90100020	Winston Hubert	Active	Lt. General	House of Thenova	Ruby	CEMARA	570	Youth		4						1
Vyon Wynter Huang	Active	Sergeant	House of Thenova	Pearl	CEMARA	710	Junior	2		482	Reizo Kazuo Wong	Active	Colonel	House of Havaria	Grande (Thu 4-6 PM)	TIMOR	830	Youth		2		950	Audrey Madison Loewe	Active	Private	House of Havaria	Lincoln	TIMOR	480	Junior	4		2		896	Nicolas Carlie Kuwira	Active	Lt. General	House of Havaria	Galileo (Wed 4-6)	TIMOR	620	Youth		3		2		70100098	Erland Sohilida Laia	Active (Grace Period)	Sergeant	House of Thenova	Cairo	TRITURA	455	Junior	8				2		70100052	Darrel Hizkia Tambunan	Active (Grace Period)	Lt. Colonel	House of Thenova	Athens	TRITURA	530	Youth		5				2		90100005	Felynn Holy Richson	Active	Lt. Colonel	House of Thenova	Pearl	CEMARA	545	Junior	3						2		90100206	Metta Louise ellen	Active	Sergeant	House of Havaria	Beryl	CEMARA	530	Youth		5						2
Felynn Holy Richson	Active	Lt. Colonel	House of Thenova	Pearl	CEMARA	545	Junior	3		896	Nicolas Carlie Kuwira	Active	Lt. General	House of Havaria	Galileo (Wed 4-6)	TIMOR	620	Youth		3		683	Stanley Ace Lorence	Active (Grace Period)	Colonel	House of Thenova	Tracy (Sat 4-6)	TIMOR	450	Junior	9		3		803	Lovea Fendy Kho	Active (Grace Period)	Lt. General	House of Quorion	Grande (Thu 4-6 PM)	TIMOR	460	Youth		8		3		70100160	Jordan Noel Yap	Active	Private	House of Thenova	Denver	TRITURA	405	Junior	11				3		70100143	Kaleb Edgar Goel Hasugian	Active	Sergeant	House of Quorion	Auckland	TRITURA	490	Youth		7				3		90100160	Klarissa Evania Buhari 	Active	Private	House of Reverion	Pearl	CEMARA	460	Junior	6						3		483	Jolie Charlotte Huang	Active	Lt. General		Topaz	CEMARA	440	Youth		10						3
Audrey Madison Loewe	Active	Private	House of Havaria	Lincoln	TIMOR	480	Junior	4		90100020	Winston Hubert	Active	Lt. General	House of Thenova	Ruby	CEMARA	570	Youth		4		1146	Charis Yafa Tobing	Active	Private	House of Thenova	Maxwell	TIMOR	430	Junior	10		4		745	Jesslyn	Active	General	House of Thenova	Galileo (Wed 4-6)	TIMOR	450	Youth		9		4		70100166	Farrin Rafania Shezan Lubis	Active	Private	House of Havaria	Eldorado	TRITURA	360	Junior	13				4		70100155	Stella Aprilia Sianipar 	Active	Sergeant	House of Reverion	Athens	TRITURA	430	Youth		11				4		90100232	Kathrine Chrestella	Active	Private		Pearl	CEMARA	460	Junior	6						3		90100143	Jason Lewis Theo	Active	Sergeant	House of Quorion	Azurite	CEMARA	390	Youth		14						4
Dareen Azel Matthew Sembiring	Active	Private	House of Thenova	Eldorado	TRITURA	480	Junior	4		70100052	Darrel Hizkia Tambunan	Active (Grace Period)	Lt. Colonel	House of Thenova	Athens	TRITURA	530	Youth		5		809	Emilia Niko Nyoman	Active	Private	House of Thenova	Lincoln	TIMOR	320	Junior	17		5		48	Justin Maxwell	Active (Grace Period)	General	House of Havaria	Millman (Sat 1-3)	TIMOR	400	Youth		12		5		70100191	Yosihana Hutasoit	Active	Private	House of Thenova	Cairo	TRITURA	360	Junior	13				4		70100042	Jessica Sharon	Active	Lt. Colonel	House of Havaria	Athens	TRITURA	360	Youth		18				5		90100190	Daphne Nathania Ang	Active	Private	House of Thenova	Alexandrite	CEMARA	370	Junior	12						5		90100153	Ethan Putra Gotama	Active	Sergeant	House of Havaria	Ruby	CEMARA	390	Youth		14						4
Klarissa Evania Buhari 	Active	Private	House of Reverion	Pearl	CEMARA	460	Junior	6		90100206	Metta Louise ellen	Active	Sergeant	House of Havaria	Beryl	CEMARA	530	Youth		5		999	Annabelle Grace Wu	Active	Sergeant	House of Thenova	Lincoln	TIMOR	310	Junior	18		6		716	Chloe Vallerie Jie	Active	Lt. Colonel	House of Reverion	Clinton (Fri 3-5)	TIMOR	400	Youth		12		5		70100028	Elaine Gwen Lim	Active	Lt. Colonel	House of Quorion	Cairo	TRITURA	340	Junior	15				6		70100047	Keyzia Faiana Daulay	Active	Lt. Colonel	House of Quorion	Almeria	TRITURA	335	Youth		19				6		90100001	Rowan Maverick Ang	Active	Sergeant	House of Thenova	Quartz	CEMARA	310	Junior	18						6		90100127	Davin Bradford	Active (Grace Period)	Sergeant	House of Thenova	Azurite	CEMARA	330	Youth		20						6
Kathrine Chrestella	Active	Private		Pearl	CEMARA	460	Junior	6		70100143	Kaleb Edgar Goel Hasugian	Active	Sergeant	House of Quorion	Auckland	TRITURA	490	Youth		7		1040	Shane Anastasya Kristy Simangunsong	Active	Sergeant	House of Thenova	Graham	TIMOR	310	Junior	18		6		1027	Elnino Jehanra Saragih	Active	Lt. Colonel	House of Creanova	Spielberg (Sat 4-6)	TIMOR	390	Youth		14		7		70100023	Evonne Gwen Lim	Active	Sergeant	House of Thenova	Cairo	TRITURA	330	Junior	16				7		70100046	Kirania Inara Azalea	Active	Lt. Colonel	House of Thenova	Almeria	TRITURA	310	Youth		23				7		90100183	Heinz victorio zhou	Active	Private	House of Thenova	Emerald	CEMARA	295	Junior	21						7		90100200	Galent hansen wuner	Active	Private	House of Quorion	Azurite	CEMARA	320	Youth		21						7
Erland Sohilida Laia	Active (Grace Period)	Sergeant	House of Thenova	Cairo	TRITURA	455	Junior	8		803	Lovea Fendy Kho	Active (Grace Period)	Lt. General	House of Quorion	Grande (Thu 4-6 PM)	TIMOR	460	Youth		8		955	Naomi Grace Edward	Active	Sergeant	House of Havaria	Graham	TIMOR	290	Junior	22		8		872	Kenneth Samuel Lim	Active (Grace Period)	Lt. Colonel	House of Creanova	DaVinci	TIMOR	385	Youth		17		8		70100059	Rebecca Florencia Siregar	Active	Colonel	House of Havaria	Eldorado	TRITURA	280	Junior	23				8		70100134	Diandra Santika	Active	Sergeant	House of Quorion	Athens	TRITURA	300	Youth		25				8		255	Denzel Geraldo Wijaya	Active	Sergeant	House of Reverion	Alexandrite	CEMARA	280	Junior	23						8		90100097	Annabel Audriana	Active	Sergeant	House of Quorion	Topaz	CEMARA	310	Youth		23						8
Stanley Ace Lorence	Active (Grace Period)	Colonel	House of Thenova	Tracy (Sat 4-6)	TIMOR	450	Junior	9		745	Jesslyn	Active	General	House of Thenova	Galileo (Wed 4-6)	TIMOR	450	Youth		9		763	Safira Reynia Hanum	Active	Private	House of Quorion	Lincoln	TIMOR	270	Junior	28		9		767	Theodore Joachim Wihardjo	Active	Sergeant	House of Havaria	Grande (Thu 4-6 PM)	TIMOR	320	Youth		21		9		70100156	Tengku Muhammad Malik Al Fatih	Active (Grace Period)	Private	House of Havaria	Eldorado	TRITURA	280	Junior	23				8		70100168	Mora Leticia Sinaga	Active	Private	House of Creanova	Almeria	TRITURA	260	Youth		31				9		90100055	Felicia Tham	Active	Sergeant	House of Thenova	Quartz	CEMARA	280	Junior	23						8		90100080	Vanessa Cangie	Active	Lt. Colonel	House of Havaria	Topaz	CEMARA	290	Youth		27						9
Charis Yafa Tobing	Active	Private	House of Thenova	Maxwell	TIMOR	430	Junior	10		483	Jolie Charlotte Huang	Active	Lt. General		Topaz	CEMARA	440	Youth		10		927	Richela Stanlay	Active	Sergeant	House of Thenova	Dale (Sat 4-6)	TIMOR	250	Junior	32		10		442	Beatrys Vanesa Moiras	Active	Lt. General	House of Thenova	Kiyosaki (Sat 4-6)	TIMOR	300	Youth		25		10		70100174	Jerrick Onggoro Hakim	Active	Private	House of Thenova	Denver	TRITURA	280	Junior	23				8		70100020	Diandra Ezra Nauli Simatupang	Active	Lt. Colonel	House of Havaria	Athens	TRITURA	250	Youth		32				10		639	Bianca Olivia Ruslie	Active	Sergeant	House of Thenova	Alexandrite	CEMARA	270	Junior	28						10		602	Alexandra Joan Micheline	Active	Colonel	House of Creanova	Jade	CEMARA	265	Youth		30						10
Jordan Noel Yap	Active	Private	House of Thenova	Denver	TRITURA	405	Junior	11		70100155	Stella Aprilia Sianipar 	Active	Sergeant	House of Reverion	Athens	TRITURA	430	Youth		11		857	Hogan Chan	Active	Lt. Colonel	House of Thenova	Tracy (Sat 4-6)	TIMOR	240	Junior	35		11		904	Callista Aurelia Tasma	Active	Colonel	House of Thenova	Galileo (Wed 4-6)	TIMOR	290	Youth		27		11		70100090	Annisa Letizia Shanum	Active	Sergeant	House of Reverion	Eldorado	TRITURA	270	Junior	28				11		70100130	Muhammad Rafa Al Siena	Active	Sergeant	House of Quorion	Auckland	TRITURA	240	Youth		33				11		90100081	Hayden Fredderick Halim	Active	Lt. Colonel	House of Havaria	Diamond	CEMARA	270	Junior	28						10		90100217	CHARLIE MIKKELSEN YAP	Active	Private	House of Thenova	Azurite	CEMARA	240	Youth		33						11
Daphne Nathania Ang	Active	Private	House of Thenova	Alexandrite	CEMARA	370	Junior	12		48	Justin Maxwell	Active (Grace Period)	General	House of Havaria	Millman (Sat 1-3)	TIMOR	400	Youth		12		784	Garrix Ardent Putra	Active	Private	House of Havaria	Lincoln	TIMOR	220	Junior	41		12		1034	Cherryl Riquelme Potan	Active	Sergeant	House of Havaria	Gandhi	TIMOR	280	Youth		29		12		70100122	Shadrina Azheema Lubis	Active	Sergeant	House of Creanova	Eldorado	TRITURA	250	Junior	32				12		70100019	Andrea Tabitha Florencia Simatupang	Active	Lt. Colonel	House of Creanova	Athens	TRITURA	230	Youth		40				12		90100044	Velove Alexa Winstan	Active	Lt. Colonel	House of Creanova	Amethyst	CEMARA	250	Junior	32						12		90100236	WINSTON XAVERIUS JUNIO	Active	Private	House of Creanova	Azurite	CEMARA	240	Youth		33						11
Farrin Rafania Shezan Lubis	Active	Private	House of Havaria	Eldorado	TRITURA	360	Junior	13		716	Chloe Vallerie Jie	Active	Lt. Colonel	House of Reverion	Clinton (Fri 3-5)	TIMOR	400	Youth		12		995	Qori Putri Syahviah	Active	Sergeant	House of Thenova	Gladwell	TIMOR	210	Junior	42		13		285	Clairine Joshanley	Active	Colonel	House of Thenova	Clinton (Fri 3-5)	TIMOR	240	Youth		33		13		70100186	Alvaro Gavriel Batara Sihotang	Active	Private	House of Havaria	Cairo	TRITURA	235	Junior	37				13		70100117	Akhdan Arief Athaya	Active	Sergeant	House of Havaria	Asheville	TRITURA	230	Youth		40				12		90100004	Jeovenna Cangie	Active	Lt. Colonel	House of Havaria	Diamond	CEMARA	240	Junior	35						13		90100068	Ixchel Lowell Tankiono	Active	Sergeant	House of Creanova	Jade	CEMARA	220	Youth		43						13
Yosihana Hutasoit	Active	Private	House of Thenova	Cairo	TRITURA	360	Junior	13		1027	Elnino Jehanra Saragih	Active	Lt. Colonel	House of Creanova	Spielberg (Sat 4-6)	TIMOR	390	Youth		14		865	Victoria Yap	Active	Lt. Colonel	House of Thenova	Tracy (Sat 4-6)	TIMOR	200	Junior	46		14		741	Brayden Lisman	Active	Colonel	House of Quorion	Galileo (Wed 4-6)	TIMOR	240	Youth		33		13		70100188	Latisya Naya Alamsyah Nasution	Active	Private	House of Thenova	Eldorado	TRITURA	225	Junior	39				14		70100185	Alice Nathalie Brigitta	Active	Private	House of Quorion	Almeria	TRITURA	230	Youth		40				12		90100235	Hermione Emmilia Artjim	Active	Private		Emerald	CEMARA	230	Junior	38						14		90100002	Giselle Liandy	Active	Lt. Colonel	House of Quorion	Topaz	CEMARA	200	Youth		51						14
Elaine Gwen Lim	Active	Lt. Colonel	House of Quorion	Cairo	TRITURA	340	Junior	15		90100143	Jason Lewis Theo	Active	Sergeant	House of Quorion	Azurite	CEMARA	390	Youth		14		989	Federico Fredelyn Jeoh	Active	Sergeant	House of Havaria	Gladwell	TIMOR	200	Junior	46		14		1077	Alqueenza Syifa Winona	Active	Sergeant	House of Thenova	Clinton (Fri 3-5)	TIMOR	240	Youth		33		13		70100159	Nadia Fathaniah Chandra	Active	Private	House of Thenova	Eldorado	TRITURA	210	Junior	42				15		70100135	Adib Nufal Wibowo	Active	Sergeant	House of Thenova	Asheville	TRITURA	220	Youth		43				15		1081	Carlton Kho	Active	Private	House of Havaria	Pearl	CEMARA	225	Junior	39						15		90100056	Thalissha Yeonan	Active	Sergeant	House of Quorion	Ruby	CEMARA	200	Youth		51						14
Evonne Gwen Lim	Active	Sergeant	House of Thenova	Cairo	TRITURA	330	Junior	16		90100153	Ethan Putra Gotama	Active	Sergeant	House of Havaria	Ruby	CEMARA	390	Youth		14		751	Howie Chan	Active	Colonel	House of Thenova	Tracy (Sat 4-6)	TIMOR	190	Junior	48		16		738	Adeline Njo	Active	Lt. Colonel	House of Havaria	DaVinci	TIMOR	235	Youth		39		16		70100004	Maryam Shareen Anandifa	Active	Lt. Colonel	House of Havaria	Denver	TRITURA	190	Junior	48				16		70100121	Shane Anthony Jawson	Active	Sergeant	House of Quorion	Auckland	TRITURA	210	Youth		47				16		90100148	Kei Evander Buhari 	Active	Sergeant	House of Reverion	Diamond	CEMARA	210	Junior	42						16		90100221	Ryan Aurelio Bustamin	Active	Private	House of Havaria	Jade	CEMARA	190	Youth		58						16
Emilia Niko Nyoman	Active	Private	House of Thenova	Lincoln	TIMOR	320	Junior	17		872	Kenneth Samuel Lim	Active (Grace Period)	Lt. Colonel	House of Creanova	DaVinci	TIMOR	385	Youth		17		859	Clarissa Kho	Active	Private	House of Thenova	Graham	TIMOR	190	Junior	48		16		675	Maxen Zo Leon	Active	Lt. Colonel	House of Havaria	Gates (Sat 10-12)	TIMOR	220	Youth		43		17		70100179	Doria Marchisia Giussevine Saragih	Active	Private	House of Thenova	Cairo	TRITURA	190	Junior	48				16		70100127	Gabriel Ihut Martuaro Sihombing	Active	Sergeant	House of Havaria	Atlanta	TRITURA	210	Youth		47				16		490	Shane Ferrucio Lim	Active	Lt. Colonel	House of Havaria	Alexandrite	CEMARA	202	Junior	45						17		90100022	Jeanice Wu	Active	Sergeant	House of Quorion	Ruby	CEMARA	180	Youth		61						17
Annabelle Grace Wu	Active	Sergeant	House of Thenova	Lincoln	TIMOR	310	Junior	18		70100042	Jessica Sharon	Active	Lt. Colonel	House of Havaria	Athens	TRITURA	360	Youth		18		988	Gavyn Wijaya	Active	Sergeant	House of Thenova	Maxwell	TIMOR	190	Junior	48		16		1164	Felicia Ivana Silalahi	Active	Private	House of Creanova	DaVinci	TIMOR	220	Youth		43		17		70100193	Nadhira Ayria Verdian	Active		House of Havaria	Cairo	TRITURA	180	Junior	54				18		70100136	Syakirah Khairani Jamilah	Active	Private	House of Thenova	Asheville	TRITURA	210	Youth		47				16		90100070	Jack Austin Sia	Active	Private	House of Thenova	Quartz	CEMARA	190	Junior	48						18		90100082	Tang En Xin	Active	Sergeant	House of Quorion	Ruby	CEMARA	180	Youth		61						17
Shane Anastasya Kristy Simangunsong	Active	Sergeant	House of Thenova	Graham	TIMOR	310	Junior	18		70100047	Keyzia Faiana Daulay	Active	Lt. Colonel	House of Quorion	Almeria	TRITURA	335	Youth		19		726	Renzo Tanaka	Active	Lt. Colonel	House of Thenova	Graham	TIMOR	180	Junior	54		19		680	Gracelyn Yap	Active	Lt. General	House of Quorion	Galileo (Wed 4-6)	TIMOR	210	Youth		47		19		70100064	Rachel Nathania Situmorang	Active (Grace Period)	Sergeant	House of Creanova	Eldorado	TRITURA	160	Junior	63				19		70100076	Marwa Alya Sakinah Rangkuti	Active	Lt. Colonel	House of Thenova	Athens	TRITURA	200	Youth		51				19		90100108	Vergio Gavino Chaikoff	Active	Private	House of Havaria	Amethyst	CEMARA	180	Junior	54						19		868	Sergio Garcia Ang	Active	Lt. Colonel	House of Creanova	Beryl	CEMARA	160	Youth		74						19
Rowan Maverick Ang	Active	Sergeant	House of Thenova	Quartz	CEMARA	310	Junior	18		90100127	Davin Bradford	Active (Grace Period)	Sergeant	House of Thenova	Azurite	CEMARA	330	Youth		20		942	Elaine Viandi	Active	Sergeant	House of Havaria	Dale (Sat 4-6)	TIMOR	180	Junior	54		19		141	Russell William Tanner	Active	Colonel	House of Quorion	DaVinci	TIMOR	200	Youth		51		20		70100150	Nadhira Calista Purba	Active	Private	House of Thenova	Eldorado	TRITURA	150	Junior	67				20		70100144	Faqih Fadhilah Wijaya	Active	Private	House of Quorion	Asheville	TRITURA	200	Youth		51				19		90100024	Welceline Charissa Tsjin	Active (Grace Period)	Sergeant	House of Thenova	Diamond	CEMARA	160	Junior	63						20		90100067	Victor Alexander Winstan	Active	Sergeant	House of Thenova	Beryl	CEMARA	160	Youth		74						19
Heinz victorio zhou	Active	Private	House of Thenova	Emerald	CEMARA	295	Junior	21		767	Theodore Joachim Wihardjo	Active	Sergeant	House of Havaria	Grande (Thu 4-6 PM)	TIMOR	320	Youth		21		1010	Gracielle Grace Ong	Active (Grace Period)	Private	House of Havaria	Mandela	TIMOR	180	Junior	54		19		1039	Naafa Maisyva Ginting	Active	Sergeant	House of Havaria	Gandhi	TIMOR	200	Youth		51		20		70100180	Jevano Septarey Saragih	Active	Private	House of Thenova	Cairo	TRITURA	150	Junior	67				20		70100147	Faza Kiyana Azdah	Active	Sergeant	House of Thenova	Athens	TRITURA	180	Youth		61				21		90100116	Janessa Hofang	Active	Private	House of Thenova	Diamond	CEMARA	155	Junior	66						21		90100036	Carlos Ferdinand Putra	Active	Sergeant	House of Thenova	Jade	CEMARA	145	Youth		82						21
Naomi Grace Edward	Active	Sergeant	House of Havaria	Graham	TIMOR	290	Junior	22		90100200	Galent hansen wuner	Active	Private	House of Quorion	Azurite	CEMARA	320	Youth		21		811	Arthur Floyd Salim	Active	Private	House of Thenova	Lincoln	TIMOR	170	Junior	59		22		1161	Randa Miracle Boasly Sihombing	Active	Private		Galileo (Wed 4-6)	TIMOR	200	Youth		51		20		70100123	Shafiqa Adeeva Lubis	Active	Sergeant	House of Thenova	Eldorado	TRITURA	140	Junior	75				22		70100149	Jaeson Nathan Yap	Active	Private	House of Quorion	Auckland	TRITURA	180	Youth		61				21		90100010	Chloe Marjorie Wen	Active	Sergeant	House of Thenova	Diamond	CEMARA	130	Junior	82						22		329	Vrederick Benaricco Tanjaya	Active (Grace Period)	Colonel	House of Thenova	Sapphire	CEMARA	140	Youth		83						22
Denzel Geraldo Wijaya	Active	Sergeant	House of Reverion	Alexandrite	CEMARA	280	Junior	23		70100046	Kirania Inara Azalea	Active	Lt. Colonel	House of Thenova	Almeria	TRITURA	310	Youth		23		1019	Louis Clinton Chai	Active	Private	House of Thenova	Mandela	TIMOR	170	Junior	59		22		274	Candice Winardi Wong	Active	Colonel	House of Havaria	Spielberg (Sat 4-6)	TIMOR	190	Youth		58		23		70100106	Dareen Davinci Ginting	Active	Sergeant	House of Havaria	Denver	TRITURA	120	Junior	91				23		70100005	Lyvia Verlynn	Active (Grace Period)	Colonel	House of Thenova	Almeria	TRITURA	170	Youth		68				23		90100011	Chloe Quisha Anggara	Active	Sergeant	House of Thenova	Diamond	CEMARA	130	Junior	82						22		90100204	Chloe Wong	Active	Private	House of Havaria	Jade	CEMARA	135	Youth		86						23
Rebecca Florencia Siregar	Active	Colonel	House of Havaria	Eldorado	TRITURA	280	Junior	23		90100097	Annabel Audriana	Active	Sergeant	House of Quorion	Topaz	CEMARA	310	Youth		23		1060	Zac Aldrich Mayor	Active	Private	House of Thenova	Dale (Sat 4-6)	TIMOR	170	Junior	59		22		1058	Gracia Tiffany Susanto	Active	Sergeant	House of Thenova	Canfield	TIMOR	190	Youth		58		23		70100184	Atha Malik Chairmawan	Active	Private	House of Thenova	Denver	TRITURA	90	Junior	106				24		70100139	Daniella Demeintieva	Active	Sergeant	House of Thenova	Auckland	TRITURA	170	Youth		68				23		90100049	Harvey Susanto	Active (Grace Period)	Sergeant	House of Havaria	Alexandrite	CEMARA	130	Junior	82						22		1020	Caren Axella Natania Lumbantoruan	Active	Sergeant	House of Thenova	Beryl	CEMARA	130	Youth		87						24
Tengku Muhammad Malik Al Fatih	Active (Grace Period)	Private	House of Havaria	Eldorado	TRITURA	280	Junior	23		442	Beatrys Vanesa Moiras	Active	Lt. General	House of Thenova	Kiyosaki (Sat 4-6)	TIMOR	300	Youth		25		1079	Keigo Kusuno Soh	Active	Private	House of Reverion	Tracy (Sat 4-6)	TIMOR	170	Junior	59		22		1038	Devon Jau	Active (Grace Period)	Sergeant	House of Creanova	Canfield	TIMOR	180	Youth		61		25		70100176	Muhammad Asyam Haris Tanjung 	Active	Private	House of Quorion	Cairo	TRITURA	80	Junior	112				25		70100158	Gracelyn Patricia	Active (Grace Period)	Sergeant	House of Thenova	Atlanta	TRITURA	170	Youth		68				23		90100060	Alfred Smaver Tanasal	Active (Grace Period)	Sergeant	House of Thenova	Amber	CEMARA	130	Junior	82						22		90100043	Valentino Owen Liu	Active	Private	House of Thenova	Jade	CEMARA	125	Youth		93						25
Jerrick Onggoro Hakim	Active	Private	House of Thenova	Denver	TRITURA	280	Junior	23		70100134	Diandra Santika	Active	Sergeant	House of Quorion	Athens	TRITURA	300	Youth		25															1139	Wilbert Wijaya	Active	Private	House of Quorion	Millman (Sat 1-3)	TIMOR	180	Youth		61		25																																	90100245	Mason Ivander Cahaya	Active	Private	House of Thenova	Alexandrite	CEMARA	130	Junior	82						22																		
Felicia Tham	Active	Sergeant	House of Thenova	Quartz	CEMARA	280	Junior	23																											1157	Gywen Stefanie Wiley	Active	Private	House of Thenova	Ziglar (Sat 4-6)	TIMOR	180	Youth		61		25																																																																		
`;

// Helper to extract all valid trainees from line
function parseFixedInput(input) {
  const nameToIdMap = new Map();

  // First pass: Collect ID mapping for every Name from blocks that have IDs
  const lines = input.trim().split('\n');

  for (let l = 2; l < lines.length; l++) {
    const parts = lines[l].split('\t');
    let idx = 0;
    while (idx < parts.length) {
      if (/^\d+$/.test(parts[idx])) {
        const id = parts[idx].trim();
        const nama = parts[idx + 1] ? parts[idx + 1].trim() : '';
        if (id && nama) {
          nameToIdMap.set(nama, id);
        }
      }
      idx++;
    }
  }

  const traineesMap = new Map();

  // Second pass: Parse every block accurately
  for (let l = 2; l < lines.length; l++) {
    const parts = lines[l].split('\t');

    // Parse Block 1 (9 columns: Nama Trainee, Active/Expired, Level, House, Class, Branch, Total Gold, Junior/Youth, RANK/ID)
    if (parts[0] && !/^\d+$/.test(parts[0]) && (parts[1]?.startsWith('Active') || parts[1]?.startsWith('Expired'))) {
      const nama = parts[0].trim();
      const status = parts[1].trim();
      const level = parts[2] ? parts[2].trim() : '';
      const house = parts[3] ? parts[3].trim() : '';
      const classVal = parts[4] ? parts[4].trim() : '';
      const branch = parts[5] ? parts[5].trim() : '';
      const totalGold = parts[6] ? parts[6].trim() : '';
      const juniorYouth = parts[7] ? parts[7].trim() : '';
      const rankId = parts[8] ? parts[8].trim() : '';

      const id = nameToIdMap.get(nama) || `TRAINEE_${nama.replace(/\s+/g, '_')}`;
      
      traineesMap.set(id, {
        id, nama, status, level, house, classVal, branch, totalGold, juniorYouth, rankId
      });
    }

    // Parse Blocks 2 to 8
    let idx = 1;
    while (idx < parts.length) {
      if (/^\d+$/.test(parts[idx])) {
        const id = parts[idx].trim();
        const nama = parts[idx + 1] ? parts[idx + 1].trim() : '';
        const status = parts[idx + 2] ? parts[idx + 2].trim() : '';
        const level = parts[idx + 3] ? parts[idx + 3].trim() : '';
        const house = parts[idx + 4] ? parts[idx + 4].trim() : '';
        const classVal = parts[idx + 5] ? parts[idx + 5].trim() : '';
        const branch = parts[idx + 6] ? parts[idx + 6].trim() : '';
        const totalGold = parts[idx + 7] ? parts[idx + 7].trim() : '';
        const juniorYouth = parts[idx + 8] ? parts[idx + 8].trim() : '';
        
        let rankId = '';
        for (let k = idx + 9; k < Math.min(idx + 15, parts.length); k++) {
          if (/^\d+$/.test(parts[k]?.trim())) {
            rankId = parts[k].trim();
            break;
          }
        }

        if (id && nama && (status.startsWith('Active') || status.startsWith('Expired')) && (juniorYouth === 'Junior' || juniorYouth === 'Youth')) {
          traineesMap.set(id, {
            id, nama, status, level, house, classVal, branch, totalGold, juniorYouth, rankId
          });
          idx += 9;
          continue;
        }
      }
      idx++;
    }
  }

  return Array.from(traineesMap.values());
}

async function runFixedSeed() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to NeonDB...');

    await client.query('TRUNCATE TABLE monthly_gold_point;');

    const records = parseFixedInput(rawInput);
    console.log(`📌 Found ${records.length} unique valid trainee records across ALL 8 BLOCKS.`);

    let inserted = 0;
    for (const r of records) {
      await client.query(`
        INSERT INTO monthly_gold_point (
          "ID", "Nama Trainee", "Active/Expired", "Level", "House",
          "Class", "Branch", "Total Gold/Periode", "Junior/Youth", "RANK/ID"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT ("ID") DO UPDATE SET
          "Nama Trainee"       = EXCLUDED."Nama Trainee",
          "Active/Expired"     = EXCLUDED."Active/Expired",
          "Level"              = EXCLUDED."Level",
          "House"              = EXCLUDED."House",
          "Class"              = EXCLUDED."Class",
          "Branch"             = EXCLUDED."Branch",
          "Total Gold/Periode" = EXCLUDED."Total Gold/Periode",
          "Junior/Youth"       = EXCLUDED."Junior/Youth",
          "RANK/ID"            = EXCLUDED."RANK/ID"
      `, [
        r.id, r.nama, r.status, r.level, r.house,
        r.classVal, r.branch, r.totalGold, r.juniorYouth, r.rankId
      ]);
      inserted++;
    }

    console.log(`✅ Success! Seeded ${inserted} records into "monthly_gold_point".`);

    const countRes = await client.query('SELECT COUNT(*) FROM monthly_gold_point;');
    console.log(`📊 Total rows in "monthly_gold_point": ${countRes.rows[0].count}`);

    const sampleRes = await client.query('SELECT "ID", "Nama Trainee", "Branch", "Junior/Youth", "RANK/ID" FROM monthly_gold_point ORDER BY "ID" LIMIT 10;');
    console.log('\n🔍 Sample Data:');
    console.table(sampleRes.rows);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runFixedSeed();
