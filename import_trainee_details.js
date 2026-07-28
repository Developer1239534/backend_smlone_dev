const db = require('./src/db/neonClient');
const bcrypt = require('bcryptjs');

const rawTraineeData = `
24	Shelby Kirana Yi			Junior/Youth Program	Gates (Sat 10-12)			Private
48	Justin Maxwell	1 September 2026	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Havaria	General
49	Richmond Osyan Sudilan	20 November 2026	Active	Junior/Youth Program	Spielberg (Sat 4-6)		House of Quorion	General
50	Kenichi Zhou	2 October 2026	Active	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Thenova	Lt. Colonel
51	Cedric Yago	9 September 2026	Active	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Quorion	General
60	Sharleen Velicia Lim	26 September 2026	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Havaria	General
125	Jayxen Maxwell	3 November 2026	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Havaria	Colonel
141	Russell William Tanner	5 September 2027	Active	Junior/Youth Program	DaVinci		House of Quorion	Colonel
269	Fresia Victoria Chendry	14 September 2026	Active	Junior/Youth Program	Sigmund		House of Thenova	Lt. General
285	Clairine Joshanley	4 October 2026	Active	Junior/Youth Program	Clinton (Fri 3-5)		House of Thenova	Colonel
301	Chloe Zhou	2 October 2026	Active	Junior/Youth Program	Spielberg (Sat 4-6)			Lt. Colonel
333	Jasmine Yenarti	10 October 2026	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Creanova	General
375	Darren Gabriel	8 May 2027	Active	Junior/Youth Program	Ruby		House of Reverion	Colonel
410	Dyra Muntazsirah	19 November 2026	Active	Junior/Youth Program	Sigmund		House of Havaria	Colonel
440	Sofia Grace Wu	9 November 2026	Active	Junior/Youth Program	Gladwell		House of Creanova	Colonel
442	Beatrys Vanesa Moiras	10 August 2026	Active (Grace Period)	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Thenova	Lt. General
443	Candyce Valezka Moiras	10 August 2026	Active (Grace Period)	Junior/Youth Program	Spielberg (Sat 4-6)		House of Havaria	Lt. General
255	Denzel Geraldo Wijaya	25 November 2026	Active	Junior/Youth Program	Alexandrite		House of Reverion	Sergeant
274	Candice Winardi Wong	5 December 2026	Active	Junior/Youth Program	Spielberg (Sat 4-6)		House of Havaria	Colonel
329	Vrederick Benaricco Tanjaya	21 August 2026	Active (Grace Period)	Junior/Youth Program	Sapphire		House of Thenova	Colonel
368	Felice Vallerie Angkasa	24 May 2027	Active	Junior/Youth Program	Obsidian		House of Creanova	Colonel
27	Valerie Legolas Cen	22 May 2027	Active	Junior/Youth Program	Obsidian		House of Havaria	Sergeant
136	Claudine Joshanley	28 September 2026	Active	Junior/Youth Program	Graham		House of Creanova	Lt. Colonel
149	Elaine Velicia	9 August 2026	Active (Grace Period)	Junior/Youth Program	Newton (Tue 4-6)		House of Quorion	Lt. Colonel
249	Emily Santo	22 May 2027	Active	Junior/Youth Program	Jade		House of Havaria	Sergeant
482	Reizo Kazuo Wong	15 August 2026	Active (Grace Period)	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Havaria	Colonel
483	Jolie Charlotte Huang	13 April 2027	Active	Junior/Youth Program	Topaz			Lt. General
490	Shane Ferrucio Lim	6 August 2026	Active (Grace Period)	Junior/Youth Program	Alexandrite		House of Havaria	Lt. Colonel
528	Kiery Keionna Kie	24 December 2026	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Havaria	Lt. Colonel
531	Max Chen	8 August 2026	Active (Grace Period)	Junior/Youth Program	Sapphire			Sergeant
532	Yasmin Fadhila Azzakiyah	6 January 2027	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Thenova	Lt. Colonel
545	Brandon Chiang	14 October 2026	Active	Junior/Youth Program	Sigmund		House of Quorion	Lt. General
548	Fiona Candiof	15 April 2027	Active	Junior/Youth Program	Spielberg (Sat 4-6)		House of Havaria	Lt. Colonel
553	Florencia Hewi	5 May 2027	Active	Junior/Youth Program	Mandela		House of Quorion	Lt. Colonel
566	Jollyn Felicia Wong	14 January 2027	Active	Junior/Youth Program	Spielberg (Sat 4-6)		House of Havaria	Colonel
569	Josevin Carel H.	7 September 2026	Active	Junior/Youth Program	Sigmund		House of Quorion	Lt. Colonel
574	Brandon Tiojaya	28 October 2026	Active	Junior/Youth Program	Mandela		House of Creanova	Colonel
575	Mandy Ellen Sanusi	20 September 2026	Active	Junior/Youth Program	DaVinci		House of Creanova	Lt. General
580	Vivienne Zheng	4 August 2026	Active (Grace Period)	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Quorion	General
581	Nicholas Zheng	4 August 2026	Active (Grace Period)	Junior/Youth Program	Spielberg (Sat 4-6)		House of Havaria	Lt. General
582	Ethan Aldrich Lie	17 August 2026	Active (Grace Period)	Junior/Youth Program	Gandhi		House of Havaria	Lt. Colonel
585	Harvey Wijaya	11 March 2027	Active	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Creanova	Colonel
586	Annabella Wijaya	11 December 2026	Active	Junior/Youth Program	Mandela		House of Thenova	Colonel
587	Enrico Victorian	16 April 2027	Active	Junior/Youth Program	Pearl		House of Havaria	Colonel
600	Gyan Lucero Joenardi	2 January 2027	Active	Junior/Youth Program	Ruby		House of Thenova	Colonel
601	Mikaella Hutteleigh Ng	20 July 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Thenova	Colonel
602	Alexandra Joan Micheline	22 September 2026	Active	Junior/Youth Program	Jade		House of Creanova	Colonel
604	Hugo Viandi	15 August 2026	Active (Grace Period)	Junior/Youth Program	Robbins (Sat 1-3)		House of Havaria	Lt. Colonel
613	Junior Auson Halim	2 November 2026	Active	Junior/Youth Program	Clinton (Fri 3-5)			Lt. Colonel
614	Rayden Chiang	2 November 2026	Active	Junior/Youth Program	DaVinci		House of Thenova	Colonel
621	Ufaira Tiandra Dalimunthe	17 June 2027	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Thenova	Lt. Colonel
625	Audrey Hartono Lee	28 October 2026	Active	Junior/Youth Program	Graham		House of Creanova	Private
629	Joey Frederica Ang	28 April 2027	Active	Junior/Youth Program	Graham		House of Havaria	Private
631	Queency Joycelyn Yieginia	1 July 2027	Active	Junior/Youth Program	Gladwell		House of Havaria	Lt. Colonel
633	Fiona Jolys Chong	17 August 2026	Active (Grace Period)	Junior/Youth Program	Gates (Sat 10-12)		House of Havaria	Colonel
636	Zia Arafa Khairina	20 October 2026	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Thenova	Lt. Colonel
638	Chloe Olivia Ruslie	11 January 2027	Active	Junior/Youth Program	Alexandrite		House of Quorion	Lt. Colonel
639	Bianca Olivia Ruslie	28 November 2026	Active	Junior/Youth Program	Alexandrite		House of Thenova	Sergeant
651	Ashley Claire Lorence	28 November 2026	Active	Junior/Youth Program	Graham		House of Thenova	Private
673	Nathan Immanuel Winanto	29 November 2026	Active	Junior/Youth Program	Denver		House of Havaria	Sergeant
675	Maxen Zo Leon	2 August 2027	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Havaria	Lt. Colonel
676	Grace Alexandra	2 March 2027	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Havaria	Colonel
677	Olivia Florence Loesin	29 January 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)			Sergeant
679	Fiorenza Eleanor Wijaya	4 August 2026	Active (Grace Period)	Junior/Youth Program	Millman (Sat 1-3)		House of Havaria	Colonel
680	Gracelyn Yap	14 April 2027	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Quorion	Lt. General
683	Stanley Ace Lorence	2 September 2026	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Colonel
686	Owen Linwood	4 April 2027	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Lt. Colonel
704	Morgan Valentino Lowis	9 September 2026	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Thenova	Lt. Colonel
707	Samho Gunawan	11 April 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Thenova	Lt. Colonel
709	Winston Lawrence	2 March 2027	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Reverion	Colonel
716	Chloe Vallerie Jie	1 August 2026	Active (Grace Period)	Junior/Youth Program	Clinton (Fri 3-5)		House of Reverion	Lt. Colonel
719	Davar Aly Harahap	23 September 2026	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Quorion	Colonel
726	Renzo Tanaka	29 July 2026	Active (Grace Period)	Junior/Youth Program	Graham		House of Thenova	Lt. Colonel
735	Kenward Melvern Djohan	30 April 2027	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Havaria	Lt. Colonel
736	Kendrick Melvern Djohan	30 April 2027	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Reverion	Lt. Colonel
738	Adeline Njo	19 September 2026	Active	Junior/Youth Program	DaVinci		House of Havaria	Lt. Colonel
739	Zoefiker Putera Ngadiman	5 October 2026	Active	Junior/Youth Program	Spielberg (Sat 4-6)		House of Reverion	Lt. Colonel
740	Aubree Lisman	10 November 2026	Active	Junior/Youth Program	Gandhi		House of Thenova	Colonel
741	Brayden Lisman	27 October 2026	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Quorion	Colonel
745	Jesslyn	4 October 2026	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Thenova	General
751	Howie Chan	18 June 2027	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Colonel
754	Reagan Khei Subroto	26 September 2026	Active	Junior/Youth Program	Canfield		House of Quorion	Lt. Colonel
761	Richelle Zheng	21 December 2026	Active	Junior/Youth Program	Gandhi		House of Thenova	Lt. Colonel
763	Safira Reynia Hanum	27 October 2026	Active	Junior/Youth Program	Lincoln		House of Quorion	Private
767	Theodore Joachim Wihardjo	30 June 2027	Active	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Havaria	Sergeant
779	Jayden Tarmidi	25 November 2026	Active	Junior/Youth Program	Winfrey (Thursday 4-6)		House of Havaria	Lt. Colonel
784	Garrix Ardent Putra	4 November 2026	Active	Junior/Youth Program	Lincoln		House of Havaria	Private
785	Kelly Alyse Tanary	16 August 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Havaria	Lt. Colonel
801	Hillary Calista Tamado Panjaitan	27 September 2026	Active	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Thenova	Colonel
803	Lovea Fendy Kho	6 September 2026	Active	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Quorion	Lt. General
806	Efrata Iskandar Liunardi	16 January 2027	Active	Junior/Youth Program	Lincoln		House of Havaria	Private
809	Emilia Niko Nyoman	6 August 2026	Active (Grace Period)	Junior/Youth Program	Lincoln		House of Thenova	Private
811	Arthur Floyd Salim	9 November 2026	Active	Junior/Youth Program	Lincoln		House of Thenova	Private
819	Maria Jill Lumbantoruan	16 April 2027	Active	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Thenova	Lt. Colonel
822	Clarissa Olivia Anne Lammora Panjaitan	2 September 2026	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Havaria	Colonel
835	Finn Aldrich Luman	6 October 2026	Active	Junior/Youth Program	Lincoln		House of Thenova	Private
836	Kent Arthur Luman	13 January 2027	Active	Junior/Youth Program	Hogwarts			
837	Clairine Angela Indrajaya	15 January 2027	Active	Junior/Youth Program	Lincoln		House of Reverion	Private
838	Louis Harvey Soesanto	19 January 2027	Active	Junior/Youth Program	Wonderland			
842	Ethan Moeritz	14 September 2026	Active	Junior/Youth Program	Mandela		House of Thenova	Private
845	Wallace Evencio	19 August 2026	Active (Grace Period)	Junior/Youth Program	Newton (Tue 4-6)		House of Thenova	Lt. Colonel
850	Karin Destynsia	12 August 2026	Active (Grace Period)	Junior/Youth Program	DaVinci		House of Thenova	Colonel
852	Cellistia Cangdiago	10 August 2026	Active (Grace Period)	Junior/Youth Program	Galileo (Wed 4-6)		House of Quorion	Lt. General
855	Cayden Louis Auwrich	2 April 2027	Active	Junior/Youth Program	Clinton (Fri 3-5)		House of Quorion	Sergeant
857	Hogan Chan	17 March 2027	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Lt. Colonel
858	Delmond Osyan Sudilan	20 March 2027	Active	Junior/Youth Program	Mandela		House of Thenova	Sergeant
859	Clarissa Kho	19 November 2026	Active	Junior/Youth Program	Graham		House of Thenova	Private
863	Bonita Gaudeti Sinaga	25 February 2027	Active	Junior/Youth Program	Winfrey (Thursday 4-6)		House of Quorion	Lt. Colonel
865	Victoria Yap	7 April 2027	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Lt. Colonel
866	Carlsen Simen	25 November 2026	Active	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Reverion	Sergeant
867	Cherlyn Simen	25 November 2026	Active	Junior/Youth Program	Winfrey (Thursday 4-6)		House of Quorion	Sergeant
868	Sergio Garcia Ang	1 August 2026	Active (Grace Period)	Junior/Youth Program	Beryl		House of Creanova	Lt. Colonel
872	Kenneth Samuel Lim	28 August 2026	Active	Junior/Youth Program	DaVinci		House of Creanova	Lt. Colonel
874	Muhammad Rafli Arkan	1 August 2026	Active (Grace Period)	Junior/Youth Program	Graham		House of Thenova	Sergeant
875	Clarissa Fredelyn Jeoh	3 February 2027	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Thenova	Sergeant
876	Jacqueline Vallerie Chen	1 August 2026	Active (Grace Period)	Junior/Youth Program	Topaz		House of Havaria	Lt. Colonel
880	Joel Edward	16 August 2026	Active (Grace Period)	Junior/Youth Program	Gates (Sat 10-12)		House of Havaria	Lt. Colonel
883	Joanne Lynch	17 November 2026	Active	Junior/Youth Program	Lincoln		House of Reverion	Private
889	Madelyn Odelia Lowis	15 August 2026	Active (Grace Period)	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Colonel
896	Nicolas Carlie Kuwira	11 March 2027	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Havaria	Lt. General
897	Valerie Ivana Chen	10 September 2026	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Quorion	Sergeant
898	Ricson Stanlay	20 January 2027	Active	Junior/Youth Program	Neverland			
902	Malcolm	27 January 2027	Active	Junior/Youth Program	Gladwell		House of Quorion	Sergeant
903	Harvey Oliver Lee	21 April 2027	Active	Junior/Youth Program	Gladwell		House of Thenova	Private
904	Callista Aurelia Tasma	18 March 2027	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Thenova	Colonel
909	Keona Jaileynn Lawrence	12 October 2026	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Havaria	Sergeant
910	Michael Thamida	11 October 2026	Active	Junior/Youth Program	Sigmund		House of Thenova	Sergeant
911	Meivellynn Thamida	11 October 2026	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Thenova	Lt. Colonel
913	Roselie Kirana Wijaya	6 October 2026	Active	Junior/Youth Program	Newton (Tue 4-6)		House of Creanova	Sergeant
914	Leia Kaytlyn Tioe	12 August 2026	Active (Grace Period)	Junior/Youth Program	Lincoln		House of Creanova	Private
922	Victoria Cenata	25 October 2026	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Thenova	Sergeant
927	Richela Stanlay	11 February 2027	Active	Junior/Youth Program	Dale (Sat 4-6)		House of Thenova	Sergeant
929	Trevor Hartono Lee	12 May 2027	Active	Junior/Youth Program	Newton (Tue 4-6)		House of Creanova	Sergeant
932	Olivia Tjoa	15 December 2026	Active	Junior/Youth Program	Maxwell		House of Thenova	Sergeant
933	Ivy Jeane Chanella	25 January 2027	Active	Junior/Youth Program	Camelot			
935	Gisella Nyoto	14 June 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Havaria	Sergeant
937	Jillian Claire Kuanrius	10 August 2027	Active	Junior/Youth Program	Graham		House of Thenova	Sergeant
938	Reagan Nyoto	14 June 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Havaria	Sergeant
939	Rexcaden Jazper Shu	3 June 2027	Active	Junior/Youth Program	Winfrey (Thursday 4-6)		House of Havaria	Lt. Colonel
942	Elaine Viandi	18 November 2026	Active	Junior/Youth Program	Dale (Sat 4-6)		House of Havaria	Sergeant
945	Angeline Felice Theo	4 March 2027	Active	Junior/Youth Program	Newton (Tue 4-6)		House of Havaria	Private
947	Nayyara Ayaskara Prakasita	16 August 2026	Active (Grace Period)	Junior/Youth Program	Gandhi		House of Quorion	Sergeant
950	Audrey Madison Loewe	18 October 2026	Active	Junior/Youth Program	Lincoln		House of Havaria	Private
951	Mavin Jericho Phen	22 August 2026	Active (Grace Period)	Junior/Youth Program	Doyle (Sat 1-3)		House of Reverion	Sergeant
956	Aileen Sophie Kesuma	29 October 2026	Active	Junior/Youth Program	Maxwell		House of Thenova	Sergeant
962	Ananda Putera Ngadiman	1 September 2026	Active	Junior/Youth Program	Mandela		House of Havaria	Sergeant
963	Yasmina Athirah Rifqi	15 September 2026	Active	Junior/Youth Program	Gladwell		House of Creanova	Private
964	Yazeed Abizar Rifqi	15 December 2026	Active	Junior/Youth Program	Lincoln		House of Havaria	Private
965	Modric Agusta Daruma	8 October 2026	Active	Junior/Youth Program	Maxwell		House of Thenova	Sergeant
968	Lady Valery Sinambela	8 October 2026	Active	Junior/Youth Program	Newton (Tue 4-6)		House of Creanova	Sergeant
970	Annabela Himeko Winarta	8 October 2026	Active	Junior/Youth Program	Newton (Tue 4-6)		House of Thenova	Sergeant
980	Ezio Lim	8 October 2026	Active	Junior/Youth Program	Newton (Tue 4-6)		House of Quorion	Sergeant
981	Joey Milan Phen	8 April 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Thenova	Sergeant
982	Abigail Hazel Tamin	12 November 2026	Active	Junior/Youth Program	Gladwell		House of Havaria	Sergeant
984	Chaden Ettienne Halim	3 August 2026	Active (Grace Period)	Junior/Youth Program	Millman (Sat 1-3)		House of Quorion	Sergeant
986	Jason Allen Tjoa	8 April 2027	Active	Junior/Youth Program	Newton (Tue 4-6)		House of Quorion	Sergeant
987	Caren Pandiago	19 October 2026	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Thenova	Sergeant
988	Gavyn Wijaya	29 April 2027	Active	Junior/Youth Program	Maxwell		House of Thenova	Sergeant
989	Federico Fredelyn Jeoh	26 October 2026	Active	Junior/Youth Program	Gladwell		House of Havaria	Sergeant
990	Zason Riady Ko	24 August 2026	Active (Grace Period)	Junior/Youth Program	Whomville			
991	Arya Kho	29 December 2026	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Quorion	Private
994	Valisha Sofi Tjandra	16 November 2026	Active	Junior/Youth Program	Sigmund		House of Havaria	Private
995	Qori Putri Syahviah	24 November 2026	Active	Junior/Youth Program	Gladwell		House of Thenova	Sergeant
996	Venesia Anggini Purba	17 January 2027	Active	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Reverion	Sergeant
999	Annabelle Grace Wu	5 November 2026	Active	Junior/Youth Program	Lincoln		House of Thenova	Sergeant
1003	Arthur Alexander Hakim	26 January 2027	Active	Junior/Youth Program	Gladwell		House of Thenova	Sergeant
1007	Davina Grace Ong	21 August 2026	Active (Grace Period)	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Thenova	Sergeant
1008	Sydney Princessa Lim	21 August 2026	Active (Grace Period)	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Quorion	Sergeant
1009	Felicia Grace Ong	21 August 2026	Active (Grace Period)	Junior/Youth Program	Mandela		House of Thenova	Private
1010	Gracielle Grace Ong	21 August 2026	Active (Grace Period)	Junior/Youth Program	Mandela		House of Havaria	Private
1015	Fransisca	11 January 2027	Active	Junior/Youth Program	Clinton (Fri 3-5)		House of Quorion	Sergeant
1017	Harvardo Lovenzo Susanto	26 January 2027	Active	Junior/Youth Program	Gladwell		House of Havaria	Sergeant
1019	Louis Clinton Chai	5 January 2027	Active	Junior/Youth Program	Mandela		House of Thenova	Private
1020	Caren Axella Natania Lumbantoruan	1 February 2027	Active	Junior/Youth Program	Maxwell		House of Thenova	Sergeant
1022	Efraim Lucas Dimitri	17 August 2026	Active (Grace Period)	Junior/Youth Program	Newton (Tue 4-6)		House of Thenova	Private
1024	Chloe Audrey Chen	26 January 2027	Active	Junior/Youth Program	Hogwarts			
1025	Hermione Lovely Susanto	17 January 2027	Active	Junior/Youth Program	Winfrey (Thursday 4-6)		House of Havaria	Sergeant
1027	Elnino Jehanra Saragih	12 January 2027	Active	Junior/Youth Program	Spielberg (Sat 4-6)		House of Creanova	Lt. Colonel
1029	Luna Antoinette Linne	8 September 2026	Active	Junior/Youth Program	Winfrey (Thursday 4-6)		House of Havaria	Sergeant
1031	Jacques Lewinsky	11 January 2027	Active	Junior/Youth Program	Clinton (Fri 3-5)		House of Thenova	Sergeant
1033	Shelvina Howie	26 August 2026	Active (Grace Period)	Junior/Youth Program	Canfield		House of Havaria	Lt. Colonel
1034	Cherryl Riquelme Potan	16 August 2026	Active (Grace Period)	Junior/Youth Program	Gandhi		House of Havaria	Sergeant
1037	Caitlyn Allison Yaphen	16 January 2027	Active	Junior/Youth Program	Gandhi		House of Havaria	Sergeant
1038	Devon Jau	26 August 2026	Active (Grace Period)	Junior/Youth Program	Canfield		House of Creanova	Sergeant
1040	Shane Anastasya Kristy Simangunsong	25 January 2027	Active	Junior/Youth Program	Graham		House of Thenova	Sergeant
1041	Chloe Taydey	26 August 2026	Active (Grace Period)	Junior/Youth Program	Canfield		House of Reverion	Sergeant
1043	Kenrich Thantio Yangderson	1 July 2027	Active	Junior/Youth Program	Neverland			
1044	Dominic Kie	7 August 2026	Active (Grace Period)	Junior/Youth Program	Tracy (Sat 4-6)		House of Quorion	Sergeant
1045	Silvario Soedidjo	8 August 2026	Active (Grace Period)	Junior/Youth Program	Clinton (Fri 3-5)		House of Thenova	Sergeant
1047	Jordan Tanutama	1 February 2027	Active	Junior/Youth Program	Graham		House of Quorion	Private
1049	Rafael Maximillian Sitorus	2 August 2026	Active (Grace Period)	Junior/Youth Program	Doyle (Sat 1-3)		House of Havaria	Sergeant
1050	Galang Roland Besch	2 August 2026	Active (Grace Period)	Junior/Youth Program	Doyle (Sat 1-3)		House of Havaria	Sergeant
1051	Timothy Anwi Panca	26 September 2026	Active	Junior/Youth Program	Canfield		House of Creanova	Sergeant
1053	Elaine Clemence Annabell	26 August 2026	Active (Grace Period)	Junior/Youth Program	Canfield		House of Havaria	Private
1056	Yeslin Yap	13 August 2026	Active (Grace Period)	Junior/Youth Program	Gandhi		House of Thenova	Private
1057	Louis Xavier Leonardi	20 March 2027	Active	Junior/Youth Program	Dale (Sat 4-6)		House of Thenova	Private
1058	Gracia Tiffany Susanto	26 September 2026	Active	Junior/Youth Program	Canfield		House of Thenova	Sergeant
1059	Meuthia Gadiza	26 February 2027	Active	Junior/Youth Program	Asheville		House of Thenova	Sergeant
1060	Zac Aldrich Mayor	13 October 2026	Active	Junior/Youth Program	Dale (Sat 4-6)		House of Thenova	Private
1061	Kayden Skylar Sanso	13 January 2027	Active	Junior/Youth Program	Hogwarts			
1062	Queensya Lovely Reya	26 August 2026	Active (Grace Period)	Junior/Youth Program	Clinton (Fri 3-5)		House of Thenova	Sergeant
1065	Maxwell Louis Jaya	10 March 2027	Active	Junior/Youth Program	Wonderland			
1066	Samuel Christopher Halim	20 January 2027	Active	Junior/Youth Program	Neverland			
1071	Chloe Aurelia Ten	6 April 2027	Active	Junior/Youth Program	Gates (Sat 10-12)		House of Quorion	Sergeant
1072	Hazel Natalie Ten	6 April 2027	Active	Junior/Youth Program	Dale (Sat 4-6)		House of Havaria	Sergeant
1073	Scarlett Avery Ten	20 February 2027	Active	Junior/Youth Program	Wonderland			
1074	Ayska Najya Prakasita	3 September 2026	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Sergeant
1075	Bryan Michael Ng	6 June 2027	Active	Junior/Youth Program	Gates (Sat 10-12)			Sergeant
1076	Brayden Matthew Ng	6 June 2027	Active	Junior/Youth Program	Gates (Sat 10-12)			Sergeant
1077	Alqueenza Syifa Winona	26 July 2027	Active	Junior/Youth Program	Clinton (Fri 3-5)		House of Thenova	Sergeant
1078	Ethan Kenny Daruma	2 March 2027	Active	Junior/Youth Program	DaVinci		House of Thenova	Private
1079	Keigo Kusuno Soh	3 October 2026	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Reverion	Private
1080	Reynara Amber Koiman	3 September 2026	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Reverion	Private
1081	Carlton Kho	3 October 2026	Active	Junior/Youth Program	Pearl		House of Havaria	Private
1083	Gillian Alexa Pearl	13 January 2027	Active	Junior/Youth Program	Hogwarts			
1084	Leonard Nyoto	20 January 2027	Active	Junior/Youth Program	Wonderland			
1085	Garent Nyoto	20 January 2027	Active	Junior/Youth Program	Wonderland			
1086	Kayden Ethan Zhou	12 September 2026	Active	Junior/Youth Program	Clinton (Fri 3-5)			Private
1088	Alesha Sofia Andhika	16 September 2026	Active	Junior/Youth Program	Maxwell		House of Thenova	Sergeant
1089	Jessica Jo	3 February 2027	Active	Junior/Youth Program	Hogwarts			
1090	Healey Tjoe	11 April 2027	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Quorion	Private
1093	Annastasia Hideko Winarta	18 January 2027	Active	Junior/Youth Program	Hogwarts			
1096	Maxwell Kenson Wibisono	18 January 2027	Active	Junior/Youth Program	Narnia			
1097	Reia Rose Winfield	11 August 2026	Active (Grace Period)	Junior/Youth Program	Narnia			
1098	Naia Sydney Winfield	11 January 2027	Active	Junior/Youth Program	Narnia			
1101	Fredella Alexa Maranggi Siregar	6 May 2027	Active	Junior/Youth Program	Graham		House of Quorion	Private
1102	Adhyasta William Nugroho	7 August 2026	Active (Grace Period)	Junior/Youth Program	Graham			Private
1103	Nicholas Tjin	8 June 2027	Active	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Thenova	Sergeant
1104	Abbygael Mikaela Tangelyn	5 May 2027	Active	Junior/Youth Program	Galileo (Wed 4-6)		House of Quorion	Sergeant
1105	Keiko Aiby Lim	14 March 2027	Active	Junior/Youth Program	Whomville			
1106	Vierra Cleevany Ryu	8 November 2026	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Thenova	Private
1107	Gwyneth Louisa Yap	8 November 2026	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Creanova	Private
1113	Joe Benedict Japto	22 December 2026	Active	Junior/Youth Program	Narnia			
1115	Reagan Oliver Zhuang	14 December 2026	Active	Junior/Youth Program	Wonderland			
1116	Kim Megumi	5 December 2026	Active	Junior/Youth Program	Sigmund		House of Quorion	Private
1117	Claire Gabrielle Oscar	20 March 2027	Active	Junior/Youth Program	Wonderland			
1118	Reagan Thierry Wijaya	11 October 2026	Active	Junior/Youth Program	Robbins (Sat 1-3)		House of Thenova	Private
1119	Andrea Dimitri Ashraafi Lazzaroni	14 January 2027	Active	Junior/Youth Program	Whomville			
1120	Reynand Wijaya	7 September 2026	Active	Junior/Youth Program	Whomville			
1121	Liam John Rickson	30 October 2026	Active	Junior/Youth Program	Marley		House of Creanova	Private
1122	Leeanne Jane Lim	6 January 2027	Active	Junior/Youth Program	Neverland			
1123	Joequinn Felysse Warsono	10 August 2026	Active (Grace Period)	Junior/Youth Program	Mandela		House of Thenova	Private
1124	Felicia Liangso	7 October 2026	Active	Junior/Youth Program	Canfield		House of Thenova	Private
1125	Grace Anastasia Zeng	5 September 2026	Active	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Havaria	Sergeant
1128	Lashira Awbinsriee Pane	24 January 2027	Active	Junior/Youth Program	Hogwarts			
1129	Stephanie Evelyn Luo	4 September 2026	Active	Junior/Youth Program	Gandhi		House of Thenova	Private
1130	Ethan Ray Maxwell	29 July 2026	Active (Grace Period)	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Thenova	Sergeant
1131	Vinxiero Carrick Francoiz	7 August 2026	Active (Grace Period)	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Thenova	Private
1132	Nicole Lee	30 September 2026	Active	Junior/Youth Program	Marley		House of Quorion	Private
1133	Natalie Willeen Zhang	7 August 2026	Active (Grace Period)	Junior/Youth Program	Kiyosaki (Sat 4-6)		House of Thenova	Private
1134	Kent Nanda Daruma	5 August 2026	Active (Grace Period)	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Quorion	Private
1135	Cherysse Auryn Khobert	30 September 2026	Active	Junior/Youth Program	Marley		House of Havaria	Private
1137	Celine Angeline Yiandri	26 September 2026	Active	Junior/Youth Program	Grande (Thu 4-6 PM)		House of Havaria	Private
1138	Mike Louis Wijaya	4 October 2026	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Thenova	Private
1139	Wilbert Wijaya	4 October 2026	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Quorion	Private
1140	Keita Raelyn Deng	11 February 2027	Active	Junior/Youth Program	Wonderland			
1141	Joyce Nathania Shen	21 January 2027	Active	Junior/Youth Program	Wonderland			
1142	Oscar Linwood	10 January 2027	Active	Junior/Youth Program	Neverland			
1143	Rico Alvaro Chandra	30 September 2026	Active	Junior/Youth Program	Marley			Private
1144	Kayla Shilyn Gani	28 October 2026	Active	Junior/Youth Program	Millman (Sat 1-3)		House of Havaria	Private
1145	Gallen Yuman King	10 January 2027	Active	Junior/Youth Program	Neverland			
1146	Charis Yafa Tobing	30 September 2026	Active	Junior/Youth Program	Maxwell		House of Thenova	Private
1147	Calista Kasih Aprilia Harahap	30 October 2026	Active	Junior/Youth Program	Marley		House of Reverion	Private
1148	Talysha Sri Nayla	30 September 2026	Active	Junior/Youth Program	Marley		House of Thenova	Private
1149	Arnold Alexander Hakim	11 January 2027	Active	Junior/Youth Program	Hogwarts			
1150	Kellyn Chandra	7 October 2026	Active	Junior/Youth Program	Canfield		House of Quorion	Private
1151	Theona Zefanya Purba	17 October 2026	Active	Junior/Youth Program	Sigmund		House of Havaria	Private
1152	Javerson Joshua Tobing	17 October 2026	Active	Junior/Youth Program	Sigmund		House of Thenova	Private
1153	Philippe Benedict Zhuang	13 October 2026	Active	Junior/Youth Program	Marley		House of Havaria	Private
1154	Aca Raymond Tjemerlang	13 November 2026	Active	Junior/Youth Program	Gandhi		House of Creanova	Private
1155	Howard Winston Louis	22 November 2026	Active	Junior/Youth Program	Tracy (Sat 4-6)		House of Thenova	Private
1156	Alika Zelmira Wibowo	30 December 2026	Active	Junior/Youth Program	Ziglar (Sat 4-6)		House of Reverion	Private
1157	Gywen Stefanie Wiley	30 November 2026	Active	Junior/Youth Program	Ziglar (Sat 4-6)		House of Thenova	Private
1158	Kendrick Eoghan	30 November 2026	Active	Junior/Youth Program	Mandela		House of Quorion	Private
1159	Kezia Zenitha Sinaga	4 January 2027	Active	Junior/Youth Program	Ziglar (Sat 4-6)			Private
1160	Karen Kallenia Sinaga	4 January 2027	Active	Junior/Youth Program	Whomville			
1161	Randa Miracle Boasly Sihombing	3 December 2026	Active	Junior/Youth Program	Galileo (Wed 4-6)			Private
1162	Carine Susanto Lie	6 December 2026	Active	Junior/Youth Program	Ziglar (Sat 4-6)		House of Havaria	Private
1163	Azarine Apriza Darmawan	4 January 2027	Active	Junior/Youth Program	Ziglar (Sat 4-6)		House of Thenova	Private
1164	Felicia Ivana Silalahi	26 November 2026	Active	Junior/Youth Program	DaVinci		House of Creanova	Private
1165	Madeline Lauren	4 January 2027	Active	Junior/Youth Program	Whomville			
1166	Anderson Putra Supama	4 January 2027	Active	Junior/Youth Program	Narnia			
1167	Fredericka Sigalingging	30 November 2026	Active	Junior/Youth Program	Ziglar (Sat 4-6)		House of Quorion	Private
1168	Viorencia Tantana	4 January 2027	Active	Junior/Youth Program	Ziglar (Sat 4-6)		House of Quorion	Private
1169	Gisellene Lowisuri	11 January 2027	Active	Junior/Youth Program	Ziglar (Sat 4-6)			Private
1170	Kaylynn Zhanghoven	20 January 2027	Active	Junior/Youth Program	Marley			Private
1171	Angelina Cenata	13 December 2026	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Creanova	Private
1172	Ferdian Zulkarnain	10 January 2027	Active	Junior/Youth Program	Neverland			
1173	Mia Emily Soeripin	4 January 2027	Active	Junior/Youth Program	Whomville			
1174	Vivienne Claire Soeripin	26 January 2027	Active	Junior/Youth Program	Socrates		House of Thenova	Private
1175	Vingeline Chelsealya Angkasa	11 January 2027	Active	Junior/Youth Program	Hogwarts			
1176	Jean Catherine Anneliese Sebayang	20 January 2027	Active	Junior/Youth Program	Einstein			Private
1177	James Edward Lie	26 December 2026	Active	Junior/Youth Program	Clinton (Fri 3-5)			
1178	Richeline Huang	26 January 2027	Active	Junior/Youth Program	Socrates			Private
1179	Livi Celia Lim	6 January 2027	Active	Junior/Youth Program	Marley			Private
1180	Hariwell	20 January 2027	Active	Junior/Youth Program	Einstein			Private
1181	Azzam Al Vanka	4 January 2027	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Thenova	Private
1182	Stella Wijaya	10 January 2027	Active	Junior/Youth Program	Neverland			
1183	Maxwell Utomo	20 January 2027	Active	Junior/Youth Program	Einstein		House of Quorion	Private
1184	Louis Sinclair Zuary	29 January 2027	Active	Junior/Youth Program	Aristotle			Private
1185	Genovia Grace Widjaja	12 January 2027	Active	Junior/Youth Program	Whomville			
1186	Ray Yudhistira Ng	20 January 2027	Active	Junior/Youth Program	Einstein		House of Thenova	Private
1187	Michelle Aurelia Chen	26 January 2027	Active	Junior/Youth Program	Socrates		House of Thenova	Private
1188	James Oliver Coaca	2 February 2027	Active	Junior/Youth Program	Plato		House of Havaria	Private
1189	Kennan Eito Shankara	11 January 2027	Active	Junior/Youth Program	Wonderland			
1190	Nalina Vimala	29 January 2027	Active	Junior/Youth Program	Aristotle		House of Thenova	Private
1191	Joya Vania Silaen	20 January 2027	Active	Junior/Youth Program	Einstein		House of Creanova	Private
1192	Sergio Ronald Utomo	29 January 2027	Active	Junior/Youth Program	Aristotle			Private
1193	Cheryl Eilyn Affandy	24 January 2027	Active	Junior/Youth Program	Clinton (Fri 3-5)		House of Reverion	Private
1194	Max Kingston Marzuki	29 January 2027	Active	Junior/Youth Program	Aristotle			Private
1195	Kenzo Wibowo Marzuki	29 January 2027	Active	Junior/Youth Program	Aristotle			Private
1196	Grace Martok	29 January 2027	Active	Junior/Youth Program	Aristotle			Private
1198	Jovan Jonathan Cen	20 January 2027	Active	Junior/Youth Program	Einstein		House of Thenova	Private
1199	Joey Jonas Cen	20 January 2027	Active	Junior/Youth Program	Einstein		House of Quorion	Private
1201	Ivania Gracesinka	26 January 2027	Active	Junior/Youth Program	Socrates		House of Havaria	Private
1202	Cornelius Wilfred	20 January 2027	Active	Junior/Youth Program	Einstein		House of Thenova	Private
1203	Kevin Fico Aurelio	26 January 2027	Active	Junior/Youth Program	Socrates			Private
1204	Kendrick Filbert Aurelio	26 January 2027	Active	Junior/Youth Program	Socrates			Private
1205	Kaylee Alessia Ridgen	12 January 2027	Active	Junior/Youth Program	Whomville			
1206	Daniel Haryanto	10 January 2027	Active	Junior/Youth Program	Neverland			
1207	James Jayden Chandra	20 January 2027	Active	Junior/Youth Program	Einstein		House of Creanova	Private
1208	Dwayne Alvaro Phen	25 January 2027	Active	Junior/Youth Program	Doyle (Sat 1-3)		House of Quorion	Private
1209	Michele Cecilia Belvania Saragih	24 January 2027	Active	Junior/Youth Program	Graham		House of Havaria	Private
1210	Joycelyn Annabelle	20 January 2027	Active	Junior/Youth Program	Einstein		House of Thenova	Private
1211	Dion Lorenzo Castio	2 February 2027	Active	Junior/Youth Program	Plato			Private
1212	Aurelia Wyanto	1 February 2027	Active	Junior/Youth Program	Ziglar (Sat 4-6)		House of Thenova	Private
1213	Kaylee Wayne Laong	27 January 2027	Active	Junior/Youth Program	Einstein			Private
1214	Fiona Tjongnata	26 January 2027	Active	Junior/Youth Program	Socrates		House of Quorion	Private
1216	Marc Maximus Zhang	27 January 2027	Active	Junior/Youth Program	Einstein		House of Thenova	Private
1217	Daxton Lie	31 January 2027	Active	Junior/Youth Program	Sigmund			Private
1218	Odilia Alexandra Yang	27 January 2027	Active	Junior/Youth Program	Einstein		House of Havaria	Private
1219	Naviauly Dolorosa Sinaga	28 January 2027	Active	Junior/Youth Program	DaVinci		House of Reverion	Private
1220	Kinara Caliezia Pangestu	27 January 2027	Active	Junior/Youth Program	Einstein		House of Thenova	Private
1222	Hans Andersen Yap	29 January 2027	Active	Junior/Youth Program	Aristotle			Private
1223	Steve Marcellino	26 January 2027	Active	Junior/Youth Program	Socrates			Private
1224	Collins Anderson	26 January 2027	Active	Junior/Youth Program				
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
