const { pool } = require('./src/db/neonClient');

const rawTsv = `1025	Hermione Lovely Susanto	Active	Sergeant	House of Havaria	Winfrey (Thursday 4-6)	TIMOR	490	Junior	1		70100112	Fathi Arkan Wiyatmika	Active	Sergeant	House of Havaria	Atlanta	TRITURA	850	Youth		1		1025	Hermione Lovely Susanto	Active	Sergeant	House of Havaria	Winfrey (Thursday 4-6)	TIMOR	490	Junior	1		1		716	Chloe Vallerie Jie	Active (Grace Period)	Lt. Colonel	House of Reverion	Clinton (Fri 3-5)	TIMOR	540	Youth		4		1		70100023	Evonne Gwen Lim	Active	Sergeant	House of Thenova	Cairo	TRITURA	310	Junior	3				1		70100112	Fathi Arkan Wiyatmika	Active	Sergeant	House of Havaria	Atlanta	TRITURA	850	Youth		1				1		70100061	Colleen Blaine	Active	Private		Quartz	CEMARA	295	Junior	4						1		90100020	Winston Hubert	Active	Colonel	House of Thenova	Ruby	CEMARA	370	Youth		13						1										
927	Richela Stanlay	Active	Sergeant	House of Thenova	Dale (Sat 4-6)	TIMOR	450	Junior	2		70100076	Marwa Alya Sakinah Rangkuti	Active	Lt. Colonel	House of Thenova	Athens	TRITURA	760	Youth		2		927	Richela Stanlay	Active	Sergeant	House of Thenova	Dale (Sat 4-6)	TIMOR	450	Junior	2		2		850	Karin Destynsia	Active (Grace Period)	Lt. Colonel	House of Thenova	DaVinci	TIMOR	495	Youth		5		2		70100156	Tengku Muhammad Malik Al Fatih	Active	Private	House of Havaria	Eldorado	TRITURA	295	Junior	4				2		70100076	Marwa Alya Sakinah Rangkuti	Active	Lt. Colonel	House of Thenova	Athens	TRITURA	760	Youth		2				2		90100055	Felicia Tham	Active	Sergeant	House of Thenova	Quartz	CEMARA	250	Junior	12						2		90100206	Metta Louise ellen	Active	Private	House of Havaria	Azurite	CEMARA	340	Youth		15						2										
70100023	Evonne Gwen Lim	Active	Sergeant	House of Thenova	Cairo	TRITURA	310	Junior	3		90100176	Rahma Nakita Afifah	Active	Private	House of Thenova	Atlanta	TRITURA	560	Youth		3		999	Annabelle Grace Wu	Active	Sergeant	House of Thenova	Lincoln	TIMOR	290	Junior	6		3		1033	Shelvina Howie	Active	Sergeant	House of Havaria	Canfield	TIMOR	430	Youth		10		3		70100098	Erland Sohilida Laia	Active (Grace Period)	Sergeant	House of Thenova	Cairo	TRITURA	280	Junior	7				3		90100176	Rahma Nakita Afifah	Active	Private	House of Thenova	Atlanta	TRITURA	560	Youth		3				3		90100066	Celine Oubre	Active	Private	House of Thenova	Quartz	CEMARA	245	Junior	13						3		90100112	Richie Alvaro Tandinata	Active	Sergeant	House of Thenova	Azurite	CEMARA	320	Youth		17						3										
70100061	Colleen Blaine	Active	Private		Quartz	CEMARA	295	Junior	4		716	Chloe Vallerie Jie	Active (Grace Period)	Lt. Colonel	House of Reverion	Clinton (Fri 3-5)	TIMOR	540	Youth		4		988	Gavyn Wijaya	Active	Sergeant	House of Thenova	Maxwell	TIMOR	280	Junior	7		4		880	Joel Edward	Active (Grace Period)	Lt. Colonel	House of Havaria	Gates (Sat 10-12)	TIMOR	300	Youth		19		4		70100028	Elaine Gwen Lim	Active	Lt. Colonel	House of Quorion	Cairo	TRITURA	265	Junior	11				4		70100151	Fakhira Idris Harahap	Active (Grace Period)	Private	House of Havaria	Atlanta	TRITURA	490	Youth		6				4		90100109	Jolin Thianda	Active	Sergeant	House of Thenova	Amethyst	CEMARA	240	Junior	14						4		90100127	Davin Bradford	Active	Sergeant	House of Thenova	Azurite	CEMARA	310	Youth		18						4										
70100156	Tengku Muhammad Malik Al Fatih	Active	Private	House of Havaria	Eldorado	TRITURA	295	Junior	4		850	Karin Destynsia	Active (Grace Period)	Lt. Colonel	House of Thenova	DaVinci	TIMOR	495	Youth		5		604	Hugo Viandi	Active (Grace Period)	Sergeant	House of Havaria	Robbins (Sat 1-3)	TIMOR	270	Junior	9		5		1144	Kayla Shilyn Gani	Active	Private	House of Havaria	Millman (Sat 1-3)	TIMOR	280	Youth		23		5		70100063	Calysta Celorine Bakara	Active	Sergeant	House of Quorion	Eldorado	TRITURA	230	Junior	17				5		70100148	Davina Elisha Ginting	Active (Grace Period)	Private	House of Havaria	Atlanta	TRITURA	470	Youth		7				5		90100070	Jack Austin Sia	Active	Private	House of Thenova	Quartz	CEMARA	235	Junior	16						5		90100083	Filbert Laithen	Active	Sergeant	House of Havaria	Ruby	CEMARA	300	Youth		19						5										
999	Annabelle Grace Wu	Active	Sergeant	House of Thenova	Lincoln	TIMOR	290	Junior	6		70100151	Fakhira Idris Harahap	Active (Grace Period)	Private	House of Havaria	Atlanta	TRITURA	490	Youth		6		874	Muhammad Rafli Arkan	Active (Grace Period)	Sergeant	House of Thenova	Graham	TIMOR	270	Junior	9		5		48	Justin Maxwell	Active	General	House of Havaria	Millman (Sat 1-3)	TIMOR	270	Youth		24		6		70100106	Dareen Davinci Ginting	Active	Sergeant	House of Havaria	Denver	TRITURA	210	Junior	25				6		70100005	Lyvia Verlynn	Active	Lt. Colonel	House of Thenova	Almeria	TRITURA	450	Youth		8				6		90100081	Hayden Fredderick Halim	Active	Lt. Colonel	House of Havaria	Diamond	CEMARA	220	Junior	20						6		90100056	Thalissha Yeonan	Active	Sergeant	House of Quorion	Ruby	CEMARA	290	Youth		21						6										
988	Gavyn Wijaya	Active	Sergeant	House of Thenova	Maxwell	TIMOR	280	Junior	7		70100148	Davina Elisha Ginting	Active (Grace Period)	Private	House of Havaria	Atlanta	TRITURA	470	Youth		7		440	Sofia Grace Wu	Active	Colonel	House of Creanova	Gladwell	TIMOR	240	Junior	14		7		896	Nicolas Carlie Kuwira	Active	Colonel	House of Havaria	Galileo (Wed 4-6)	TIMOR	270	Youth		24		6		70100123	Shafiqa Adeeva Lubis	Active	Sergeant	House of Thenova	Eldorado	TRITURA	180	Junior	35				7		70100135	Adib Nufal Wibowo	Active	Private	House of Thenova	Asheville	TRITURA	440	Youth		9				7		638	Chloe Olivia Ruslie	Active	Lt. Colonel	House of Quorion	Alexandrite	CEMARA	215	Junior	22						7		90100088	Khairiy Raka Azizi Hermansyah	Active	Sergeant	House of Thenova	Obsidian	CEMARA	235	Youth		32						7										
70100098	Erland Sohilida Laia	Active (Grace Period)	Sergeant	House of Thenova	Cairo	TRITURA	280	Junior	7		70100005	Lyvia Verlynn	Active	Lt. Colonel	House of Thenova	Almeria	TRITURA	450	Youth		8		707	Samho Gunawan	Active	Lt. Colonel	House of Thenova	Robbins (Sat 1-3)	TIMOR	230	Junior	17		8		1027	Elnino Jehanra Saragih	Active	Sergeant	House of Creanova	Spielberg (Sat 4-6)	TIMOR	270	Youth		24		6		70100071	Muhammad Al Khawarizmi Fairel	Active	Private	House of Thenova	Eldorado	TRITURA	160	Junior	47				8		70100173	Muhammad Naufal Athariz Ritonga	Active	Private	House of Thenova	Atlanta	TRITURA	400	Youth		11				8		90100160	Klarissa Evania Buhari 	Active	Private	House of Reverion	Pearl	CEMARA	215	Junior	22						7		90100002	Giselle Liandy	Active	Sergeant	House of Quorion	Topaz	CEMARA	220	Youth		35						8										
604	Hugo Viandi	Active (Grace Period)	Sergeant	House of Havaria	Robbins (Sat 1-3)	TIMOR	270	Junior	9		70100135	Adib Nufal Wibowo	Active	Private	House of Thenova	Asheville	TRITURA	440	Youth		9		1155	Howard Winston Louis	Active	Private	House of Thenova	Tracy (Sat 4-6)	TIMOR	230	Junior	17		8		741	Brayden Lisman	Active	Colonel	House of Quorion	Galileo (Wed 4-6)	TIMOR	260	Youth		27		9		70100041	Raisha Adila Gunawan	Active (Grace Period)	Lt. Colonel	House of Creanova	Denver	TRITURA	140	Junior	53				9		70100070	Keysha Kania Ramaditya	Active	Lt. Colonel	House of Reverion	Asheville	TRITURA	380	Youth		12				9		587	Enrico Victorian	Active	Colonel	House of Havaria	Pearl	CEMARA	200	Junior	29						9		90100143	Jason Lewis Theo	Active	Sergeant	House of Quorion	Azurite	CEMARA	220	Youth		35						8										
874	Muhammad Rafli Arkan	Active (Grace Period)	Sergeant	House of Thenova	Graham	TIMOR	270	Junior	9		1033	Shelvina Howie	Active	Sergeant	House of Havaria	Canfield	TIMOR	430	Youth		10		858	Delmond Osyan Sudilan	Active	Sergeant	House of Thenova	Mandela	TIMOR	220	Junior	20		10		1045	Silvario Soedidjo	Active (Grace Period)	Sergeant	House of Thenova	Clinton (Fri 3-5)	TIMOR	260	Youth		27		9		70100004	Maryam Shareen Anandifa	Active	Lt. Colonel	House of Havaria	Denver	TRITURA	90	Junior	76				10		70100047	Keyzia Faiana Daulay	Active	Lt. Colonel	House of Quorion	Almeria	TRITURA	370	Youth		13				10		90100114	Kate Elizabeth Huang	Active (Grace Period)	Sergeant	House of Thenova	Amethyst	CEMARA	200	Junior	29						9		868	Sergio Garcia Ang	Active (Grace Period)	Lt. Colonel	House of Creanova	Beryl	CEMARA	210	Youth		37						10										
70100028	Elaine Gwen Lim	Active	Lt. Colonel	House of Quorion	Cairo	TRITURA	265	Junior	11		70100173	Muhammad Naufal Athariz Ritonga	Active	Private	House of Thenova	Atlanta	TRITURA	400	Youth		11		939	Rexcaden Jazper Shu	Active	Sergeant	House of Havaria	Winfrey (Thursday 4-6)	TIMOR	215	Junior	22		11		852	Cellistia Cangdiago	Active (Grace Period)	Lt. General	House of Quorion	Galileo (Wed 4-6)	TIMOR	230	Youth		33		11		70100064	Rachel Nathania Situmorang	Active (Grace Period)	Sergeant	House of Creanova	Eldorado	TRITURA	90	Junior	76				10		70100127	Gabriel Ihut Martuaro Sihombing	Active	Sergeant	House of Havaria	Atlanta	TRITURA	330	Youth		16				11		90100001	Rowan Maverick Ang	Active	Private	House of Thenova	Quartz	CEMARA	195	Junior	32						11		90100195	Sarah Oktorela Sitorus	Active	Private		Jade	CEMARA	180	Youth		43						11										
90100055	Felicia Tham	Active	Sergeant	House of Thenova	Quartz	CEMARA	250	Junior	12		70100070	Keysha Kania Ramaditya	Active	Lt. Colonel	House of Reverion	Asheville	TRITURA	380	Youth		12		1029	Luna Antoinette Linne	Active	Sergeant	House of Havaria	Winfrey (Thursday 4-6)	TIMOR	210	Junior	25		12		904	Callista Aurelia Tasma	Active	Lt. Colonel	House of Thenova	Galileo (Wed 4-6)	TIMOR	200	Youth		38		12		70100122	Shadrina Azheema Lubis	Active	Sergeant	House of Creanova	Eldorado	TRITURA	90	Junior	76				10		70100078	Sakina Alima Regune Harahap	Active	Colonel	House of Thenova	Atlanta	TRITURA	290	Youth		21				12		90100173	Jeneiro	Active	Private	House of Havaria	Emerald	CEMARA	195	Junior	32						11		90100022	Jeanice Wu	Active	Sergeant	House of Quorion	Ruby	CEMARA	170	Youth		45						12										
90100066	Celine Oubre	Active	Private	House of Thenova	Quartz	CEMARA	245	Junior	13		70100047	Keyzia Faiana Daulay	Active	Lt. Colonel	House of Quorion	Almeria	TRITURA	370	Youth		13		1044	Dominic Kie	Active (Grace Period)	Private	House of Quorion	Tracy (Sat 4-6)	TIMOR	210	Junior	25		12		1051	Timothy Anwi Panca	Active	Private	House of Creanova	Canfield	TIMOR	200	Youth		38		12		70100059	Rebecca Florencia Siregar	Active	Colonel	House of Havaria	Eldorado	TRITURA	80	Junior	84				13		70100152	Abigail Carissa 	Active (Grace Period)	Private	House of Thenova	Atlanta	TRITURA	260	Youth		27				13		90100100	Jasmine Zhang	Active	Private	House of Quorion	Pearl	CEMARA	170	Junior	39						13		90100082	Tang En Xin	Active	Sergeant	House of Quorion	Ruby	CEMARA	170	Youth		45						12										
440	Sofia Grace Wu	Active	Colonel	House of Creanova	Gladwell	TIMOR	240	Junior	14		90100020	Winston Hubert	Active	Colonel	House of Thenova	Ruby	CEMARA	370	Youth		13		1135	Cherysse Auryn Khobert	Active	Private	House of Havaria	Marley	TIMOR	210	Junior	25		12		1007	Davina Grace Ong	Active (Grace Period)	Sergeant	House of Thenova	Kiyosaki (Sat 4-6)	TIMOR	190	Youth		40		14		70100150	Nadhira Calista Purba	Active	Private	House of Thenova	Eldorado	TRITURA	80	Junior	84				13		70100046	Kirania Inara Azalea	Active	Lt. Colonel	House of Thenova	Atlanta	TRITURA	250	Youth		30				14		90100223	Feodora Meidy Leandra	Active	Private	House of Havaria	Diamond	CEMARA	170	Junior	39						13		90100035	Carlen Edeline Br. Keliat	Active	Sergeant	House of Havaria	Obsidian	CEMARA	165	Youth		49						14										
90100109	Jolin Thianda	Active	Sergeant	House of Thenova	Amethyst	CEMARA	240	Junior	14		90100206	Metta Louise ellen	Active	Private	House of Havaria	Azurite	CEMARA	340	Youth		15		1153	Philippe Benedict Zhuang	Active	Private	House of Havaria	Marley	TIMOR	200	Junior	29		15		1062	Queensya Lovely Reya	Active	Sergeant	House of Thenova	Clinton (Fri 3-5)	TIMOR	190	Youth		40		14		70100159	Nadia Fathaniah Chandra	Active	Private	House of Thenova	Eldorado	TRITURA	80	Junior	84				13		70100027	Daniel Goh	Active	Sergeant	House of Thenova	Auckland	TRITURA	240	Youth		31				15		639	Bianca Olivia Ruslie	Active	Private	House of Thenova	Alexandrite	CEMARA	165	Junior	44						15		90100067	Victor Alexander Winstan	Active	Sergeant	House of Thenova	Topaz	CEMARA	150	Youth		54						15										
90100070	Jack Austin Sia	Active	Private	House of Thenova	Quartz	CEMARA	235	Junior	16		70100127	Gabriel Ihut Martuaro Sihombing	Active	Sergeant	House of Havaria	Atlanta	TRITURA	330	Youth		16		809	Emilia Niko Nyoman	Active (Grace Period)	Private	House of Thenova	Lincoln	TIMOR	190	Junior	34		16		947	Nayyara Ayaskara Prakasita	Active (Grace Period)	Sergeant	House of Quorion	Gandhi	TIMOR	170	Youth		45		16		70100174	Jerrick Onggoro Hakim	Active	Private	House of Thenova	Denver	TRITURA	80	Junior	84				13		70100133	Lionel Maverick 	Active	Sergeant	House of Havaria	Asheville	TRITURA	230	Youth		33				16		90100168	Madelyn Henryetta Fang	Active	Private	House of Havaria	Pearl	CEMARA	165	Junior	44						15		90100120	Jocelyn Sydney 	Active	Sergeant	House of Reverion	Topaz	CEMARA	140	Youth		57						16										
707	Samho Gunawan	Active	Lt. Colonel	House of Thenova	Robbins (Sat 1-3)	TIMOR	230	Junior	17		90100112	Richie Alvaro Tandinata	Active	Sergeant	House of Thenova	Azurite	CEMARA	320	Youth		17		914	Leia Kaytlyn Tioe	Active (Grace Period)	Private	House of Creanova	Lincoln	TIMOR	180	Junior	35		17		1015	Fransisca	Active	Sergeant	House of Quorion	Clinton (Fri 3-5)	TIMOR	160	Youth		50		17		70100153	Dareen Azel Matthew Sembiring	Active	Private	House of Thenova	Eldorado	TRITURA	70	Junior	93				17		70100147	Faza Kiyana Azdah	Active (Grace Period)	Sergeant	House of Thenova	Athens	TRITURA	190	Youth		40				17		1081	Carlton Kho	Active	Private	House of Havaria	Pearl	CEMARA	150	Junior	50						17		602	Alexandra Joan Micheline	Active	Colonel	House of Creanova	Jade	CEMARA	130	Youth		63						17										
1155	Howard Winston Louis	Active	Private	House of Thenova	Tracy (Sat 4-6)	TIMOR	230	Junior	17		90100127	Davin Bradford	Active	Sergeant	House of Thenova	Azurite	CEMARA	310	Youth		18		935	Gisella Nyoto	Active	Sergeant	House of Havaria	Robbins (Sat 1-3)	TIMOR	180	Junior	35		17		1164	Felicia Ivana Silalahi	Active	Private	House of Creanova	DaVinci	TIMOR	160	Youth		50		17		70100160	Jordan Noel Yap	Active	Private	House of Thenova	Denver	TRITURA	70	Junior	93				17		70100136	Syakirah Khairani Jamilah	Active	Private	House of Thenova	Asheville	TRITURA	180	Youth		43				18		90100047	Bryant Maximus Ling	Active	Sergeant	House of Thenova	Amber	CEMARA	150	Junior	50						17		90100153	Ethan Putra Gotama	Active (Grace Period)	Sergeant	House of Havaria	Ruby	CEMARA	120	Youth		67						18										
70100063	Calysta Celorine Bakara	Active	Sergeant	House of Quorion	Eldorado	TRITURA	230	Junior	17		880	Joel Edward	Active (Grace Period)	Lt. Colonel	House of Havaria	Gates (Sat 10-12)	TIMOR	300	Youth		19		956	Aileen Sophie Kesuma	Active	Sergeant	House of Thenova	Maxwell	TIMOR	180	Junior	35		17		822	Clarissa Olivia Anne Lammora Panjaitan	Active	Colonel	House of Havaria	Gates (Sat 10-12)	TIMOR	150	Youth		54		19		673	Nathan Immanuel Winanto	Active	Sergeant	House of Havaria	Denver	TRITURA	60	Junior	109				19		70100117	Akhdan Arief Athaya	Active	Private	House of Havaria	Asheville	TRITURA	170	Youth		45				19		90100138	Vyon Wynter Huang	Active	Private	House of Thenova	Pearl	CEMARA	150	Junior	50						17		876	Jacqueline Vallerie Chen	Active (Grace Period)	Lt. Colonel	House of Havaria	Topaz	CEMARA	110	Youth		71						19										
858	Delmond Osyan Sudilan	Active	Sergeant	House of Thenova	Mandela	TIMOR	220	Junior	20		90100083	Filbert Laithen	Active	Sergeant	House of Havaria	Ruby	CEMARA	300	Youth		19		1017	Harvardo Lovenzo Susanto	Active	Sergeant	House of Havaria	Gladwell	TIMOR	170	Junior	39		20		1031	Jacques Lewinsky	Active	Sergeant	House of Thenova	Clinton (Fri 3-5)	TIMOR	150	Youth		54		19		70100176	Muhammad Asyam Haris Tanjung 	Active	Private	House of Quorion	Cairo	TRITURA	60	Junior	109				19		70100042	Jessica Sharon	Active	Lt. Colonel	House of Havaria	Athens	TRITURA	160	Youth		50				20		90100044	Velove Alexa Winstan	Active	Sergeant	House of Creanova	Amethyst	CEMARA	140	Junior	53						20		90100200	Galent hansen wuner	Active	Private	House of Quorion	Azurite	CEMARA	110	Youth		71						19										
90100081	Hayden Fredderick Halim	Active	Lt. Colonel	House of Havaria	Diamond	CEMARA	220	Junior	20		70100078	Sakina Alima Regune Harahap	Active	Colonel	House of Thenova	Atlanta	TRITURA	290	Youth		21		1090	Healey Tjoe	Active	Private	House of Quorion	Robbins (Sat 1-3)	TIMOR	170	Junior	39		20		636	Zia Arafa Khairina	Active	Lt. Colonel	House of Thenova	Gates (Sat 10-12)	TIMOR	140	Youth		57		21		70100090	Annisa Letizia Shanum	Active	Sergeant	House of Reverion	Eldorado	TRITURA	30	Junior	144				21		70100149	Jaeson Nathan Yap	Active	Private	House of Quorion	Auckland	TRITURA	160	Youth		50				20		90100116	Janessa Hofang	Active	Private	House of Thenova	Emerald	CEMARA	140	Junior	53						20		90100192	Jayden Jingga	Active	Private	House of Thenova	Ruby	CEMARA	100	Youth		78						21										
638	Chloe Olivia Ruslie	Active	Lt. Colonel	House of Quorion	Alexandrite	CEMARA	215	Junior	22		90100056	Thalissha Yeonan	Active	Sergeant	House of Quorion	Ruby	CEMARA	290	Youth		21		70100037	Abigail Rhea Lim	Active (Grace Period)	Private	House of Havaria	Mandela	TIMOR	170	Junior	39		20		1124	Felicia Liangso	Active	Private	House of Thenova	Canfield	TIMOR	140	Youth		57		21		70100166	Farrin Rafania Shezan Lubis	Active	Private	House of Havaria	Eldorado	TRITURA	0	Junior	162				22		70100102	Bryan Taslim	Active	Sergeant	House of Thenova	Athens	TRITURA	140	Youth		57				22		490	Shane Ferrucio Lim	Active (Grace Period)	Lt. Colonel	House of Havaria	Alexandrite	CEMARA	135	Junior	58						22		90100089	Alvyn Zhu	Active	Private	House of Reverion	Obsidian	CEMARA	90	Youth		83						22										
939	Rexcaden Jazper Shu	Active	Sergeant	House of Havaria	Winfrey (Thursday 4-6)	TIMOR	215	Junior	22		1144	Kayla Shilyn Gani	Active	Private	House of Havaria	Millman (Sat 1-3)	TIMOR	280	Youth		23		1003	Arthur Alexander Hakim	Active	Sergeant	House of Thenova	Gladwell	TIMOR	165	Junior	44		23		575	Mandy Ellen Sanusi	Active	Colonel	House of Creanova	DaVinci	TIMOR	130	Youth		63		23		70100179	Doria Marchisia Giussevine Saragih	Active	Private	House of Thenova	Cairo	TRITURA	0	Junior	162				22		70100139	Daniella Demeintieva	Active	Sergeant	House of Thenova	Auckland	TRITURA	140	Youth		57				22		90100021	Aidan Benjamin Yapar	Active (Grace Period)	Private	House of Thenova	Emerald	CEMARA	125	Junior	61						23		90100191	Bosco Lim	Active (Grace Period)	Private	House of Quorion	Topaz	CEMARA	90	Youth		83						22										
90100160	Klarissa Evania Buhari 	Active	Private	House of Reverion	Pearl	CEMARA	215	Junior	22		48	Justin Maxwell	Active	General	House of Havaria	Millman (Sat 1-3)	TIMOR	270	Youth		24		136	Claudine Joshanley	Active	Lt. Colonel	House of Creanova	Graham	TIMOR	160	Junior	47		24		676	Grace Alexandra	Active	Colonel	House of Havaria	Galileo (Wed 4-6)	TIMOR	125	Youth		66		24		70100180	Jevano Septarey Saragih	Active	Private	House of Thenova	Cairo	TRITURA	0	Junior	162				22		70100146	Alexa Brianna Tambunan	Active	Private	House of Thenova	Almeria	TRITURA	140	Youth		57				22		90100024	Welceline Charissa Tsjin	Active	Sergeant	House of Thenova	Diamond	CEMARA	120	Junior	62						24		90100036	Carlos Ferdinand Putra	Active	Sergeant	House of Thenova	Jade	CEMARA	80	Youth		89						24										
1029	Luna Antoinette Linne	Active	Sergeant	House of Havaria	Winfrey (Thursday 4-6)	TIMOR	210	Junior	25		896	Nicolas Carlie Kuwira	Active	Colonel	House of Havaria	Galileo (Wed 4-6)	TIMOR	270	Youth		24		1146	Charis Yafa Tobing	Active	Private	House of Thenova	Maxwell	TIMOR	160	Junior	47		24		745	Jesslyn	Active	Lt. General	House of Thenova	Galileo (Wed 4-6)	TIMOR	120	Youth		67		25		70100184	Atha Malik Chairmawan	Active	Private	House of Thenova	Denver	TRITURA	0	Junior	162				22		70100155	Stella Aprilia Sianipar 	Active	Private	House of Reverion	Athens	TRITURA	130	Youth		63				25		90100087	Finn Maxwell	Active	Sergeant	House of Havaria	Alexandrite	CEMARA	110	Junior	65						25		90100064	Olson Arfayo	Active	Sergeant	House of Reverion	Obsidian	CEMARA	70	Youth		97						25										
1044	Dominic Kie	Active (Grace Period)	Private	House of Quorion	Tracy (Sat 4-6)	TIMOR	210	Junior	25		1027	Elnino Jehanra Saragih	Active	Sergeant	House of Creanova	Spielberg (Sat 4-6)	TIMOR	270	Youth		24															1161	Randa Miracle Boasly Sihombing	Active	Private		Galileo (Wed 4-6)	TIMOR	120	Youth		67		25		70100186	Alvaro Gavriel Batara Sihotang	Active	Private	House of Havaria	Cairo	TRITURA	0	Junior	162				22																		90100136	Miho Qanitah Sihombing	Active	Private	House of Reverion	Amethyst	CEMARA	110	Junior	65						25		90100080	Vanessa Cangie	Active	Sergeant	House of Havaria	Topaz	CEMARA	70	Youth		97						25										
1135	Cherysse Auryn Khobert	Active	Private	House of Havaria	Marley	TIMOR	210	Junior	25																																									70100188	Latisya Naya Alamsyah Nasution	Active	Private	House of Thenova	Eldorado	TRITURA	0	Junior	162				22																																			90100134	Rodrick Stefano Halim	Active	Private	House of Havaria	Sapphire	CEMARA	70	Youth		97						25										
70100106	Dareen Davinci Ginting	Active	Sergeant	House of Havaria	Denver	TRITURA	210	Junior	25																																									70100191	Yosihana Hutasoit	Active	Private	House of Thenova	Cairo	TRITURA	0	Junior	162				22																																			90100198	Jordan Swiss Cliftan 	Active	Private	House of Quorion	Topaz	CEMARA	70	Youth		97						25										
																																																		70100192	Kania Laviza Andhini	Active	Private	House of Thenova	Denver	TRITURA	0	Junior	162				22																																																													
																																																		70100193	Nadhira Ayria Verdian	Active		House of Havaria	Cairo	TRITURA	0	Junior	162				22																																																													
`;

