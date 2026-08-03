const db = require('./src/db/neonClient');

const rawText = `CLASS	Day	Time	Room	Branch	ID	Name	Level	NEWEST GRADE	HOUSE	House Role	Trainee Homeroom	Homeroom kelas	Trainer	MEMBERSHIP	EXPIRY DATE	FIRST ENROLL
					70100104	Danisha Ozza Aurellia. S 								Active	19 Sep 2026	19 Sep 2025
Marley	Monday	15.30-17.30	Apsley	Centre Point	980	Ezio Lim	Sergeant	6	House of Quorion		Muly	Rizky	Rizky	Active	8 Oct 2026	27 Mar 2025
Marley	Monday	15.30-17.30	Apsley	Centre Point	1121	Liam John Rickson	Private	5	House of Creanova		Rizky	Rizky	Rizky	Active	30 Oct 2026	23 Dec 2025
Marley	Monday	15.30-17.30	Apsley	Centre Point	1132	Nicole Lee	Private	6	House of Quorion		Rizky	Rizky	Rizky	Active	30 Sep 2026	26 Jan 2026
Marley	Monday	15.30-17.30	Apsley	Centre Point	1135	Cherysse Auryn Khobert	Private	5	House of Havaria		Rizky	Rizky	Rizky	Active	30 Sep 2026	31 Jan 2026
Marley	Monday	15.30-17.30	Apsley	Centre Point	1143	Rico Alvaro Chandra	Private	6			Rizky	Rizky	Rizky	Active	30 Sep 2026	06 Mar 2026
Marley	Monday	15.30-17.30	Apsley	Centre Point	1147	Calista Kasih Aprilia Harahap	Private	5	House of Reverion		Rizky	Rizky	Rizky	Active	30 Oct 2026	26 Mar 2026
Marley	Monday	15.30-17.30	Apsley	Centre Point	1148	Talysha Sri Nayla	Private	5	House of Thenova		Rizky	Rizky	Rizky	Active	30 Sep 2026	27 Mar 2026
Marley	Monday	15.30-17.30	Apsley	Centre Point	1153	Philippe Benedict Zhuang	Private	3	House of Havaria		Ghaitsa	Rizky	Rizky	Active	13 Oct 2026	06 Apr 2026
Marley	Monday	15.30-17.30	Apsley	Centre Point	1170	Kaylynn Zhanghoven	Private	1			Rizky	Rizky	Rizky	Active	20 Jan 2027	28 May 2026
Marley	Monday	15.30-17.30	Apsley	Centre Point	1179	Livi Celia Lim	Private	6			Ghaitsa	Rizky	Rizky	Active	6 Jan 2027	23 Jun 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1176	Jean Catherine Anneliese Sebayang	Private	9			Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	17 Jun 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1180	Hariwell	Private	10			Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	25 Jun 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1183	Maxwell Utomo	Private	9	House of Quorion		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	26 Jun 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1186	Ray Yudhistira Ng	Private	10	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	29 Jun 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1191	Joya Vania Silaen	Private	11	House of Creanova		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	01 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1198	Jovan Jonathan Cen	Private	12	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	08 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1199	Joey Jonas Cen	Private	10	House of Quorion		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	08 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1202	Cornelius Wilfred	Private	12	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	09 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1207	James Jayden Chandra	Private	11	House of Creanova		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	10 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1210	Joycelyn Annabelle	Private	13	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Jan 2027	14 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1213	Kaylee Wayne Laong	Private	2			Ghaitsa	Ghaitsa	Ghaitsa	Active	27 Jan 2027	17 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1216	Marc Maximus Zhang	Private	10	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	27 Jan 2027	18 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1218	Odilia Alexandra Yang	Private	12	House of Havaria		Ghaitsa	Ghaitsa	Ghaitsa	Active	27 Jan 2027	21 Jul 2026
Einstein	Monday	16:00-18:00	Chesterfield	Centre Point	1220	Kinara Caliezia Pangestu	Private	8	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	27 Jan 2027	21 Jul 2026
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	670	Christian Anderson Lee	Lt. Colonel	5	House of Havaria		Rizky	Muly	Viorentina	Expired	22 Jul 2026	22 Jul 2023
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	845	Wallace Evencio	Lt. Colonel	4	House of Thenova		Ghaitsa	Muly	Viorentina	Active (Grace Period)	19 Aug 2026	19 Jun 2024
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	913	Roselie Kirana Wijaya	Sergeant	4	House of Creanova		Muly	Muly	Viorentina	Active	6 Oct 2026	01 Oct 2024
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	929	Trevor Hartono Lee	Sergeant	6	House of Creanova		Muly	Muly	Viorentina	Active	12 May 2027	06 Nov 2024
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	945	Angeline Felice Theo	Private	5	House of Havaria		Muly	Muly	Viorentina	Active	4 Mar 2027	17 Dec 2024
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	968	Lady Valery Sinambela	Sergeant	6	House of Creanova		Muly	Muly	Viorentina	Active	8 Oct 2026	25 Feb 2025
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	970	Annabela Himeko Winarta	Sergeant	3	House of Thenova		Rizky	Muly	Viorentina	Active	8 Oct 2026	28 Feb 2025
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	986	Jason Allen Tjoa	Sergeant	5	House of Quorion		Rizky	Muly	Viorentina	Active	8 Apr 2027	08 Apr 2025
Newton (Tue 4-6)	Tuesday	16:00-18:00	Schomberg	Centre Point	1022	Efraim Lucas Dimitri	Private	5	House of Thenova		Muly	Muly	Viorentina	Active (Grace Period)	17 Aug 2026	28 Jun 2025
Maxwell	Tuesday	16:00-18:00	Osborne	Centre Point	932	Olivia Tjoa	Sergeant	4	House of Thenova		Rizky	Rizky	Agustina	Active	15 Dec 2026	14 Nov 2024
Maxwell	Tuesday	16:00-18:00	Osborne	Centre Point	956	Aileen Sophie Kesuma	Sergeant	4	House of Thenova		Muly	Rizky	Agustina	Active	29 Oct 2026	17 Jan 2025
Maxwell	Tuesday	16:00-18:00	Osborne	Centre Point	965	Modric Agusta Daruma	Sergeant	5	House of Thenova		Muly	Rizky	Agustina	Active	8 Oct 2026	21 Feb 2025
Maxwell	Tuesday	16:00-18:00	Osborne	Centre Point	988	Gavyn Wijaya	Sergeant	4	House of Thenova		Muly	Rizky	Agustina	Active	29 Apr 2027	21 Apr 2025
Maxwell	Tuesday	16:00-18:00	Osborne	Centre Point	992	James Ananda Wijaya	Private	3	House of Thenova		Muly	Rizky	Agustina	Expired	25 Jul 2026	29 Apr 2025
Maxwell	Tuesday	16:00-18:00	Osborne	Centre Point	1088	Alesha Sofia Andhika	Sergeant	5	House of Thenova		Rizky	Rizky	Agustina	Active	16 Sep 2026	13 Sep 2025
Maxwell	Tuesday	16:00-18:00	Osborne	Centre Point	1146	Charis Yafa Tobing	Private	6	House of Thenova		Ghaitsa	Rizky	Agustina	Active	30 Sep 2026	26 Mar 2026
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	141	Russell William Tanner	Colonel	6	House of Quorion		Ghaitsa	Muly	Loita, Nabila	Active	5 Sep 2027	20 Feb 2022
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	575	Mandy Ellen Sanusi	Lt. General	6	House of Creanova		Ghaitsa	Muly	Loita, Nabila	Active	20 Sep 2026	18 Jan 2023
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	614	Rayden Chiang	Colonel	8	House of Thenova		Ghaitsa	Muly	Loita, Nabila	Active	2 Nov 2026	17 Apr 2023
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	738	Adeline Njo	Lt. Colonel	7	House of Havaria		Ghaitsa	Muly	Loita, Nabila	Active	19 Sep 2026	05 Oct 2023
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	850	Karin Destynsia	Colonel	12	House of Thenova		Rizky	Muly	Loita, Nabila	Active (Grace Period)	12 Aug 2026	05 Jul 2024
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	872	Kenneth Samuel Lim	Lt. Colonel	7	House of Creanova		Rizky	Muly	Loita, Nabila	Active (Grace Period)	28 Aug 2026	25 Jul 2024
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	887	Filia Cielo Lim	Lt. Colonel	8	House of Thenova		Ghaitsa	Muly	Loita, Nabila	Expired	13 Jul 2026	06 Aug 2024
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	997	Jovin Limcoln	Sergeant	12	House of Havaria		Muly	Muly	Loita, Nabila	Expired	22 Jul 2026	23 May 2025
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	998	Fedrick Wijaya	Private	12			Muly	Muly	Loita, Nabila	Expired	22 Jul 2026	23 May 2025
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	1078	Ethan Kenny Daruma	Private	10	House of Thenova		Muly	Muly	Loita, Nabila	Active	2 Mar 2027	25 Aug 2025
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	1164	Felicia Ivana Silalahi	Private	11	House of Creanova		Ghaitsa	Muly	Loita, Nabila	Active	26 Nov 2026	13 May 2026
DaVinci	Tuesday	16:00-18:00	Chesterfield	Centre Point	1219	Naviauly Dolorosa Sinaga	Private	12	House of Reverion		Muly	Muly	Loita, Nabila	Active	28 Jan 2027	21 Jul 2026
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	754	Reagan Khei Subroto	Lt. Colonel	7	House of Quorion		Rizky	Rizky	Ghaitsa	Active	26 Sep 2026	25 Oct 2023
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1033	Shelvina Howie	Lt. Colonel	8	House of Havaria		Rizky	Rizky	Ghaitsa	Active (Grace Period)	26 Aug 2026	10 Jul 2025
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1038	Devon Jau	Sergeant	9	House of Creanova		Rizky	Rizky	Ghaitsa	Active (Grace Period)	26 Aug 2026	14 Jul 2025
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1041	Chloe Taydey	Sergeant	12	House of Reverion		Rizky	Rizky	Ghaitsa	Active (Grace Period)	26 Aug 2026	18 Jul 2025
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1051	Timothy Anwi Panca	Sergeant	7	House of Creanova		Rizky	Rizky	Ghaitsa	Active	26 Sep 2026	31 Jul 2025
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1053	Elaine Clemence Annabell	Private	10	House of Havaria		Rizky	Rizky	Ghaitsa	Active (Grace Period)	26 Aug 2026	06 Aug 2025
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1058	Gracia Tiffany Susanto	Sergeant	11	House of Thenova		Rizky	Rizky	Ghaitsa	Active	26 Sep 2026	16 Aug 2025
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1124	Felicia Liangso	Private	11	House of Thenova		Rizky	Rizky	Ghaitsa	Active	7 Oct 2026	26 Dec 2025
Canfield	Tuesday	16:00-18:00	Apsley	Centre Point	1150	Kellyn Chandra	Private	9	House of Quorion		Rizky	Rizky	Ghaitsa	Active	7 Oct 2026	01 Apr 2026
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	868	Sergio Garcia Ang	Lt. Colonel	8	House of Creanova		Agustina	Nabila	Rizky	Expired	1 Aug 2026	24 Jul 2024
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	1020	Caren Axella Natania Lumbantoruan	Sergeant	6	House of Thenova		Muly	Nabila	Rizky	Active	1 Feb 2027	26 Jun 2025
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	90100181	Madeleine Cendana	Private	10	House of Quorion		Nabilah	Nabila	Rizky	Active	21 Jan 2027	21 Jul 2026
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	90100216	Jollyne Gretchenavery Zhuotio	Private	8	House of Thenova		Loita	Nabila	Rizky	Active	21 Jan 2027	21 Jul 2026
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	90100218	Phebe Diorra Salim	Private	13	House of Thenova		Nabilah	Nabila	Rizky	Active	21 Jan 2027	21 Jul 2026
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	90100219	Destine Diorra Salim	Private	10	House of Havaria		Nabilah	Nabila	Rizky	Active	21 Jan 2027	21 Jul 2026
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	90100234	Lionel evander jayadi	Private		House of Thenova		Nabilah	Nabila	Rizky	Active	21 Jan 2027	21 Jul 2026
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	90100243	Ryuichi loury 	Private	9	House of Thenova		Nabilah	Nabila	Rizky	Active	21 Jan 2027	21 Jul 2026
Beryl	Tuesday	16:00-18:00	Lyra	Cemara	90100255	Felicia Fransisca	Private	8			Nabilah	Nabila	Rizky	Active	4 Feb 2027	04 Aug 2026
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100044	Velove Alexa Winstan	Sergeant	5	House of Creanova		Agustina	Nabila	Mulyanita	Active	7 May 2027	07 Feb 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100045	David Howard	Sergeant	5	House of Thenova		Agustina	Nabila	Mulyanita	Active	7 Apr 2027	07 Feb 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100108	Vergio Gavino Chaikoff	Private	5	House of Havaria		Loita	Nabila	Mulyanita	Active	5 Mar 2027	05 Aug 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100109	Jolin Thianda	Sergeant	4	House of Thenova		Loita	Nabila	Mulyanita	Active	5 Sep 2026	05 Aug 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100114	Kate Elizabeth Huang	Sergeant	3	House of Thenova		Loita	Nabila	Mulyanita	Active (Grace Period)	5 Aug 2026	05 Aug 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100115	William Lauda	Sergeant	4	House of Havaria		Loita	Nabila	Mulyanita	Active	5 Sep 2026	05 Aug 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100128	Dustin Bradley	Sergeant	5	House of Havaria		Loita	Nabila	Mulyanita	Active	5 Sep 2026	05 Aug 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100136	Miho Qanitah Sihombing	Private	5	House of Reverion		Loita	Nabila	Mulyanita	Active	5 Feb 2027	05 Aug 2025
Amethyst	Tuesday	16:00-18:00	Nova	Cemara	90100140	Jadellyne Gretchenagatha Zhuotio	Sergeant	3	House of Creanova		Loita	Nabila	Mulyanita	Active	5 Mar 2027	05 Aug 2025
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	683	Stanley Ace Lorence	Colonel	6	House of Thenova		Ghaitsa	Rizky	Mulyanita	Active	2 Sep 2026	01 Aug 2023
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	686	Owen Linwood	Lt. Colonel	5	House of Thenova		Rizky	Rizky	Mulyanita	Active	4 Apr 2027	03 Aug 2023
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	751	Howie Chan	Colonel	6	House of Thenova		Ghaitsa	Rizky	Mulyanita	Active	18 Jun 2027	18 Oct 2023
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	857	Hogan Chan	Lt. Colonel	4	House of Thenova		Ghaitsa	Rizky	Mulyanita	Active	17 Mar 2027	17 Jul 2024
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	865	Victoria Yap	Lt. Colonel	6	House of Thenova		Rizky	Rizky	Mulyanita	Active	7 Apr 2027	22 Jul 2024
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	889	Madelyn Odelia Lowis	Colonel	4	House of Thenova		Ghaitsa	Rizky	Mulyanita	Active (Grace Period)	15 Aug 2026	08 Aug 2024
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	948	Erick Winner Teo	Lt. Colonel	6	House of Thenova		Muly	Rizky	Mulyanita	Expired	8 Jul 2026	06 Jan 2025
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	991	Arya Kho	Private	6	House of Quorion		Rizky	Rizky	Mulyanita	Active	29 Dec 2026	23 Apr 2025
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	1044	Dominic Kie	Sergeant	5	House of Quorion		Muly	Rizky	Mulyanita	Active (Grace Period)	7 Aug 2026	25 Jul 2025
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	1074	Ayska Najya Prakasita	Sergeant	4	House of Thenova		Muly	Rizky	Mulyanita	Active	3 Sep 2026	23 Aug 2025
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	1079	Keigo Kusuno Soh	Private	3	House of Reverion		Rizky	Rizky	Mulyanita	Active	3 Oct 2026	26 Aug 2025
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	1080	Reynara Amber Koiman	Private	3	House of Reverion		Rizky	Rizky	Mulyanita	Active	3 Sep 2026	26 Aug 2025
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	1155	Howard Winston Louis	Private	6	House of Thenova		Rizky	Rizky	Mulyanita	Active	22 Nov 2026	17 Apr 2026
Tracy (Sat 4-6)	Wednesday	16:00-18:00	Schomberg	Centre Point	70100113	Jiselle Hartanto	Private	5	House of Thenova		Rizky	Rizky	Mulyanita	Active	6 Nov 2026	06 Aug 2025
Topaz	Wednesday	16:00-18:00	Nova	Cemara	483	Jolie Charlotte Huang	Lt. General	8			Loita	Agustina	Ghaitsa	Active	13 Apr 2027	05 Aug 2022
Topaz	Wednesday	16:00-18:00	Nova	Cemara	876	Jacqueline Vallerie Chen	Lt. Colonel	7	House of Havaria		Agustina	Agustina	Ghaitsa	Expired	1 Aug 2026	29 Jul 2024
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100002	Giselle Liandy	Lt. Colonel	7	House of Quorion		Agustina	Agustina	Ghaitsa	Active	8 Nov 2026	08 Feb 2025
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100067	Victor Alexander Winstan	Sergeant	8	House of Thenova		Agustina	Agustina	Ghaitsa	Active	9 Sep 2027	09 Apr 2025
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100079	Gracella Cangie	Sergeant	11			Agustina	Agustina	Ghaitsa	Active	9 Oct 2026	09 Apr 2025
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100080	Vanessa Cangie	Lt. Colonel	8	House of Havaria		Agustina	Agustina	Ghaitsa	Active	9 Oct 2026	09 Apr 2025
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100097	Annabel Audriana	Sergeant	10	House of Quorion		Agustina	Agustina	Ghaitsa	Active	2 Jan 2027	02 Jul 2025
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100120	Jocelyn Sydney 	Sergeant	11	House of Reverion		Agustina	Agustina	Ghaitsa	Active	7 Sep 2026	07 Aug 2025
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100191	Bosco Lim	Private	12	House of Quorion		Agustina	Agustina	Ghaitsa	Active (Grace Period)	4 Aug 2026	04 Feb 2026
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100198	Jordan Swiss Cliftan 	Private	11	House of Quorion		Agustina	Agustina	Ghaitsa	Active	1 Oct 2026	01 Apr 2026
Topaz	Wednesday	16:00-18:00	Nova	Cemara	90100215	Phebe Lalita	Private	10	House of Quorion		Agustina	Agustina	Ghaitsa	Active	10 Dec 2026	10 Jun 2026
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	582	Ethan Aldrich Lie	Lt. Colonel	7	House of Havaria		Ghaitsa	Muly	Rizky	Active (Grace Period)	17 Aug 2026	14 Feb 2023
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	740	Aubree Lisman	Colonel	8	House of Thenova		Ghaitsa	Muly	Rizky	Active	10 Nov 2026	06 Oct 2023
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	761	Richelle Zheng	Lt. Colonel	7	House of Thenova		Rizky	Muly	Rizky	Active	21 Dec 2026	14 Nov 2023
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	790	Hardey Moeldoko Law	Sergeant	7	House of Reverion		Rizky	Muly	Rizky	Expired	24 Jul 2026	24 Jan 2024
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	947	Nayyara Ayaskara Prakasita	Sergeant	7	House of Quorion		Muly	Muly	Rizky	Active (Grace Period)	16 Aug 2026	26 Dec 2024
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	1027	Elnino Jehanra Saragih	Lt. Colonel	11	House of Creanova		Muly	Muly	Rizky	Active	12 Jan 2027	02 Jul 2025
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	1034	Cherryl Riquelme Potan	Sergeant	8	House of Havaria		Muly	Muly	Rizky	Active (Grace Period)	16 Aug 2026	11 Jul 2025
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	1037	Caitlyn Allison Yaphen	Sergeant	9	House of Havaria		Muly	Muly	Rizky	Active	16 Jan 2027	13 Jul 2025
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	1039	Naafa Maisyva Ginting	Sergeant	8	House of Havaria		Muly	Muly	Rizky	Expired	23 Jul 2026	15 Jul 2025
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	1056	Yeslin Yap	Private	8	House of Thenova		Muly	Muly	Rizky	Active (Grace Period)	13 Aug 2026	07 Aug 2025
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	1129	Stephanie Evelyn Luo	Private	7	House of Thenova		Muly	Muly	Rizky	Active	4 Sep 2026	10 Jan 2026
Gandhi	Wednesday	16:00-18:00	Chesterfield	Centre Point	1154	Aca Raymond Tjemerlang	Private	9	House of Creanova		Ghaitsa	Muly	Rizky	Active	13 Nov 2026	16 Apr 2026
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	676	Grace Alexandra	Colonel	9	House of Havaria		Ghaitsa	Muly	Yona	Active	2 Mar 2027	28 Jul 2023
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	680	Gracelyn Yap	Lt. General	8	House of Quorion		Rizky	Muly	Yona	Active	14 Apr 2027	31 Jul 2023
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	741	Brayden Lisman	Colonel	10	House of Quorion		Ghaitsa	Muly	Yona	Active	27 Oct 2026	06 Oct 2023
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	745	Jesslyn	General	10	House of Thenova		Ghaitsa	Muly	Yona	Active	4 Oct 2026	11 Oct 2023
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	852	Cellistia Cangdiago	Lt. General	11	House of Quorion		Muly	Muly	Yona	Active (Grace Period)	10 Aug 2026	06 Jul 2024
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	896	Nicolas Carlie Kuwira	Lt. General	11	House of Havaria		Ghaitsa	Muly	Yona	Active	11 Mar 2027	22 Aug 2024
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	904	Callista Aurelia Tasma	Colonel	10	House of Thenova		Muly	Muly	Yona	Active	18 Mar 2027	17 Sep 2024
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	911	Meivellynn Thamida	Lt. Colonel	9	House of Thenova		Rizky	Muly	Yona	Active	11 Oct 2026	30 Sep 2024
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	1104	Abbygael Mikaela Tangelyn	Sergeant	8	House of Quorion		Ghaitsa	Muly	Yona	Active	5 May 2027	28 Oct 2025
Galileo (Wed 4-6)	Wednesday	16:00-18:00	Osborne	Centre Point	1161	Randa Miracle Boasly Sihombing	Private	11			Ghaitsa	Muly	Yona	Active	3 Dec 2026	06 May 2026
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100023	Evonne Gwen Lim	Sergeant	4	House of Thenova		Loita	Loita	Loita, Nabila	Active	17 Sep 2026	17 Jul 2024
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100028	Elaine Gwen Lim	Lt. Colonel	4	House of Quorion		Loita	Loita	Loita, Nabila	Active	17 Sep 2026	17 Jul 2024
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100075	Maro Louis Dear Purba	Sergeant	5	House of Thenova		Loita	Loita	Loita, Nabila	Expired	15 Jul 2026	15 Jan 2025
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100098	Erland Sohilida Laia	Sergeant	4	House of Thenova		Loita	Loita	Loita, Nabila	Active (Grace Period)	13 Aug 2026	13 Aug 2025
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100176	Muhammad Asyam Haris Tanjung 	Private	5	House of Quorion		Loita	Loita	Loita, Nabila	Active	17 Jun 2027	17 Jun 2026
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100179	Doria Marchisia Giussevine Saragih	Private	6	House of Thenova		Loita	Loita	Loita, Nabila	Active	1 Jan 2027	01 Jul 2026
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100180	Jevano Septarey Saragih	Private	5	House of Thenova		Loita	Loita	Loita, Nabila	Active	1 Jan 2027	01 Jul 2026
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100186	Alvaro Gavriel Batara Sihotang	Private	7	House of Havaria		Loita	Loita	Loita, Nabila	Active	8 Jan 2027	08 Jul 2026
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100191	Yosihana Hutasoit	Private	7	House of Thenova		Loita	Loita	Loita, Nabila	Active	8 Jan 2027	08 Jul 2026
Cairo	Wednesday	16:00-18:00	Kirana	Tritura	70100193	Nadhira Ayria Verdian		6	House of Havaria		Loita	Loita	Loita, Nabila	Active	22 Jan 2027	22 Jul 2026
Aristotle	Wednesday	16:00-18:00	Apsley	Centre Point	677	Olivia Florence Loesin	Sergeant	6			Muly	Muly	Nabila	Active	29 Jan 2027	28 Jul 2023
Aristotle	Wednesday	16:00-18:00	Apsley	Centre Point	1190	Nalina Vimala	Private	7	House of Thenova		Muly	Muly	Nabila	Active	29 Jan 2027	01 Jul 2026
Aristotle	Wednesday	16:00-18:00	Apsley	Centre Point	1192	Sergio Ronald Utomo	Private	6			Muly	Muly	Nabila	Active	29 Jan 2027	01 Jul 2026
Aristotle	Wednesday	16:00-18:00	Apsley	Centre Point	1194	Max Kingston Marzuki	Private	7			Muly	Muly	Nabila	Active	29 Jan 2027	02 Jul 2026
Aristotle	Wednesday	16:00-18:00	Apsley	Centre Point	1195	Kenzo Wibowo Marzuki	Private	6			Muly	Muly	Nabila	Active	29 Jan 2027	02 Jul 2026
Aristotle	Wednesday	16:00-18:00	Apsley	Centre Point	1196	Grace Martok	Private	5			Muly	Muly	Nabila	Active	29 Jan 2027	04 Jul 2026
Aristotle	Wednesday	16:00-18:00	Apsley	Centre Point	1222	Hans Andersen Yap	Private	6			Muly	Muly	Nabila	Active	29 Jan 2027	22 Jul 2026
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100005	Lyvia Verlynn	Colonel	9	House of Thenova		Loita	Loita	Agustina	Active	8 Sep 2026	08 Jul 2024
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100046	Kirania Inara Azalea	Lt. Colonel	7	House of Thenova		Loita	Loita	Agustina	Active	18 Sep 2026	18 Jul 2024
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100047	Keyzia Faiana Daulay	Lt. Colonel	6	House of Quorion		Loita	Loita	Agustina	Active	18 Sep 2026	18 Jul 2024
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100146	Alexa Brianna Tambunan	Private	6	House of Thenova		Loita	Loita	Agustina	Active	14 Jan 2027	14 Jan 2026
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100167	Arsa Clianta Saragih	Private	8	House of Quorion		Loita	Loita	Agustina	Active	8 Jan 2027	08 Jul 2026
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100168	Mora Leticia Sinaga	Private	8	House of Creanova		Loita	Loita	Agustina	Active	8 Jan 2027	08 Jul 2026
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100175	Ondo Vico Fidelis Giant Sitohang 	Private	8	House of Havaria		Loita	Loita	Agustina	Active	8 Jan 2027	08 Jul 2026
Almeria	Wednesday	16:00-18:00	Elora	Tritura	70100185	Alice Nathalie Brigitta	Private	10	House of Quorion		Loita	Loita	Agustina	Active	8 Jul 2027	08 Jul 2026
Winfrey (Thursday 4-6)	Thursday	16:00-18:00	Chesterfield	Centre Point	779	Jayden Tarmidi	Lt. Colonel	5	House of Havaria		Muly	Rizky	Rizky	Active	25 Nov 2026	22 Dec 2023
Winfrey (Thursday 4-6)	Thursday	16:00-18:00	Chesterfield	Centre Point	863	Bonita Gaudeti Sinaga	Lt. Colonel	4	House of Quorion		Muly	Rizky	Rizky	Active	25 Feb 2027	20 Jul 2024
Winfrey (Thursday 4-6)	Thursday	16:00-18:00	Chesterfield	Centre Point	867	Cherlyn Simen	Sergeant	6	House of Quorion		Muly	Rizky	Rizky	Active	25 Nov 2026	22 Jul 2024
Winfrey (Thursday 4-6)	Thursday	16:00-18:00	Chesterfield	Centre Point	939	Rexcaden Jazper Shu	Lt. Colonel	6	House of Havaria		Muly	Rizky	Rizky	Active	3 Jun 2027	30 Nov 2024
Winfrey (Thursday 4-6)	Thursday	16:00-18:00	Chesterfield	Centre Point	1025	Hermione Lovely Susanto	Sergeant	5	House of Havaria		Muly	Rizky	Rizky	Active	17 Jan 2027	30 Jun 2025
Winfrey (Thursday 4-6)	Thursday	16:00-18:00	Chesterfield	Centre Point	1029	Luna Antoinette Linne	Sergeant	4	House of Havaria		Muly	Rizky	Rizky	Active	8 Sep 2026	04 Jul 2025
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	149	Elaine Velicia	Lt. Colonel	6	House of Quorion		Muly	Ghaitsa	Ghaitsa	Active (Grace Period)	9 Aug 2026	13 Nov 2021
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	482	Reizo Kazuo Wong	Colonel	11	House of Havaria		Ghaitsa	Ghaitsa	Ghaitsa	Active (Grace Period)	15 Aug 2026	04 Aug 2022
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	767	Theodore Joachim Wihardjo	Sergeant	8	House of Havaria		Muly	Ghaitsa	Ghaitsa	Active	30 Jun 2027	23 Nov 2023
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	803	Lovea Fendy Kho	Lt. General	10	House of Quorion		Ghaitsa	Ghaitsa	Ghaitsa	Active	6 Sep 2026	02 Mar 2024
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	819	Maria Jill Lumbantoruan	Lt. Colonel	9	House of Thenova		Rizky	Ghaitsa	Ghaitsa	Active	16 Apr 2027	08 Apr 2024
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	866	Carlsen Simen	Sergeant	8	House of Reverion		Muly	Ghaitsa	Ghaitsa	Active	25 Nov 2026	22 Jul 2024
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	996	Venesia Anggini Purba	Sergeant	9	House of Reverion		Muly	Ghaitsa	Ghaitsa	Active	17 Jan 2027	20 May 2025
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	1125	Grace Anastasia Zeng	Sergeant	8	House of Havaria		Rizky	Ghaitsa	Ghaitsa	Active	5 Sep 2026	27 Dec 2025
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	1130	Ethan Ray Maxwell	Sergeant	10	House of Thenova		Rizky	Ghaitsa	Ghaitsa	Expired	29 Jul 2026	15 Jan 2026
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	1134	Kent Nanda Daruma	Private	11	House of Quorion		Muly	Ghaitsa	Ghaitsa	Active (Grace Period)	5 Aug 2026	29 Jan 2026
Grande (Thu 4-6 PM)	Thursday	16:00-18:00	Schomberg	Centre Point	1137	Celine Angeline Yiandri	Private	10	House of Havaria		Muly	Ghaitsa	Ghaitsa	Active	26 Sep 2026	01 Feb 2026
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100112	Richie Alvaro Tandinata	Sergeant	8	House of Thenova		Agustina	Agustina	Loita, Nabila	Active	7 Feb 2027	07 Aug 2025
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100127	Davin Bradford	Sergeant	8	House of Thenova		Loita	Agustina	Loita, Nabila	Active	7 Sep 2026	07 Aug 2025
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100130	Maurice Claire Genevieve	Private	8			Agustina	Agustina	Loita, Nabila	Active (Grace Period)	7 Aug 2026	07 Aug 2025
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100143	Jason Lewis Theo	Sergeant	7	House of Quorion		Agustina	Agustina	Loita, Nabila	Active	7 Feb 2027	07 Aug 2025
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100200	Galent hansen wuner	Private	8	House of Quorion		Agustina	Agustina	Loita, Nabila	Active	23 Oct 2026	23 Apr 2026
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100206	Metta Louise ellen	Sergeant	11	House of Havaria		Agustina	Agustina	Loita, Nabila	Active	7 Nov 2026	07 May 2026
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100217	CHARLIE MIKKELSEN YAP	Private	8	House of Thenova		Agustina	Agustina	Loita, Nabila	Active	16 Jan 2027	16 Jul 2026
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100225	Richelle lim	Private	11	House of Thenova		Nabilah	Agustina	Loita, Nabila	Active	23 Jan 2027	23 Jul 2026
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100228	Hanson julio tanadi	Private	12	House of Reverion		Nabilah	Agustina	Loita, Nabila	Active	23 Jan 2027	23 Jul 2026
Azurite	Thursday	16:00-18:00	Nova	Cemara	90100236	WINSTON XAVERIUS JUNIO	Private	10	House of Creanova		Nabilah	Agustina	Loita, Nabila	Active	9 Jan 2027	09 Jul 2026
Neverland	Friday	14:00-15:30	Apsley	Centre Point	898	Ricson Stanlay		2			Muly	Muly	Mulyanita	Active	20 Jan 2027	26 Aug 2024
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1043	Kenrich Thantio Yangderson		2			Muly	Muly	Mulyanita	Active	1 Jul 2027	24 Jul 2025
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1066	Samuel Christopher Halim		2			Muly	Muly	Mulyanita	Active	20 Jan 2027	21 Aug 2025
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1122	Leeanne Jane Lim		2			Rizky	Muly	Mulyanita	Active	6 Jan 2027	23 Dec 2025
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1142	Oscar Linwood		1			Rizky	Muly	Mulyanita	Active	10 Jan 2027	03 Mar 2026
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1145	Gallen Yuman King		2			Ghaitsa	Muly	Mulyanita	Active	10 Jan 2027	14 Mar 2026
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1172	Ferdian Zulkarnain		3			Muly	Muly	Mulyanita	Active	10 Jan 2027	08 Jun 2026
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1182	Stella Wijaya		2			Muly	Muly	Mulyanita	Active	10 Jan 2027	26 Jun 2026
Neverland	Friday	14:00-15:30	Apsley	Centre Point	1206	Daniel Haryanto		2			Muly	Muly	Mulyanita	Active	10 Jan 2027	09 Jul 2026
Duloc	Friday	14:30-16:00	Vega	Cemara	90100137	Keiko Hanara Sihombing		1			Loita	Agustina	Agustina	Active	19 Dec 2026	19 Sep 2025
Duloc	Friday	14:30-16:00	Vega	Cemara	90100139	Mikayla Seline Wu		2			Agustina	Agustina	Agustina	Active	19 Dec 2026	19 Sep 2025
Duloc	Friday	14:30-16:00	Vega	Cemara	90100161	Harvey Taufik		1			Agustina	Agustina	Agustina	Active	19 Dec 2026	19 Sep 2025
Duloc	Friday	14:30-16:00	Vega	Cemara	90100163	Videline Gillian Chaikoff		2			Loita	Agustina	Agustina	Expired	19 Jul 2026	19 Sep 2025
Duloc	Friday	14:30-16:00	Vega	Cemara	90100177	Dominica Cherish Sheiramoth		2			Agustina	Agustina	Agustina	Expired	9 Jul 2026	09 Jan 2026
Duloc	Friday	14:30-16:00	Vega	Cemara	90100189	Abigail avery ashari		2			Agustina	Agustina	Agustina	Active	30 Dec 2026	30 Jan 2026
Duloc	Friday	14:30-16:00	Vega	Cemara	90100194	Tyler Howard Tohnika		1			Agustina	Agustina	Agustina	Active	27 Dec 2026	27 Feb 2026
Duloc	Friday	14:30-16:00	Vega	Cemara	90100197	Jeffrey Yap		1			Agustina	Agustina	Agustina	Active	10 Jan 2027	10 Apr 2026
Duloc	Friday	14:30-16:00	Vega	Cemara	90100203	Clarice Valenzka Wijaya		2			Nabilah	Agustina	Agustina	Active	3 Jan 2027	03 Jul 2026
Duloc	Friday	14:30-16:00	Vega	Cemara	90100233	Sam Lincoln Kane		3			Agustina	Agustina	Agustina	Active	10 Jan 2027	10 Jul 2026
Duloc	Friday	14:30-16:00	Vega	Cemara	90100237	Callista Aurora Welopo		3			Agustina	Agustina	Agustina	Active	17 Jan 2027	17 Jul 2026
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	136	Claudine Joshanley	Lt. Colonel	6	House of Creanova		Ghaitsa	Rizky	Rizky	Active	28 Sep 2026	27 Jan 2023
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	625	Audrey Hartono Lee	Private	3	House of Creanova		Muly	Rizky	Rizky	Active	28 Oct 2026	23 May 2023
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	629	Joey Frederica Ang	Private	3	House of Havaria		Rizky	Rizky	Rizky	Active	28 Apr 2027	30 May 2023
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	651	Ashley Claire Lorence	Private	3	House of Thenova		Muly	Rizky	Rizky	Active	28 Nov 2026	10 Jul 2023
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	726	Renzo Tanaka	Lt. Colonel	6	House of Thenova		Ghaitsa	Rizky	Rizky	Expired	29 Jul 2026	23 Sep 2023
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	859	Clarissa Kho	Private	3	House of Thenova		Muly	Rizky	Rizky	Active	19 Nov 2026	18 Jul 2024
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	874	Muhammad Rafli Arkan	Sergeant	4	House of Thenova		Ghaitsa	Rizky	Rizky	Expired	1 Aug 2026	26 Jul 2024
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	937	Jillian Claire Kuanrius	Sergeant	4	House of Thenova		Rizky	Rizky	Rizky	Active	10 Aug 2027	22 Nov 2024
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	955	Naomi Grace Edward	Sergeant	5	House of Havaria		Muly	Rizky	Rizky	Expired	24 Jul 2026	17 Jan 2025
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	1040	Shane Anastasya Kristy Simangunsong	Sergeant	4	House of Thenova		Muly	Rizky	Rizky	Active	25 Jan 2027	17 Jul 2025
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	1047	Jordan Tanutama	Private	3	House of Quorion		Muly	Rizky	Rizky	Active	1 Feb 2027	29 Jul 2025
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	1101	Fredella Alexa Maranggi Siregar	Private	3	House of Quorion		Muly	Rizky	Rizky	Active	6 May 2027	11 Oct 2025
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	1102	Adhyasta William Nugroho	Private	4			Ghaitsa	Rizky	Rizky	Active (Grace Period)	7 Aug 2026	16 Oct 2025
Graham	Friday	15:00-17:00	Chesterfield	Centre Point	1209	Michele Cecilia Belvania Saragih	Private	7	House of Havaria		Rizky	Rizky	Rizky	Active	24 Jan 2027	11 Jul 2026
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	285	Clairine Joshanley	Colonel	8	House of Thenova		Ghaitsa	Muly	Ricky	Active	4 Oct 2026	04 Jun 2021
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	429	Charrelle Anthony	General	12	House of Creanova		Ghaitsa	Muly	Ricky	Expired	22 Jul 2026	22 Apr 2022
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	613	Junior Auson Halim	Lt. Colonel	9			Muly	Muly	Ricky	Active	2 Nov 2026	15 Apr 2023
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	716	Chloe Vallerie Jie	Lt. Colonel	11	House of Reverion		Muly	Muly	Ricky	Active	1 Feb 2027	07 Sep 2023
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	855	Cayden Louis Auwrich	Sergeant	8	House of Quorion		Rizky	Muly	Ricky	Active	2 Apr 2027	12 Jul 2024
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1015	Fransisca	Sergeant	11	House of Quorion		Muly	Muly	Ricky	Active	11 Jan 2027	21 Jun 2025
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1031	Jacques Lewinsky	Sergeant	9	House of Thenova		Muly	Muly	Ricky	Active	11 Jan 2027	09 Jul 2025
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1045	Silvario Soedidjo	Sergeant	10	House of Thenova		Muly	Muly	Ricky	Active (Grace Period)	8 Aug 2026	27 Jul 2025
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1062	Queensya Lovely Reya	Sergeant	9	House of Thenova		Rizky	Muly	Ricky	Active (Grace Period)	26 Aug 2026	20 Aug 2025
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1077	Alqueenza Syifa Winona	Sergeant	7	House of Thenova		Rizky	Muly	Ricky	Active	26 Jul 2027	25 Aug 2025
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1086	Kayden Ethan Zhou	Private	7			Muly	Muly	Ricky	Active	12 Sep 2026	08 Sep 2025
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1177	James Edward Lie		11			Ghaitsa	Muly	Ricky	Active	26 Dec 2026	19 Jun 2026
Clinton (Fri 3-5)	Friday	15:00-17:00	Schomberg	Centre Point	1193	Cheryl Eilyn Affandy	Private	10	House of Reverion		Ghaitsa	Muly	Ricky	Active	24 Jan 2027	01 Jul 2026
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100086	Maria Graciana Chica Purba		2			Loita	Loita	Loita	Active	12 Jan 2027	12 Apr 2025
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100118	Cladys Nadine Frietania		2			Loita	Loita	Loita	Active	18 Dec 2026	12 Sep 2025
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100126	Berliando Lovely Sihombing		1			Loita	Loita	Loita	Active	18 Dec 2026	12 Sep 2025
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100128	Syia Kim		1			Loita	Loita	Loita	Active	12 Dec 2026	12 Sep 2025
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100154	Ashera Natama Sitorus		2			Loita	Loita	Loita	Active	24 Dec 2026	24 Apr 2026
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100177	Raphael Evan Hiro Ompusunggu		4			Loita	Loita	Loita	Active	3 Jan 2027	03 Jul 2026
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100189	Lashira Naifa Alamsyah Nasution		4			Loita	Loita	Loita	Active	3 Jan 2027	03 Jul 2026
Sherwood Forest	Friday	15:30-17:00	Raya	Tritura	70100194	Danella Christabel Hasean Saragih		2			Loita	Loita	Loita	Active	31 Dec 2026	31 Jul 2026
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100059	Rebecca Florencia Siregar	Colonel	5	House of Havaria		Loita	Loita	Qoriah	Active	13 Sep 2026	13 Sep 2024
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100063	Calysta Celorine Bakara	Sergeant	3	House of Quorion		Loita	Loita	Qoriah	Active	20 Jan 2027	20 Sep 2024
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100064	Rachel Nathania Situmorang	Sergeant	3	House of Creanova		Loita	Loita	Qoriah	Active (Grace Period)	20 Aug 2026	20 Sep 2024
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100071	Muhammad Al Khawarizmi Fairel	Private	3	House of Thenova		Loita	Loita	Qoriah	Active	1 Apr 2027	01 Nov 2024
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100077	Aldiana Masha Lovelia Br Sembiring	Sergeant	4			Loita	Loita	Qoriah	Expired	17 Jul 2026	17 Jan 2025
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100090	Annisa Letizia Shanum	Sergeant	5	House of Reverion		Loita	Loita	Qoriah	Active	28 Apr 2027	28 Mar 2025
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100122	Shadrina Azheema Lubis	Sergeant	5	House of Creanova		Loita	Loita	Qoriah	Active	19 Sep 2026	19 Sep 2025
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100123	Shafiqa Adeeva Lubis	Sergeant	3	House of Thenova		Loita	Loita	Qoriah	Active	19 Sep 2026	19 Sep 2025
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100150	Nadhira Calista Purba	Private	3	House of Thenova		Loita	Loita	Qoriah	Active	10 Oct 2026	10 Apr 2026
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100153	Dareen Azel Matthew Sembiring	Private	4	House of Thenova		Loita	Loita	Qoriah	Active	6 Feb 2027	06 Feb 2026
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100156	Tengku Muhammad Malik Al Fatih	Private	3	House of Havaria		Loita	Loita	Qoriah	Active (Grace Period)	27 Aug 2026	27 Feb 2026
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100159	Nadia Fathaniah Chandra	Private	4	House of Thenova		Loita	Loita	Qoriah	Active	10 Oct 2026	10 Apr 2026
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100166	Farrin Rafania Shezan Lubis	Private	6	House of Havaria		Loita	Loita	Qoriah	Active	17 Jan 2027	17 Jul 2026
Eldorado	Friday	15:30-17:30	Elora	Tritura	70100188	Latisya Naya Alamsyah Nasution	Private	6	House of Thenova		Loita	Loita	Qoriah	Active	3 Jan 2027	03 Jul 2026
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100078	Sakina Alima Regune Harahap	Lt. General	11	House of Thenova		Loita	Loita	Devina, Angeline	Active	7 Sep 2026	07 Feb 2025
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100112	Fathi Arkan Wiyatmika	Sergeant	8	House of Havaria		Loita	Loita	Devina, Angeline	Active	18 Jan 2027	18 Jul 2025
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100127	Gabriel Ihut Martuaro Sihombing	Sergeant	7	House of Havaria		Loita	Loita	Devina, Angeline	Active	12 Sep 2026	12 Sep 2025
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100148	Davina Elisha Ginting	Sergeant	8	House of Havaria		Loita	Loita	Devina, Angeline	Expired	30 Jul 2026	30 Jan 2026
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100151	Fakhira Idris Harahap	Private	7	House of Havaria		Loita	Loita	Devina, Angeline	Active (Grace Period)	6 Aug 2026	06 Feb 2026
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100152	Abigail Carissa 	Private	8	House of Thenova		Loita	Loita	Devina, Angeline	Expired	30 Jul 2026	30 Jan 2026
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100158	Gracelyn Patricia	Sergeant	9	House of Thenova		Loita	Loita	Devina, Angeline	Active	6 Sep 2026	06 Mar 2026
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100173	Muhammad Naufal Athariz Ritonga	Private	9	House of Thenova		Loita	Loita	Devina, Angeline	Active	12 Dec 2026	12 Jun 2026
Atlanta	Friday	15:30-17:30	Kirana	Tritura	70100196	Abdullah Syafa Assyunni Rangkuti	Private	8	House of Thenova		Loita	Loita	Devina, Angeline	Active	24 Jan 2027	24 Jul 2026
Atlanta	Friday	15:30-17:30	Kirana	Tritura	90100176	Rahma Nakita Afifah	Private	11	House of Thenova		Loita	Loita	Devina, Angeline	Active	9 Jan 2027	09 Jan 2026
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	269	Fresia Victoria Chendry	Lt. General	9	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	14 Sep 2026	14 Jan 2022
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	410	Dyra Muntazsirah	Colonel	9	House of Havaria		Ghaitsa	Ghaitsa	Ghaitsa	Active	19 Nov 2026	19 Mar 2021
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	545	Brandon Chiang	Lt. General	9	House of Quorion		Ghaitsa	Ghaitsa	Ghaitsa	Active	14 Oct 2026	07 Oct 2022
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	569	Josevin Carel H.	Lt. Colonel	9	House of Quorion		Ghaitsa	Ghaitsa	Ghaitsa	Active	7 Sep 2026	02 Jan 2023
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	910	Michael Thamida	Sergeant	11	House of Thenova		Rizky	Ghaitsa	Ghaitsa	Active	11 Oct 2026	30 Sep 2024
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	994	Valisha Sofi Tjandra	Private	10	House of Havaria		Rizky	Ghaitsa	Ghaitsa	Active	16 Nov 2026	15 May 2025
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	1116	Kim Megumi	Private	8	House of Quorion		Rizky	Ghaitsa	Ghaitsa	Active	5 Dec 2026	18 Nov 2025
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	1127	Edric Luiz Ongka	Private	9	House of Reverion		Rizky	Ghaitsa	Ghaitsa	Expired	23 Jul 2026	06 Jan 2026
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	1151	Theona Zefanya Purba	Private	8	House of Havaria		Rizky	Ghaitsa	Ghaitsa	Active	17 Oct 2026	02 Apr 2026
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	1152	Javerson Joshua Tobing	Private	8	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	17 Oct 2026	02 Apr 2026
Sigmund	Friday	16:00-18:00	Apsley	Centre Point	1217	Daxton Lie	Private	11			Rizky	Ghaitsa	Ghaitsa	Active	31 Jan 2027	18 Jul 2026
Ruby	Friday	16:00-18:00	Nova	Cemara	375	Darren Gabriel	Colonel	8	House of Reverion		Agustina	Agustina	Viorentina	Active	8 May 2027	09 Feb 2022
Ruby	Friday	16:00-18:00	Nova	Cemara	600	Gyan Lucero Joenardi	Colonel	7	House of Thenova		Agustina	Agustina	Viorentina	Active	2 Jan 2027	24 Mar 2023
Ruby	Friday	16:00-18:00	Nova	Cemara	90100007	Carrick Classico	Sergeant	9	House of Reverion		Agustina	Agustina	Viorentina	Active	10 Sep 2026	10 Jan 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100013	Candice Julian Sakiwa	Sergeant	10	House of Reverion		Agustina	Agustina	Viorentina	Active	9 Oct 2026	09 Apr 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100020	Winston Hubert	Lt. General	11	House of Thenova		Agustina	Agustina	Viorentina	Active	10 Feb 2027	10 Jan 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100022	Jeanice Wu	Sergeant	8	House of Quorion		Agustina	Agustina	Viorentina	Active	10 Jul 2027	10 Jan 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100042	Justin Nawi	Private	8	House of Creanova		Loita	Agustina	Viorentina	Active	10 Jan 2027	10 Jan 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100056	Thalissha Yeonan	Sergeant	8	House of Quorion		Agustina	Agustina	Viorentina	Active	7 Feb 2027	07 Feb 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100082	Tang En Xin	Sergeant	8	House of Quorion		Agustina	Agustina	Viorentina	Active	25 Oct 2026	25 Apr 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100083	Filbert Laithen	Sergeant	8	House of Havaria		Agustina	Agustina	Viorentina	Active	2 Nov 2026	02 May 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100093	Jesslyn Lee	Private	10	House of Thenova		Agustina	Agustina	Viorentina	Expired	11 Jul 2026	11 Jul 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100099	Rowan Tirta Lee	Private	8	House of Havaria		Agustina	Agustina	Viorentina	Expired	11 Jul 2026	11 Jul 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100153	Ethan Putra Gotama	Sergeant	8	House of Havaria		Agustina	Agustina	Viorentina	Active	1 Aug 2027	01 Aug 2025
Ruby	Friday	16:00-18:00	Nova	Cemara	90100192	Jayden Jingga	Private	8	House of Thenova		Agustina	Agustina	Viorentina	Active	6 Sep 2026	06 Mar 2026
Ruby	Friday	16:00-18:00	Nova	Cemara	90100196	Jordan Philip Wihono	Private	2	House of Thenova		Agustina	Agustina	Viorentina	Active	15 Nov 2026	15 May 2026
Ruby	Friday	16:00-18:00	Nova	Cemara	90100210	Wilbenzs Howard	Private	8	House of Thenova		Agustina	Agustina	Viorentina	Active	17 Jan 2027	17 Jul 2026
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	255	Denzel Geraldo Wijaya	Sergeant	4	House of Reverion		Agustina	Nabila	Averina, Nabila	Active	25 Nov 2026	06 Nov 2022
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	490	Shane Ferrucio Lim	Lt. Colonel	4	House of Havaria		Ghaitsa	Nabila	Averina, Nabila	Active	6 Aug 2027	06 Aug 2022
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	638	Chloe Olivia Ruslie	Lt. Colonel	5	House of Quorion		Agustina	Nabila	Averina, Nabila	Active	11 Jan 2027	16 Jun 2023
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	639	Bianca Olivia Ruslie	Sergeant	3	House of Thenova		Agustina	Nabila	Averina, Nabila	Active	28 Nov 2026	16 Jun 2023
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	90100049	Harvey Susanto	Sergeant	4	House of Havaria		Agustina	Nabila	Averina, Nabila	Active	7 Sep 2026	07 Feb 2025
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	90100087	Finn Maxwell	Sergeant	5	House of Havaria		Agustina	Nabila	Averina, Nabila	Active	9 Dec 2026	09 May 2025
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	90100094	Feliks Ananda Lee	Private	5	House of Havaria		Agustina	Nabila	Averina, Nabila	Expired	11 Jul 2026	11 Jul 2025
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	90100188	Rebecca kelly ashari	Private	5	House of Thenova		Agustina	Nabila	Averina, Nabila	Expired	30 Jul 2026	30 Jan 2026
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	90100190	Daphne Nathania Ang	Private	4	House of Thenova		Agustina	Nabila	Averina, Nabila	Active (Grace Period)	6 Aug 2026	06 Feb 2026
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	90100193	Tyra Louise Tohnika	Private	3	House of Thenova		Agustina	Nabila	Averina, Nabila	Active (Grace Period)	27 Aug 2026	27 Feb 2026
Alexandrite	Friday	16:00-18:00	Lyra	Cemara	90100245	Mason Ivander Cahaya	Private	6	House of Thenova		Nabilah	Nabila	Averina, Nabila	Active	17 Jan 2027	17 Jul 2026
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	838	Louis Harvey Soesanto		2			Muly	Muly	Angelika	Active	19 Jan 2027	07 Jun 2024
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1065	Maxwell Louis Jaya		1			Muly	Muly	Angelika	Active	10 Mar 2027	21 Aug 2025
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1073	Scarlett Avery Ten		1			Muly	Muly	Angelika	Active	20 Feb 2027	23 Aug 2025
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1084	Leonard Nyoto		1			Rizky	Muly	Angelika	Active	20 Jan 2027	04 Sep 2025
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1085	Garent Nyoto		2			Rizky	Muly	Angelika	Active	20 Jan 2027	04 Sep 2025
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1115	Reagan Oliver Zhuang		2			Ghaitsa	Muly	Angelika	Active	14 Dec 2026	15 Nov 2025
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1117	Claire Gabrielle Oscar		2			Ghaitsa	Muly	Angelika	Active	20 Mar 2027	18 Nov 2025
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1140	Keita Raelyn Deng		2			Ghaitsa	Muly	Angelika	Active	11 Feb 2027	11 Feb 2026
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1141	Joyce Nathania Shen		2			Ghaitsa	Muly	Angelika	Active	21 Jan 2027	11 Feb 2026
Wonderland	Saturday	10:00-11:30	Apsley	Centre Point	1189	Kennan Eito Shankara		2			Muly	Muly	Angelika	Active	11 Jan 2027	01 Jul 2026
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	528	Kiery Keionna Kie	Lt. Colonel	6	House of Havaria		Rizky	Rizky	Rizky	Active	24 Dec 2026	08 Sep 2022
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	601	Mikaella Hutteleigh Ng	Colonel	6	House of Thenova		Ghaitsa	Rizky	Rizky	Active	20 Jul 2027	24 Mar 2023
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	604	Hugo Viandi	Lt. Colonel	6	House of Havaria		Rizky	Rizky	Rizky	Active (Grace Period)	15 Aug 2026	27 Mar 2023
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	707	Samho Gunawan	Lt. Colonel	6	House of Thenova		Ghaitsa	Rizky	Rizky	Active	11 Apr 2027	28 Aug 2023
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	785	Kelly Alyse Tanary	Lt. Colonel	4	House of Havaria		Rizky	Rizky	Rizky	Active	16 Aug 2027	13 Jan 2024
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	909	Keona Jaileynn Lawrence	Sergeant	5	House of Havaria		Rizky	Rizky	Rizky	Active	12 Oct 2026	30 Sep 2024
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	935	Gisella Nyoto	Sergeant	4	House of Havaria		Rizky	Rizky	Rizky	Active	14 Jun 2027	19 Nov 2024
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	938	Reagan Nyoto	Sergeant	4	House of Havaria		Rizky	Rizky	Rizky	Active	14 Jun 2027	23 Nov 2024
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	981	Joey Milan Phen	Sergeant	4	House of Thenova		Ghaitsa	Rizky	Rizky	Active	8 Apr 2027	27 Mar 2025
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	1090	Healey Tjoe	Private	4	House of Quorion		Muly	Rizky	Rizky	Active	11 Apr 2027	23 Sep 2025
Robbins (Sat 1-3)	Saturday	10:00-12:00	Chesterfield	Centre Point	1118	Reagan Thierry Wijaya	Private	6	House of Thenova		Ghaitsa	Rizky	Rizky	Active	11 Oct 2026	19 Nov 2025
Jade	Saturday	10:00-12:00	Nova	Cemara	249	Emily Santo	Sergeant	7	House of Havaria		Agustina	Agustina	Nabila, Lisa	Active	22 May 2027	02 Dec 2021
Jade	Saturday	10:00-12:00	Nova	Cemara	602	Alexandra Joan Micheline	Colonel	6	House of Creanova		Agustina	Agustina	Nabila, Lisa	Active	22 Sep 2026	24 Mar 2023
Jade	Saturday	10:00-12:00	Nova	Cemara	90100036	Carlos Ferdinand Putra	Sergeant	7	House of Thenova		Agustina	Agustina	Nabila, Lisa	Active	25 Jul 2027	25 Jan 2025
Jade	Saturday	10:00-12:00	Nova	Cemara	90100043	Valentino Owen Liu	Private	7	House of Thenova		Agustina	Agustina	Nabila, Lisa	Active	22 Feb 2027	22 Feb 2025
Jade	Saturday	10:00-12:00	Nova	Cemara	90100068	Ixchel Lowell Tankiono	Sergeant	7	House of Creanova		Agustina	Agustina	Nabila, Lisa	Active	15 Sep 2026	15 Mar 2025
Jade	Saturday	10:00-12:00	Nova	Cemara	90100074	Faulina Theresia Pangaribuan	Private	9	House of Creanova		Loita	Agustina	Nabila, Lisa	Active	29 Sep 2026	29 Mar 2025
Jade	Saturday	10:00-12:00	Nova	Cemara	90100195	Sarah Oktorela Sitorus	Private	9			Agustina	Agustina	Nabila, Lisa	Active	21 Sep 2026	21 Mar 2026
Jade	Saturday	10:00-12:00	Nova	Cemara	90100204	Chloe Wong	Private	8	House of Havaria		Nabilah	Agustina	Nabila, Lisa	Active	4 Jan 2027	04 Jul 2026
Jade	Saturday	10:00-12:00	Nova	Cemara	90100207	Darynne Clarabelle Yuan	Private	12	House of Thenova		Nabilah	Agustina	Nabila, Lisa	Active	8 Feb 2027	08 Aug 2026
Jade	Saturday	10:00-12:00	Nova	Cemara	90100211	Callista Aurelia alven 	Private	7	House of Havaria		Agustina	Agustina	Nabila, Lisa	Active	16 Nov 2026	16 May 2026
Jade	Saturday	10:00-12:00	Nova	Cemara	90100221	Ryan Aurelio Bustamin	Private	8	House of Havaria		Agustina	Agustina	Nabila, Lisa	Active	11 Jan 2027	11 Jul 2026
Jade	Saturday	10:00-12:00	Nova	Cemara	90100249	Ahmad Hanif	Private	8	House of Thenova		Nabilah	Agustina	Nabila, Lisa	Active	25 Jan 2027	25 Jul 2026
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	621	Ufaira Tiandra Dalimunthe	Lt. Colonel	8	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	17 Jun 2027	06 May 2023
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	633	Fiona Jolys Chong	Colonel	8	House of Havaria		Ghaitsa	Ghaitsa	Ghaitsa	Active (Grace Period)	17 Aug 2026	10 Jun 2023
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	636	Zia Arafa Khairina	Lt. Colonel	8	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	20 Oct 2026	13 Jun 2023
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	675	Maxen Zo Leon	Lt. Colonel	6	House of Havaria		Ghaitsa	Ghaitsa	Ghaitsa	Active	2 Aug 2027	26 Jul 2023
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	704	Morgan Valentino Lowis	Lt. Colonel	8	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	9 Sep 2026	25 Aug 2023
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	735	Kenward Melvern Djohan	Lt. Colonel	8	House of Havaria		Ghaitsa	Ghaitsa	Ghaitsa	Active	30 Apr 2027	03 Oct 2023
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	736	Kendrick Melvern Djohan	Lt. Colonel	7	House of Reverion		Ghaitsa	Ghaitsa	Ghaitsa	Active	30 Apr 2027	03 Oct 2023
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	880	Joel Edward	Lt. Colonel	9	House of Havaria		Muly	Ghaitsa	Ghaitsa	Active (Grace Period)	16 Aug 2026	02 Aug 2024
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	897	Valerie Ivana Chen	Sergeant	8	House of Quorion		Rizky	Ghaitsa	Ghaitsa	Active	10 Sep 2026	22 Aug 2024
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	1030	Valerie Rosalyn Yap	Private	7			Muly	Ghaitsa	Ghaitsa	Expired	19 Jul 2026	08 Jul 2025
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	1071	Chloe Aurelia Ten	Sergeant	8	House of Quorion		Muly	Ghaitsa	Ghaitsa	Active	6 Apr 2027	23 Aug 2025
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	1075	Bryan Michael Ng	Sergeant	9			Muly	Ghaitsa	Ghaitsa	Active	6 Jun 2027	23 Aug 2025
Gates (Sat 10-12)	Saturday	10:00-12:00	Schomberg	Centre Point	1076	Brayden Matthew Ng	Sergeant	6			Muly	Ghaitsa	Ghaitsa	Active	6 Jun 2027	23 Aug 2025
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100021	Aidan Benjamin Yapar	Private	3	House of Thenova		Agustina	Agustina	Loita	Expired	1 Aug 2026	01 Feb 2025
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100086	Eric Williarn	Private	5	House of Creanova		Agustina	Agustina	Loita	Active	19 Mar 2027	19 Jul 2025
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100102	Chloe Marche Khu	Private	3	House of Quorion		Agustina	Agustina	Loita	Active	7 Sep 2026	07 Jun 2025
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100116	Janessa Hofang	Private	5	House of Thenova		Agustina	Agustina	Loita	Active	26 Jan 2027	26 Jul 2025
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100117	Jarell Hofang	Private	5	House of Havaria		Agustina	Agustina	Loita	Active	26 Jan 2027	26 Jul 2025
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100173	Jeneiro	Private	3	House of Havaria		Agustina	Agustina	Loita	Active	22 Jun 2027	22 Nov 2025
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100180	Jayden jiefferson	Private	4	House of Havaria		Agustina	Agustina	Loita	Expired	24 Jul 2026	24 Jan 2026
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100183	Heinz victorio zhou	Private	4	House of Thenova		Agustina	Agustina	Loita	Active	31 Jul 2027	31 Jan 2026
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100235	Hermione Emmilia Artjim	Private	6			Nabilah	Agustina	Loita	Active	11 Jan 2027	11 Jul 2026
Emerald	Saturday	10:00-12:00	Lyra	Cemara	90100251	Felix Austin Lumbantobing	Private	5	House of Havaria		Nabilah	Agustina	Loita	Active	18 Jan 2027	18 Jul 2026
Denver	Saturday	10:00-12:00	Elora	Tritura	673	Nathan Immanuel Winanto	Sergeant	4	House of Havaria		Loita	Loita	Agustina	Active	29 Nov 2026	26 Jul 2023
Denver	Saturday	10:00-12:00	Elora	Tritura	70100004	Maryam Shareen Anandifa	Lt. Colonel	4	House of Havaria		Loita	Loita	Agustina	Active	4 Oct 2026	18 Jul 2024
Denver	Saturday	10:00-12:00	Elora	Tritura	70100041	Raisha Adila Gunawan	Lt. Colonel	5	House of Creanova		Loita	Loita	Agustina	Active (Grace Period)	20 Aug 2026	13 Jul 2024
Denver	Saturday	10:00-12:00	Elora	Tritura	70100106	Dareen Davinci Ginting	Sergeant	5	House of Havaria		Loita	Loita	Agustina	Active	26 Jul 2027	26 Jul 2025
Denver	Saturday	10:00-12:00	Elora	Tritura	70100160	Jordan Noel Yap	Private	4	House of Thenova		Loita	Loita	Agustina	Active	11 Oct 2026	11 Apr 2026
Denver	Saturday	10:00-12:00	Elora	Tritura	70100174	Jerrick Onggoro Hakim	Private	5	House of Thenova		Loita	Loita	Agustina	Active	13 Dec 2026	13 Jun 2026
Denver	Saturday	10:00-12:00	Elora	Tritura	70100184	Atha Malik Chairmawan	Private	5	House of Thenova		Loita	Loita	Agustina	Active	4 Jan 2027	04 Jul 2026
Denver	Saturday	10:00-12:00	Elora	Tritura	70100192	Kania Laviza Andhini	Private	5	House of Thenova		Loita	Loita	Agustina	Active	1 Feb 2027	01 Aug 2026
Denver	Saturday	10:00-12:00	Elora	Tritura	70100195	Marisca Agustina Br Surbakti	Private	6	House of Thenova		Loita	Loita	Agustina	Active	1 Feb 2027	01 Aug 2026
Denver	Saturday	10:00-12:00	Elora	Tritura	70100197	Keira Agatha Dameria Resubun	Private	7			Loita	Loita	Agustina	Active	1 Feb 2027	01 Aug 2026
Dale (Sat 4-6)	Saturday	10:00-12:00	Osborne	Centre Point	927	Richela Stanlay	Sergeant	3	House of Thenova		Muly	Muly	Ricky	Active	11 Feb 2027	01 Nov 2024
Dale (Sat 4-6)	Saturday	10:00-12:00	Osborne	Centre Point	942	Elaine Viandi	Sergeant	3	House of Havaria		Rizky	Muly	Ricky	Active	18 Nov 2026	05 Dec 2024
Dale (Sat 4-6)	Saturday	10:00-12:00	Osborne	Centre Point	1057	Louis Xavier Leonardi	Private	3	House of Thenova		Muly	Muly	Ricky	Active	20 Mar 2027	12 Aug 2025
Dale (Sat 4-6)	Saturday	10:00-12:00	Osborne	Centre Point	1060	Zac Aldrich Mayor	Private	3	House of Thenova		Muly	Muly	Ricky	Active	13 Oct 2026	19 Aug 2025
Dale (Sat 4-6)	Saturday	10:00-12:00	Osborne	Centre Point	1072	Hazel Natalie Ten	Sergeant	5	House of Havaria		Muly	Muly	Ricky	Active	6 Apr 2027	23 Aug 2025
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100027	Daniel Goh	Sergeant	7	House of Thenova		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	13 Oct 2026	13 Sep 2024
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100121	Shane Anthony Jawson	Sergeant	9	House of Quorion		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	13 Oct 2026	13 Sep 2025
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100130	Muhammad Rafa Al Siena	Sergeant	8	House of Quorion		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	27 Sep 2026	13 Sep 2025
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100139	Daniella Demeintieva	Sergeant	7	House of Thenova		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	18 Apr 2027	04 Oct 2025
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100143	Kaleb Edgar Goel Hasugian	Sergeant	11	House of Quorion		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	24 Jan 2027	24 Jan 2026
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100149	Jaeson Nathan Yap	Private	9	House of Quorion		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	11 Oct 2026	11 Apr 2026
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100161	Khezya Queen Zareen Br Panggabean 	Private	7	House of Quorion		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	18 Oct 2026	18 Apr 2026
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100169	Warren Leander Wichael	Private	10	House of Reverion		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	1 Feb 2027	01 Aug 2026
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100187	Graccyella Martgehaan	Private	12	House of Quorion		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	11 Jan 2027	11 Jul 2026
Auckland	Saturday	10:00-12:00	Kirana	Tritura	70100190	Arta Glory Hutasoit	Private	10	House of Havaria		Loita	Loita	Mashuri Ngadijaya, Abraham	Active	11 Jan 2027	11 Jul 2026
Camelot	Saturday	10:30-12:00	Vega	Cemara	933	Ivy Jeane Chanella		2			Agustina	Agustina	Mulyanita	Active	25 Jan 2027	16 Nov 2024
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100090	Alfarizy Raqila Hermansyah		2			Loita	Agustina	Mulyanita	Active	2 Jan 2027	02 Aug 2025
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100103	Claire Eugenia Khu		2			Agustina	Agustina	Mulyanita	Active	7 Sep 2026	07 Jun 2025
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100107	Stoffel Swandeez Angkasa		2			Agustina	Agustina	Mulyanita	Active	2 Feb 2027	02 Aug 2025
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100113	Reynard Shendior		2			Agustina	Agustina	Mulyanita	Active	26 Jan 2027	26 Jul 2025
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100118	Jesslyn Hofang		1			Agustina	Agustina	Mulyanita	Active	26 Jan 2027	26 Jul 2025
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100202	Xavierra Kaylyn Leeon		2			Nabilah	Agustina	Mulyanita	Active	4 Jan 2027	04 Jul 2026
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100205	Bernice Wong		3			Nabilah	Agustina	Mulyanita	Active	4 Jan 2027	04 Jul 2026
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100212	Quinn Rachel Liu 		2			Nabilah	Agustina	Mulyanita	Active	4 Jan 2027	04 Jul 2026
Camelot	Saturday	10:30-12:00	Vega	Cemara	90100213	Seabert Swandeez Angkasa		2			Agustina	Agustina	Mulyanita	Active	18 Jan 2027	18 Jul 2026
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	1096	Maxwell Kenson Wibisono		1			Muly	Rizky	Ghaitsa	Active	18 Jan 2027	04 Oct 2025
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	1097	Reia Rose Winfield		2			Muly	Rizky	Ghaitsa	Active	11 Feb 2027	04 Oct 2025
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	1098	Naia Sydney Winfield		1			Muly	Rizky	Ghaitsa	Active	11 Jan 2027	04 Oct 2025
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	1113	Joe Benedict Japto		1			Ghaitsa	Rizky	Ghaitsa	Active	22 Dec 2026	08 Nov 2025
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	1166	Anderson Putra Supama		2			Ghaitsa	Rizky	Ghaitsa	Active	4 Jan 2027	21 May 2026
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	70100131	Clairine Bellvania Gavrila Ginting		2			Ghaitsa	Rizky	Ghaitsa	Active	18 Dec 2026	19 Sep 2025
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	90100164	Jarred Eldridge Tantama		1			Rizky	Rizky	Ghaitsa	Expired	18 Jul 2026	11 Oct 2025
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	90100166	Reinz Stythan 		1			Ghaitsa	Rizky	Ghaitsa	Active	18 Jan 2027	11 Oct 2025
Narnia	Saturday	13:00-14:30	Imaginarium	Centre Point	90100169	Eleora Iskandar Liunardi		1			Rizky	Rizky	Ghaitsa	Active	11 Jan 2027	11 Oct 2025
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	836	Kent Arthur Luman		2			Rizky	Ghaitsa	Qoriah	Active	13 Jan 2027	30 May 2024
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1024	Chloe Audrey Chen		1			Rizky	Ghaitsa	Qoriah	Active	26 Jan 2027	30 Jun 2025
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1061	Kayden Skylar Sanso		1			Rizky	Ghaitsa	Qoriah	Active	13 Jan 2027	20 Aug 2025
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1067	Richester Casvio Liong		2			Rizky	Ghaitsa	Qoriah	Expired	6 Jul 2026	22 Aug 2025
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1083	Gillian Alexa Pearl		1			Rizky	Ghaitsa	Qoriah	Active	13 Jan 2027	03 Sep 2025
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1089	Jessica Jo		1			Muly	Ghaitsa	Qoriah	Active	3 Feb 2027	22 Sep 2025
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1093	Annastasia Hideko Winarta		1			Rizky	Ghaitsa	Qoriah	Active	18 Jan 2027	30 Sep 2025
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1128	Lashira Awbinsriee Pane		2			Rizky	Ghaitsa	Qoriah	Active	24 Jan 2027	06 Jan 2026
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1149	Arnold Alexander Hakim		1			Muly	Ghaitsa	Qoriah	Active	11 Jan 2027	30 Mar 2026
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	1175	Vingeline Chelsealya Angkasa		2			Ghaitsa	Ghaitsa	Qoriah	Active	11 Jan 2027	17 Jun 2026
Hogwarts	Saturday	13:00-14:30	Apsley	Centre Point	90100201	Crystaline Angela indrajaya		2			Muly	Ghaitsa	Qoriah	Active	4 Jan 2027	04 Jul 2026
Quartz	Saturday	13:00-15:00	Orion	Cemara	70100061	Colleen Blaine	Private	3			Loita	Nabila	Loita	Active	2 Apr 2027	19 Jul 2025
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100001	Rowan Maverick Ang	Sergeant	3	House of Thenova		Loita	Nabila	Loita	Active	25 Jan 2027	25 Jan 2025
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100055	Felicia Tham	Sergeant	3	House of Thenova		Loita	Nabila	Loita	Active	1 Mar 2027	01 Mar 2025
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100066	Celine Oubre	Sergeant	3	House of Thenova		Loita	Nabila	Loita	Active	8 Dec 2026	08 Mar 2025
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100070	Jack Austin Sia	Private	3	House of Thenova		Loita	Nabila	Loita	Active	15 Sep 2026	15 Mar 2025
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100144	Vincenzo	Private	4	House of Thenova		Agustina	Nabila	Loita	Active	9 Sep 2026	09 Aug 2025
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100182	MAXWELL TENAR	Private	3	House of Thenova		Agustina	Nabila	Loita	Active (Grace Period)	7 Aug 2026	07 Feb 2026
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100186	Samantha Clairine Wu	Private	5	House of Thenova		Agustina	Nabila	Loita	Expired	31 Jul 2026	31 Jan 2026
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100209	George 	Private	4	House of Thenova		Agustina	Nabila	Loita	Active	9 Nov 2026	09 May 2026
Quartz	Saturday	13:00-15:00	Orion	Cemara	90100250	Aldrich Smaver Tanasal	Private	6	House of Havaria		Agustina	Nabila	Loita	Active	18 Jan 2027	18 Jul 2026
Obsidian	Saturday	13:00-15:00	Nova	Cemara	27	Valerie Legolas Cen	Sergeant	8	House of Havaria		Loita	Nabila	Averina	Active	22 May 2027	02 Dec 2021
Obsidian	Saturday	13:00-15:00	Nova	Cemara	368	Felice Vallerie Angkasa	Colonel	9	House of Creanova		Loita	Nabila	Averina	Active	24 May 2027	10 Feb 2022
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100035	Carlen Edeline Br. Keliat	Sergeant	8	House of Havaria		Loita	Nabila	Averina	Active (Grace Period)	25 Aug 2026	25 Jan 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100061	Elaine Gabriella Chandella	Sergeant	8	House of Thenova		Agustina	Nabila	Averina	Active	1 Oct 2026	01 Mar 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100064	Olson Arfayo	Sergeant	7	House of Reverion		Loita	Nabila	Averina	Active	9 Mar 2027	08 Mar 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100088	Khairiy Raka Azizi Hermansyah	Sergeant	8	House of Thenova		Loita	Nabila	Averina	Active	26 Jan 2027	26 Jul 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100089	Alvyn Zhu	Private	11	House of Reverion		Loita	Nabila	Averina	Active	14 Jun 2027	14 Jun 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100122	Tiffany Toh	Private	8	House of Thenova		Loita	Nabila	Averina	Active (Grace Period)	16 Aug 2026	16 Aug 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100123	Trevor Toh	Private	6	House of Reverion		Loita	Nabila	Averina	Active (Grace Period)	16 Aug 2026	16 Aug 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100132	Louis Adrian	Private	9	House of Quorion		Loita	Nabila	Averina	Expired	26 Jul 2026	26 Jul 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100146	Selena Frederica Castalia	Private	11			Agustina	Nabila	Averina	Active	25 Jan 2027	30 Aug 2025
Obsidian	Saturday	13:00-15:00	Nova	Cemara	90100214	Louis kendrick	Private	11	House of Thenova		Agustina	Nabila	Averina	Active	23 Dec 2026	23 May 2026
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	45	Aaron Goldwin Semarak	General	10	House of Havaria		Ghaitsa	Ghaitsa	Ricky	Expired	25 Jul 2026	18 May 2019
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	48	Justin Maxwell	General	9	House of Havaria		Ghaitsa	Ghaitsa	Ricky	Active (Grace Period)	1 Sep 2026	02 Nov 2019
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	60	Sharleen Velicia Lim	General	10	House of Havaria		Ghaitsa	Ghaitsa	Ricky	Active	26 Sep 2026	26 Jan 2019
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	333	Jasmine Yenarti	General	10	House of Creanova		Ghaitsa	Ghaitsa	Ricky	Active	10 Oct 2026	10 Feb 2022
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	532	Yasmin Fadhila Azzakiyah	Lt. Colonel	10	House of Thenova		Ghaitsa	Ghaitsa	Ricky	Active	6 Jan 2027	03 Oct 2022
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	679	Fiorenza Eleanor Wijaya	Colonel	11	House of Havaria		Ghaitsa	Ghaitsa	Ricky	Active (Grace Period)	4 Aug 2026	31 Jul 2023
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	719	Davar Aly Harahap	Colonel	12	House of Quorion		Ghaitsa	Ghaitsa	Ricky	Active	23 Sep 2026	14 Sep 2023
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	922	Victoria Cenata	Sergeant	11	House of Thenova		Rizky	Ghaitsa	Ricky	Active	25 Oct 2026	15 Oct 2024
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	984	Chaden Ettienne Halim	Sergeant	9	House of Quorion		Rizky	Ghaitsa	Ricky	Active (Grace Period)	3 Aug 2026	30 Mar 2025
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	1139	Wilbert Wijaya	Private	10	House of Quorion		Rizky	Ghaitsa	Ricky	Active	4 Oct 2026	04 Feb 2026
Millman (Sat 1-3)	Saturday	13:00-15:00	Clapham	Centre Point	1144	Kayla Shilyn Gani	Private	9	House of Havaria		Ghaitsa	Ghaitsa	Ricky	Active	28 Oct 2026	12 Mar 2026
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	763	Safira Reynia Hanum	Private	3	House of Quorion		Rizky	Muly	Senny	Active	27 Oct 2026	20 Nov 2023
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	784	Garrix Ardent Putra	Private	3	House of Havaria		Rizky	Muly	Senny	Active	4 Nov 2026	11 Jan 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	806	Efrata Iskandar Liunardi	Private	3	House of Havaria		Rizky	Muly	Senny	Active	16 Jan 2027	05 Mar 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	809	Emilia Niko Nyoman	Private	3	House of Thenova		Muly	Muly	Senny	Active (Grace Period)	6 Aug 2026	07 Mar 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	811	Arthur Floyd Salim	Private	3	House of Thenova		Muly	Muly	Senny	Active	9 Nov 2026	08 Mar 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	835	Finn Aldrich Luman	Private	3	House of Thenova		Rizky	Muly	Senny	Active	6 Oct 2026	30 May 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	837	Clairine Angela Indrajaya	Private	3	House of Reverion		Muly	Muly	Senny	Active	15 Jan 2027	05 Jun 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	883	Joanne Lynch	Private	3	House of Reverion		Rizky	Muly	Senny	Active	17 Nov 2026	03 Aug 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	914	Leia Kaytlyn Tioe	Private	3	House of Creanova		Rizky	Muly	Senny	Active (Grace Period)	12 Aug 2026	03 Oct 2024
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	950	Audrey Madison Loewe	Private	3	House of Havaria		Rizky	Muly	Senny	Active	18 Oct 2026	12 Jan 2025
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	964	Yazeed Abizar Rifqi	Private	3	House of Havaria		Muly	Muly	Senny	Active	15 Dec 2026	11 Feb 2025
Lincoln	Saturday	13:00-15:00	Chesterfield	Centre Point	999	Annabelle Grace Wu	Sergeant	3	House of Thenova		Ghaitsa	Muly	Senny	Active	5 Nov 2026	27 May 2025
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	440	Sofia Grace Wu	Colonel	6	House of Creanova		Ghaitsa	Muly	Rizky	Active	9 Nov 2026	04 Jun 2022
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	631	Queency Joycelyn Yieginia	Lt. Colonel	5	House of Havaria		Ghaitsa	Muly	Rizky	Active	1 Jul 2027	04 Jun 2023
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	902	Malcolm	Sergeant	4	House of Quorion		Muly	Muly	Rizky	Active	27 Jan 2027	13 Sep 2024
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	903	Harvey Oliver Lee	Private	6	House of Thenova		Muly	Muly	Rizky	Active	21 Apr 2027	14 Sep 2024
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	963	Yasmina Athirah Rifqi	Private	5	House of Creanova		Muly	Muly	Rizky	Active	15 Sep 2026	11 Feb 2025
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	982	Abigail Hazel Tamin	Sergeant	4	House of Havaria		Muly	Muly	Rizky	Active	12 Nov 2026	27 Mar 2025
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	989	Federico Fredelyn Jeoh	Sergeant	4	House of Havaria		Rizky	Muly	Rizky	Active	26 Oct 2026	21 Apr 2025
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	995	Qori Putri Syahviah	Sergeant	4	House of Thenova		Rizky	Muly	Rizky	Active	24 Nov 2026	17 May 2025
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	1003	Arthur Alexander Hakim	Sergeant	3	House of Thenova		Muly	Muly	Rizky	Active	26 Jan 2027	11 Jun 2025
Gladwell	Saturday	13:00-15:00	Osborne	Centre Point	1017	Harvardo Lovenzo Susanto	Sergeant	3	House of Havaria		Muly	Muly	Rizky	Active	26 Jan 2027	24 Jun 2025
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	125	Jayxen Maxwell	Colonel	8	House of Havaria		Ghaitsa	Ghaitsa	Denny	Active	3 Nov 2026	03 Sep 2021
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	709	Winston Lawrence	Colonel	7	House of Reverion		Ghaitsa	Ghaitsa	Denny	Active	2 Mar 2027	31 Aug 2023
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	783	Evelynn Lee	Sergeant	9	House of Thenova		Rizky	Ghaitsa	Denny	Expired	6 Jul 2026	11 Jan 2024
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	875	Clarissa Fredelyn Jeoh	Sergeant	8	House of Thenova		Rizky	Ghaitsa	Denny	Active	3 Feb 2027	27 Jul 2024
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	951	Mavin Jericho Phen	Sergeant	9	House of Reverion		Ghaitsa	Ghaitsa	Denny	Active (Grace Period)	22 Aug 2026	13 Jan 2025
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	987	Caren Pandiago	Sergeant	9	House of Thenova		Rizky	Ghaitsa	Denny	Active	19 Oct 2026	14 Apr 2025
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1049	Rafael Maximillian Sitorus	Sergeant	10	House of Havaria		Rizky	Ghaitsa	Denny	Expired	2 Aug 2026	30 Jul 2025
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1050	Galang Roland Besch	Sergeant	10	House of Havaria		Rizky	Ghaitsa	Denny	Expired	2 Aug 2026	30 Jul 2025
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1106	Vierra Cleevany Ryu	Private	9	House of Thenova		Ghaitsa	Ghaitsa	Denny	Active	8 Nov 2026	30 Oct 2025
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1107	Gwyneth Louisa Yap	Private	9	House of Creanova		Ghaitsa	Ghaitsa	Denny	Active	8 Nov 2026	30 Oct 2025
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1138	Mike Louis Wijaya	Private	8	House of Thenova		Rizky	Ghaitsa	Denny	Active	4 Oct 2026	04 Feb 2026
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1171	Angelina Cenata	Private	11	House of Creanova		Rizky	Ghaitsa	Denny	Active	13 Dec 2026	02 Jun 2026
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1181	Azzam Al Vanka	Private	12	House of Thenova		Rizky	Ghaitsa	Denny	Active	4 Jan 2027	25 Jun 2026
Doyle (Sat 1-3)	Saturday	13:00-15:00	Schomberg	Centre Point	1208	Dwayne Alvaro Phen	Private	8	House of Quorion		Rizky	Ghaitsa	Denny	Active	25 Jan 2027	11 Jul 2026
Amber	Saturday	13:00-15:00	Lyra	Cemara	70100051	Enzo Howell	Sergeant	3	House of Thenova		Loita	Nabila	Mulyanita	Expired	20 Jul 2026	20 Sep 2024
Amber	Saturday	13:00-15:00	Lyra	Cemara	70100060	Lincoln Blaine	Sergeant	5	House of Havaria		Loita	Nabila	Mulyanita	Active	18 Nov 2026	04 Sep 2024
Amber	Saturday	13:00-15:00	Lyra	Cemara	70100062	Nichole Hasan	Lt. Colonel	5	House of Thenova		Loita	Nabila	Mulyanita	Active	9 Feb 2027	09 Oct 2024
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100047	Bryant Maximus Ling	Sergeant	4	House of Thenova		Loita	Nabila	Mulyanita	Active (Grace Period)	1 Sep 2026	01 Feb 2025
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100060	Alfred Smaver Tanasal	Sergeant	6	House of Thenova		Agustina	Nabila	Mulyanita	Active	8 Sep 2026	08 Mar 2025
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100133	Josh Andrew	Private	5	House of Thenova		Loita	Nabila	Mulyanita	Expired	26 Jul 2026	26 Jul 2025
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100185	Natasha Clairine Wu	Private	5	House of Quorion		Agustina	Nabila	Mulyanita	Expired	31 Jul 2026	31 Jan 2026
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100208	Patricia	Private	6	House of Thenova		Agustina	Nabila	Mulyanita	Active	9 Nov 2026	09 May 2026
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100230	KYGO LAY 	Private	5	House of Thenova		Nabilah	Nabila	Mulyanita	Active	25 Jan 2027	25 Jul 2026
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100239	JOYXE ADELINE WISELY	Private	5			Nabilah	Nabila	Mulyanita	Active	11 Jan 2027	11 Jul 2026
Amber	Saturday	13:00-15:00	Lyra	Cemara	90100248	Richie Wong Yon Chuang	Private	7	House of Quorion		Nabilah	Nabila	Mulyanita	Active	18 Jan 2027	18 Jul 2026
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100039	Reynard Alderich Guntur		2			Loita	Agustina	Nabila, Lisa	Active	1 Mar 2027	01 Mar 2025
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100046	Hugo Maximus Ling		2			Loita	Agustina	Nabila, Lisa	Active	1 Jan 2027	01 Mar 2025
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100075	Kingsley Alisson Tenang		2			Loita	Agustina	Nabila, Lisa	Active	29 Jan 2027	29 Mar 2025
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100129	Jasmine Ryana Ngadimin		2			Loita	Agustina	Nabila, Lisa	Active	26 Dec 2026	26 Jul 2025
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100170	Viyona Gavriela Muis		1			Agustina	Agustina	Nabila, Lisa	Expired	25 Jul 2026	25 Oct 2025
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100171	Eileen Yui Chen		2			Agustina	Agustina	Nabila, Lisa	Expired	1 Aug 2026	01 Nov 2025
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100178	MIRACLE HUANG		1			Agustina	Agustina	Nabila, Lisa	Active	24 Dec 2026	24 Jan 2026
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100199	Steve Mason		2			Nabilah	Agustina	Nabila, Lisa	Active	4 Jan 2027	04 Jul 2026
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100226	GEORGE FENDISON		2			Nabilah	Agustina	Nabila, Lisa	Active	11 Jan 2027	11 Jul 2026
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100231	Queenza Theodora Wijaya		2			Nabilah	Agustina	Nabila, Lisa	Active	11 Jan 2027	11 Jul 2026
Avalon	Saturday	13:30-15:00	Vega	Cemara	90100254	Reagan Alberic Guntur 		2			Nabilah	Agustina	Nabila, Lisa	Active	25 Jan 2027	25 Jul 2026
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100019	Andrea Tabitha Florencia Simatupang	Lt. Colonel	10	House of Creanova		Loita	Loita	Agustina	Expired	17 Jul 2026	03 Jun 2024
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100020	Diandra Ezra Nauli Simatupang	Lt. Colonel	9	House of Havaria		Loita	Loita	Agustina	Expired	17 Jul 2026	03 Jun 2024
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100042	Jessica Sharon	Lt. Colonel	10	House of Havaria		Loita	Loita	Agustina	Active	29 Oct 2026	15 Jul 2024
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100052	Darrel Hizkia Tambunan	Lt. Colonel	10	House of Thenova		Loita	Loita	Agustina	Active (Grace Period)	26 Aug 2026	12 Aug 2024
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100068	Radinka Agra Sitepu	Sergeant	11	House of Quorion		Loita	Loita	Agustina	Active	2 Nov 2026	19 Oct 2024
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100076	Marwa Alya Sakinah Rangkuti	Lt. Colonel	9	House of Thenova		Loita	Loita	Agustina	Active	17 Dec 2026	17 Jan 2025
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100080	Dewi Syaahira Sabina Siregar	Lt. Colonel	10	House of Quorion		Loita	Loita	Agustina	Active	19 Oct 2026	05 Apr 2025
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100102	Bryan Taslim	Sergeant	11	House of Thenova		Loita	Loita	Agustina	Active	13 Dec 2026	31 May 2025
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100134	Diandra Santika	Sergeant	7	House of Quorion		Loita	Loita	Agustina	Active	18 Oct 2026	04 Oct 2025
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100147	Faza Kiyana Azdah	Sergeant	11	House of Thenova		Loita	Loita	Agustina	Active	31 Jan 2027	31 Jan 2026
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100155	Stella Aprilia Sianipar 	Sergeant	7	House of Reverion		Loita	Loita	Agustina	Active	28 Feb 2027	28 Feb 2026
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100157	Faqhan Asshadiq Winata	Private	9			Loita	Loita	Agustina	Active	7 Oct 2026	07 Mar 2026
Athens	Saturday	13:30-15:30	Kirana	Tritura	70100165	Ghazia Raesha Afthani Lubis	Private	11	House of Thenova		Loita	Loita	Agustina	Active	18 Jan 2027	18 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100224	Hillary Quinn		3			Agustina	Nabila	Nabila	Active	25 Jan 2027	25 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100227	Richard Edbert Susantio 		4			Nabilah	Nabila	Nabila	Active	1 Feb 2027	01 Aug 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100229	HEUGER LAY		4			Nabilah	Nabila	Nabila	Active	25 Jan 2027	25 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100238	Sean Alexio xanderv		2			Nabilah	Nabila	Nabila	Active	11 Jan 2027	11 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100240	Alpine Miler Luo		3			Nabilah	Nabila	Nabila	Active	11 Jan 2027	11 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100242	Beverly Mandy Tjoeng		3			Nabilah	Nabila	Nabila	Active	11 Jan 2027	11 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100244	Rozelle Xiera		3			Nabilah	Nabila	Nabila	Active	11 Jan 2027	11 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100247	Garcia limandar		2			Nabilah	Nabila	Nabila	Active	18 Jan 2027	18 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100252	Alleluia Elyona Sitohang		2			Nabilah	Nabila	Nabila	Active	25 Jan 2027	25 Jul 2026
Atlantis	Saturday	15:30-17:00	Lyra	Cemara	90100253	Ruby Faustin Amat		4			Nabilah	Nabila	Nabila	Active	25 Jan 2027	25 Jul 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1156	Alika Zelmira Wibowo	Private	8	House of Reverion		Ghaitsa	Ghaitsa	Ghaitsa	Active	30 Dec 2026	25 Apr 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1157	Gywen Stefanie Wiley	Private	12	House of Thenova		Rizky	Ghaitsa	Ghaitsa	Active	30 Nov 2026	25 Apr 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1159	Kezia Zenitha Sinaga	Private	9			Rizky	Ghaitsa	Ghaitsa	Active	4 Jan 2027	02 May 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1162	Carine Susanto Lie	Private	9	House of Havaria		Rizky	Ghaitsa	Ghaitsa	Active	6 Dec 2026	08 May 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1163	Azarine Apriza Darmawan	Private	9	House of Thenova		Rizky	Ghaitsa	Ghaitsa	Active	4 Jan 2027	09 May 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1167	Fredericka Sigalingging	Private	10	House of Quorion		Ghaitsa	Ghaitsa	Ghaitsa	Active	30 Nov 2026	23 May 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1168	Viorencia Tantana	Private	11	House of Quorion		Ghaitsa	Ghaitsa	Ghaitsa	Active	4 Jan 2027	23 May 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1169	Gisellene Lowisuri	Private	8			Ghaitsa	Ghaitsa	Ghaitsa	Active	11 Jan 2027	25 May 2026
Ziglar (Sat 4-6)	Saturday	16:00-18:00	Osborne	Centre Point	1212	Aurelia Wyanto	Private	10	House of Thenova		Ghaitsa	Ghaitsa	Ghaitsa	Active	1 Feb 2027	15 Jul 2026
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	49	Richmond Osyan Sudilan	General	11	House of Quorion		Muly	Ghaitsa	Denny	Active	20 Nov 2026	13 Mar 2020
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	274	Candice Winardi Wong	Colonel	7	House of Havaria		Ghaitsa	Ghaitsa	Denny	Active	5 Dec 2026	05 Jan 2022
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	301	Chloe Zhou	Lt. Colonel	11			Muly	Ghaitsa	Denny	Active	2 Oct 2026	02 Nov 2019
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	443	Candyce Valezka Moiras	Lt. General	8	House of Havaria		Ghaitsa	Ghaitsa	Denny	Active (Grace Period)	10 Aug 2026	10 Jun 2022
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	548	Fiona Candiof	Lt. Colonel	10	House of Havaria		Muly	Ghaitsa	Denny	Active	15 Apr 2027	12 Oct 2022
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	566	Jollyn Felicia Wong	Colonel	10	House of Havaria		Ghaitsa	Ghaitsa	Denny	Active	14 Jan 2027	23 Dec 2022
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	581	Nicholas Zheng	Lt. General	10	House of Havaria		Ghaitsa	Ghaitsa	Denny	Active (Grace Period)	4 Aug 2026	01 Feb 2023
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	665	Khoo Shu Han	Lt. Colonel	9	House of Reverion		Ghaitsa	Ghaitsa	Denny	Expired	22 Jul 2026	20 Jul 2023
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	739	Zoefiker Putera Ngadiman	Lt. Colonel	9	House of Reverion		Rizky	Ghaitsa	Denny	Active	5 Oct 2026	05 Oct 2023
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	822	Clarissa Olivia Anne Lammora Panjaitan	Colonel	9	House of Havaria		Ghaitsa	Ghaitsa	Denny	Active	2 Sep 2026	30 Apr 2024
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	1023	Darryl Raynold Leowe	Private	9	House of Thenova		Muly	Ghaitsa	Denny	Expired	12 Jul 2026	30 Jun 2025
Spielberg (Sat 4-6)	Saturday	16:00-18:00	Schomberg	Centre Point	1027	Elnino Jehanra Saragih	Lt. Colonel	11	House of Creanova		Muly	Ghaitsa	Denny	Active	12 Jan 2027	02 Jul 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	329	Vrederick Benaricco Tanjaya	Colonel	8	House of Thenova		Agustina	Agustina	Mulyanita	Active (Grace Period)	21 Aug 2026	10 Feb 2022
Sapphire	Saturday	16:00-18:00	Nova	Cemara	531	Max Chen	Sergeant	8			Agustina	Agustina	Mulyanita	Active (Grace Period)	8 Aug 2026	01 Oct 2022
Sapphire	Saturday	16:00-18:00	Nova	Cemara	1028	Darren Winston	Private	11			Loita	Agustina	Mulyanita	Expired	4 Jul 2026	03 Jul 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100020	Winston Hubert	Lt. General	12	House of Thenova		Agustina	Agustina	Mulyanita	Active	10 Feb 2027	10 Jan 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100101	Jayden Zhang	Private	7	House of Thenova		Agustina	Agustina	Mulyanita	Active	4 Jan 2027	04 Jul 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100131	Gillian Natalie Wilfred	Private	11	House of Quorion		Agustina	Agustina	Mulyanita	Active	13 Oct 2026	13 Sep 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100134	Rodrick Stefano Halim	Sergeant	8	House of Havaria		Agustina	Agustina	Mulyanita	Active	13 Sep 2026	13 Sep 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100135	Rainie Lynn	Private	7	House of Havaria		Agustina	Agustina	Mulyanita	Active	13 Sep 2026	13 Sep 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100154	Emmeline Aurelia Lie	Private	8	House of Creanova		Agustina	Agustina	Mulyanita	Active	13 Sep 2026	13 Sep 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100155	Nathan Archie Gunawan	Private	7	House of Thenova		Agustina	Agustina	Mulyanita	Active	13 Sep 2026	13 Sep 2025
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100174	Otto Valerino Lim	Private	8	House of Thenova		Agustina	Agustina	Mulyanita	Active	31 Jan 2027	31 Jan 2026
Sapphire	Saturday	16:00-18:00	Nova	Cemara	90100175	Jovan Leonard Lui	Private	11	House of Havaria		Agustina	Agustina	Mulyanita	Expired	24 Jul 2026	24 Jan 2026
Pearl	Saturday	16:00-18:00	Orion	Cemara	587	Enrico Victorian	Colonel	5	House of Havaria		Agustina	Agustina	Loita	Active	16 Apr 2027	02 Mar 2023
Pearl	Saturday	16:00-18:00	Orion	Cemara	1081	Carlton Kho	Private	5	House of Havaria		Muly	Agustina	Loita	Active	3 Oct 2026	27 Aug 2025
Pearl	Saturday	16:00-18:00	Orion	Cemara	90100005	Felynn Holy Richson	Lt. Colonel	4	House of Thenova		Agustina	Agustina	Loita	Active	25 Jul 2027	25 Jan 2025
Pearl	Saturday	16:00-18:00	Orion	Cemara	90100100	Jasmine Zhang	Private	5	House of Quorion		Agustina	Agustina	Loita	Active	4 Jan 2027	04 Jul 2025
Pearl	Saturday	16:00-18:00	Orion	Cemara	90100138	Vyon Wynter Huang	Sergeant	3	House of Thenova		Agustina	Agustina	Loita	Active	16 Oct 2026	16 Aug 2025
Pearl	Saturday	16:00-18:00	Orion	Cemara	90100156	Nicole Anastasia	Private	4	House of Havaria		Loita	Agustina	Loita	Active	13 Sep 2026	13 Sep 2025
Pearl	Saturday	16:00-18:00	Orion	Cemara	90100160	Klarissa Evania Buhari 	Private	4	House of Reverion		Agustina	Agustina	Loita	Active	20 Sep 2026	20 Sep 2025
Pearl	Saturday	16:00-18:00	Orion	Cemara	90100168	Madelyn Henryetta Fang	Private	5	House of Havaria		Agustina	Agustina	Loita	Active	1 May 2027	01 Nov 2025
Pearl	Saturday	16:00-18:00	Orion	Cemara	90100232	Kathrine Chrestella	Private	6			Agustina	Agustina	Loita	Active	4 Jan 2027	04 Jul 2026
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	553	Florencia Hewi	Lt. Colonel	6	House of Quorion		Ghaitsa	Rizky	Rizky	Active	5 May 2027	17 Oct 2022
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	574	Brandon Tiojaya	Colonel	4	House of Creanova		Ghaitsa	Rizky	Rizky	Active	28 Oct 2026	14 Jan 2023
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	586	Annabella Wijaya	Colonel	6	House of Thenova		Ghaitsa	Rizky	Rizky	Active	11 Dec 2026	01 Mar 2023
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	842	Ethan Moeritz	Private	3	House of Thenova		Muly	Rizky	Rizky	Active	14 Sep 2026	11 Jun 2024
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	858	Delmond Osyan Sudilan	Sergeant	6	House of Thenova		Muly	Rizky	Rizky	Active	20 Mar 2027	18 Jul 2024
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	962	Ananda Putera Ngadiman	Sergeant	5	House of Havaria		Rizky	Rizky	Rizky	Active (Grace Period)	1 Sep 2026	08 Feb 2025
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	1009	Felicia Grace Ong	Private	5	House of Thenova		Muly	Rizky	Rizky	Active (Grace Period)	21 Aug 2026	18 Jun 2025
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	1010	Gracielle Grace Ong	Private	4	House of Havaria		Muly	Rizky	Rizky	Active (Grace Period)	21 Aug 2026	18 Jun 2025
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	1019	Louis Clinton Chai	Private	6	House of Thenova		Muly	Rizky	Rizky	Active	5 Jan 2027	25 Jun 2025
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	1123	Joequinn Felysse Warsono	Private	3	House of Thenova		Rizky	Rizky	Rizky	Active (Grace Period)	10 Aug 2026	23 Dec 2025
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	1158	Kendrick Eoghan	Private	4	House of Quorion		Muly	Rizky	Rizky	Active	30 Nov 2026	02 May 2026
Mandela	Saturday	16:00-18:00	Chesterfield	Centre Point	70100037	Abigail Rhea Lim	Sergeant	4	House of Havaria		Muly	Rizky	Rizky	Active (Grace Period)	20 Aug 2026	20 Sep 2024
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	50	Kenichi Zhou	Lt. Colonel	9	House of Thenova		Muly	Ghaitsa	Ricky	Active	2 Oct 2026	02 Nov 2019
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	51	Cedric Yago	General	12	House of Quorion		Ghaitsa	Ghaitsa	Ricky	Active	9 Sep 2026	02 Apr 2022
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	442	Beatrys Vanesa Moiras	Lt. General	10	House of Thenova		Ghaitsa	Ghaitsa	Ricky	Active (Grace Period)	10 Aug 2026	10 Jun 2022
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	580	Vivienne Zheng	General	12	House of Quorion		Ghaitsa	Ghaitsa	Ricky	Active (Grace Period)	4 Aug 2026	01 Feb 2023
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	585	Harvey Wijaya	Colonel	7	House of Creanova		Ghaitsa	Ghaitsa	Ricky	Active	11 Mar 2027	01 Mar 2023
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	801	Hillary Calista Tamado Panjaitan	Colonel	7	House of Thenova		Ghaitsa	Ghaitsa	Ricky	Active	27 Sep 2026	26 Feb 2024
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	1007	Davina Grace Ong	Sergeant	10	House of Thenova		Muly	Ghaitsa	Ricky	Active (Grace Period)	21 Aug 2026	18 Jun 2025
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	1008	Sydney Princessa Lim	Sergeant	10	House of Quorion		Muly	Ghaitsa	Ricky	Active (Grace Period)	21 Aug 2026	18 Jun 2025
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	1103	Nicholas Tjin	Sergeant	10	House of Thenova		Muly	Ghaitsa	Ricky	Active	8 Jun 2027	18 Oct 2025
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	1131	Vinxiero Carrick Francoiz	Private	8	House of Thenova		Ghaitsa	Ghaitsa	Ricky	Active (Grace Period)	7 Aug 2026	21 Jan 2026
Kiyosaki (Sat 4-6)	Saturday	16:00-18:00	Apsley	Centre Point	1133	Natalie Willeen Zhang	Private	8	House of Thenova		Muly	Ghaitsa	Ricky	Active (Grace Period)	7 Aug 2026	28 Jan 2026
Asheville	Saturday	16:00-18:00	Kirana	Tritura	1059	Meuthia Gadiza	Sergeant	9	House of Thenova		Loita	Loita	Agustina	Active	26 Feb 2027	17 Aug 2025
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100070	Keysha Kania Ramaditya	Lt. Colonel	9	House of Reverion		Loita	Loita	Agustina	Active	10 Oct 2026	10 Jan 2025
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100117	Akhdan Arief Athaya	Sergeant	7	House of Havaria		Loita	Loita	Agustina	Active	25 Oct 2026	11 Oct 2025
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100133	Lionel Maverick 	Sergeant	8	House of Havaria		Loita	Loita	Agustina	Active	25 Apr 2027	11 Oct 2025
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100135	Adib Nufal Wibowo	Sergeant	6	House of Thenova		Loita	Loita	Agustina	Active	1 Oct 2026	01 Oct 2025
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100136	Syakirah Khairani Jamilah	Private	7	House of Thenova		Loita	Loita	Agustina	Active	25 Oct 2026	25 Oct 2025
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100140	Gabriella Theofanny Putri Meliala	Sergeant	9	House of Havaria		Loita	Loita	Agustina	Active	25 Oct 2026	11 Oct 2025
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100144	Faqih Fadhilah Wijaya	Private	9	House of Quorion		Loita	Loita	Agustina	Active	24 Mar 2027	24 Jan 2026
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100145	Hafiqa Raikhsa Karo Karo	Private	7	House of Havaria		Loita	Loita	Agustina	Active (Grace Period)	24 Aug 2026	24 Jan 2026
Asheville	Saturday	16:00-18:00	Kirana	Tritura	70100162	Arya Satya	Private	7	House of Reverion		Loita	Loita	Agustina	Active	11 Oct 2026	11 Apr 2026
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100004	Jeovenna Cangie	Lt. Colonel	4	House of Havaria		Agustina	Agustina	Viorentina	Active	25 Jul 2027	25 Jan 2025
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100010	Chloe Marjorie Wen	Sergeant	4	House of Thenova		Agustina	Agustina	Viorentina	Active	25 Jul 2027	25 Jan 2025
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100011	Chloe Quisha Anggara	Sergeant	5	House of Thenova		Agustina	Agustina	Viorentina	Active	25 Jul 2027	25 Jan 2025
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100024	Welceline Charissa Tsjin	Sergeant	4	House of Thenova		Agustina	Agustina	Viorentina	Active (Grace Period)	25 Aug 2026	25 Jan 2025
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100081	Hayden Fredderick Halim	Lt. Colonel	6	House of Havaria		Agustina	Agustina	Viorentina	Active	26 Oct 2027	26 Apr 2025
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100104	Hannah Sophia Salim	Sergeant	4	House of Thenova		Agustina	Agustina	Viorentina	Active	28 Dec 2026	14 Jun 2025
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100148	Kei Evander Buhari 	Sergeant	6	House of Reverion		Agustina	Agustina	Viorentina	Active	9 Feb 2027	09 Aug 2025
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100179	Emily moraine hakim	Private	3	House of Thenova		Agustina	Agustina	Viorentina	Active (Grace Period)	24 Aug 2026	24 Jan 2026
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100223	Feodora Meidy Leandra	Private	6	House of Havaria		Agustina	Agustina	Viorentina	Active	6 Dec 2026	06 Jun 2026
Diamond	Saturday	16:30-18:30	Lyra	Cemara	90100246	Felice limandar	Private	7	House of Thenova		Nabilah	Agustina	Viorentina	Active	18 Jan 2027	18 Jul 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1174	Vivienne Claire Soeripin	Private	9	House of Thenova		Ghaitsa	Rizky	Ricky	Active	26 Jan 2027	17 Jun 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1178	Richeline Huang	Private	10			Rizky	Rizky	Ricky	Active	26 Jan 2027	20 Jun 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1187	Michelle Aurelia Chen	Private	9	House of Thenova		Rizky	Rizky	Ricky	Active	26 Jan 2027	30 Jun 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1201	Ivania Gracesinka	Private	9	House of Havaria		Rizky	Rizky	Ricky	Active	26 Jan 2027	09 Jul 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1203	Kevin Fico Aurelio	Private	10			Rizky	Rizky	Ricky	Active	26 Jan 2027	09 Jul 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1204	Kendrick Filbert Aurelio	Private	8			Rizky	Rizky	Ricky	Active	26 Jan 2027	09 Jul 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1214	Fiona Tjongnata	Private	12	House of Quorion		Rizky	Rizky	Ricky	Active	26 Jan 2027	18 Jul 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1221	Cika Linatasia Tampubolon	Private	11	House of Quorion		Rizky	Rizky	Ricky	Active	26 Jan 2027	22 Jul 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1223	Steve Marcellino	Private	10			Rizky	Rizky	Ricky	Active	26 Jan 2027	24 Jul 2026
Socrates	Sunday	10:00-12:00	Osborne	Centre Point	1224	Collins Anderson	Private	10			Rizky	Rizky	Ricky	Active	26 Jan 2027	24 Jul 2026
Plato	Sunday	10:00-12:00	Chesterfield	Centre Point	1184	Louis Sinclair Zuary	Private	7			Muly	Ghaitsa		Active	29 Jan 2027	27 Jun 2026
Plato	Sunday	10:00-12:00	Chesterfield	Centre Point	1188	James Oliver Coaca	Private	6	House of Havaria		Ghaitsa	Ghaitsa		Active	2 Feb 2027	30 Jun 2026
Plato	Sunday	10:00-12:00	Chesterfield	Centre Point	1211	Dion Lorenzo Castio	Private	5			Ghaitsa	Ghaitsa		Active	2 Feb 2027	15 Jul 2026
Plato	Sunday	10:00-12:00	Chesterfield	Centre Point	1225	Winnie Lorenz Tjialin	Private	5	House of Thenova		Ghaitsa	Ghaitsa		Active	28 Feb 2027	30 Jul 2026
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	990	Zason Riady Ko		2			Rizky	Ghaitsa	Loita	Active (Grace Period)	24 Aug 2026	23 Apr 2025
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1105	Keiko Aiby Lim		1			Ghaitsa	Ghaitsa	Loita	Active	14 Mar 2027	29 Oct 2025
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1119	Andrea Dimitri Ashraafi Lazzaroni		2			Ghaitsa	Ghaitsa	Loita	Active	14 Jan 2027	29 Nov 2025
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1120	Reynand Wijaya		1			Ghaitsa	Ghaitsa	Loita	Active	7 Sep 2026	06 Dec 2025
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1160	Karen Kallenia Sinaga		3			Ghaitsa	Ghaitsa	Loita	Active	4 Jan 2027	02 May 2026
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1165	Madeline Lauren		4			Ghaitsa	Ghaitsa	Loita	Active	4 Jan 2027	19 May 2026
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1173	Mia Emily Soeripin		3			Ghaitsa	Ghaitsa	Loita	Active	4 Jan 2027	15 Jun 2026
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1185	Genovia Grace Widjaja		3			Ghaitsa	Ghaitsa	Loita	Active	12 Jan 2027	27 Jun 2026
Whomville	Sunday	11:00 -12:30	Apsley	Centre Point	1205	Kaylee Alessia Ridgen		2			Ghaitsa	Ghaitsa	Loita	Active	12 Jan 2027	09 Jul 2026`;

function parseDate(dateStr) {
  if (!dateStr || !dateStr.trim()) return null;
  const str = dateStr.trim();
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  const parts = str.split(/\s+/);
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let mon = months[parts[1]];
    let year = parts[2];
    if (mon && year) {
      return `${year}-${mon}-${day}`;
    }
  }
  return null;
}

async function fastBatchUpsertPortalAdmin() {
  console.log('🚀 Ensuring UNIQUE constraint on portal_admin(trainee_id)...');
  
  // First stop running task 536 if running
  try {
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS portal_admin_trainee_id_idx ON portal_admin (trainee_id);
    `);
    console.log('✅ Unique index created.');
  } catch (e) {
    console.log('Index note:', e.message);
  }

  const lines = rawText.split('\n').filter(l => l.trim() !== '');
  const records = [];
  const uniqueTrainees = new Map();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const className = (cols[0] || '').trim();
    const day = (cols[1] || '').trim();
    const time = (cols[2] || '').trim();
    const room = (cols[3] || '').trim();
    const branch = (cols[4] || '').trim();
    const traineeId = (cols[5] || '').trim();
    const name = (cols[6] || '').trim();
    const level = (cols[7] || '').trim();
    const newestGrade = (cols[8] || '').trim();
    const house = (cols[9] || '').trim();
    const houseRole = (cols[10] || '').trim();
    const traineeHomeroom = (cols[11] || '').trim();
    const homeroomKelas = (cols[12] || '').trim();
    const trainer = (cols[13] || '').trim();
    const membershipStatus = (cols[14] || '').trim();
    const expiryDateStr = (cols[15] || '').trim();
    const firstEnrollStr = (cols[16] || '').trim();

    if (!traineeId || !name) continue;

    const expiryDateParsed = parseDate(expiryDateStr);
    const firstEnrollParsed = parseDate(firstEnrollStr);

    const rawDataJson = JSON.stringify({
      class_name: className, day, time, room, branch, trainee_id: traineeId, name,
      level, newest_grade: newestGrade, house, house_role: houseRole,
      trainee_homeroom: traineeHomeroom, homeroom_kelas: homeroomKelas,
      trainer, membership_status: membershipStatus,
      membership_expired_date: expiryDateStr, first_enroll: firstEnrollStr
    });

    uniqueTrainees.set(traineeId, [
      className || null, day || null, time || null, room || null, branch || null,
      traineeId, name, level || null, newestGrade || null, house || null,
      houseRole || null, traineeHomeroom || null, homeroomKelas || null,
      trainer || null, membershipStatus || null, expiryDateParsed, firstEnrollParsed, rawDataJson
    ]);
  }

  const entries = Array.from(uniqueTrainees.values());
  console.log(`📊 Processing ${entries.length} unique trainees...`);

  // Batch insert into database using single multi-row query in chunks of 50
  const chunkSize = 50;
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const valuePlaceholders = [];
    const flatParams = [];
    let paramIndex = 1;

    for (const r of chunk) {
      const rowPlaceholders = [];
      for (let j = 0; j < 18; j++) {
        rowPlaceholders.push(`$${paramIndex++}`);
        flatParams.push(r[j]);
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')}, NOW())`);
    }

    const bulkQuery = `
      INSERT INTO portal_admin (
        class_name, day, time, room, branch, trainee_id, name, level,
        newest_grade, house, house_role, trainee_homeroom, homeroom_kelas,
        trainer, membership_status, membership_expired_date, first_enroll, raw_data, updated_at
      ) VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (trainee_id) DO UPDATE SET
        class_name = EXCLUDED.class_name,
        day = EXCLUDED.day,
        time = EXCLUDED.time,
        room = EXCLUDED.room,
        branch = EXCLUDED.branch,
        name = EXCLUDED.name,
        level = EXCLUDED.level,
        newest_grade = EXCLUDED.newest_grade,
        house = EXCLUDED.house,
        house_role = EXCLUDED.house_role,
        trainee_homeroom = EXCLUDED.trainee_homeroom,
        homeroom_kelas = EXCLUDED.homeroom_kelas,
        trainer = EXCLUDED.trainer,
        membership_status = EXCLUDED.membership_status,
        membership_expired_date = EXCLUDED.membership_expired_date,
        first_enroll = EXCLUDED.first_enroll,
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW();
    `;

    await db.query(bulkQuery, flatParams);
    console.log(`✅ Chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(entries.length / chunkSize)} inserted/updated!`);
  }

  console.log('\n🎉 Fast Batch Upsert Complete!');
  const countRes = await db.query(`SELECT COUNT(*) FROM portal_admin`);
  console.log(`📌 Total records in portal_admin: ${countRes.rows[0].count}`);

  const sampleRes = await db.query(`SELECT trainee_id, name, class_name, branch, membership_status FROM portal_admin WHERE trainee_id IN ('980', '1176', '70100104', '670')`);
  console.log('\n🔍 Sample records verified:', sampleRes.rows);
}

// Kill slow process if any
fastBatchUpsertPortalAdmin().catch(console.error).then(() => process.exit(0));