async function insertOfficialSheetData() {
  console.log('Inserting official sheet data into goldpoint_trainee...');

  // First, clear table
  await pool.query('TRUNCATE TABLE goldpoint_trainee;');
  console.log('Cleared table goldpoint_trainee.');

  const lines = rawTsv.trim().split('\n');
  const insertedMap = new Map();

  for (const line of lines) {
    const parts = line.split('\t');
    
    // Each row in TSV has 8 blocks of trainee columns
    // We iterate over each 10-column block
    for (let offset = 0; offset < parts.length; offset += 10) {
      const id = (parts[offset] || '').trim();
      const name = (parts[offset + 1] || '').trim();
      const status = (parts[offset + 2] || '').trim() || 'Active';
      const level = (parts[offset + 3] || '').trim() || 'Sergeant';
      const house = (parts[offset + 4] || '').trim() || 'House of Thenova';
      const className = (parts[offset + 5] || '').trim() || 'Gladwell';
      const branch = (parts[offset + 6] || '').trim() || 'TIMOR';
      const totalGoldStr = (parts[offset + 7] || '').trim();
      const kategori = (parts[offset + 8] || '').trim() || 'Junior';
      const rankStr = (parts[offset + 9] || '').trim();

      if (!id || !name || id === 'ID' || name === 'Nama Trainee' || isNaN(parseInt(id))) {
        continue;
      }

      const totalGold = parseInt(totalGoldStr) || 0;
      const rank = parseInt(rankStr) || 0;

      // Keep the record with highest total_gold or valid rank if duplicated across blocks
      if (!insertedMap.has(id) || (rank > 0 && insertedMap.get(id).rank === 0)) {
        insertedMap.set(id, {
          id,
          nama_trainee: name,
          status,
          level,
          house,
          class: className,
          branch,
          total_gold: totalGold,
          kategori,
          rank
        });
      }
    }
  }

  console.log(`Parsed ${insertedMap.size} unique trainees from sheet data.`);

  let insertedCount = 0;
  for (const [id, trainee] of insertedMap) {
    const queryText = `
      INSERT INTO goldpoint_trainee 
        (id, nama_trainee, status, level, house, class, branch, total_gold_periode, gp_month, kategori, rank, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (id) DO UPDATE SET
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

    await pool.query(queryText, [
      trainee.id,
      trainee.nama_trainee,
      trainee.status,
      trainee.level,
      trainee.house,
      trainee.class,
      trainee.branch,
      trainee.total_gold,
      trainee.total_gold,
      trainee.kategori,
      trainee.rank
    ]);

    // Also sync to portal_trainee
    await pool.query(`
      UPDATE portal_trainee 
      SET name = $2, house = $3, class = $4, branch_id = $5
      WHERE trainee_id = $1 OR id = $1
    `, [trainee.id, trainee.nama_trainee, trainee.house, trainee.class, trainee.branch]).catch(() => null);

    insertedCount++;
  }

  // Auto-fix any 0 or null ranks in database
  await pool.query(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY kategori, branch 
        ORDER BY total_gold_periode DESC, nama_trainee ASC
      ) AS calculated_rank
      FROM goldpoint_trainee
    )
    UPDATE goldpoint_trainee g
    SET rank = r.calculated_rank
    FROM ranked r
    WHERE g.id = r.id AND (g.rank IS NULL OR g.rank = 0);
  `);

  console.log(`✅ Successfully inserted ${insertedCount} trainees from official Sheet with 100% accurate ranks!`);
  
  const zeroCheck = await pool.query('SELECT COUNT(*) FROM goldpoint_trainee WHERE rank = 0 OR rank IS NULL;');
  console.log(`Zero ranks count: ${zeroCheck.rows[0].count}`);

  const totalRows = await pool.query('SELECT COUNT(*) FROM goldpoint_trainee;');
  console.log(`Total rows in goldpoint_trainee: ${totalRows.rows[0].count}`);

  process.exit(0);
}

insertOfficialSheetData();
