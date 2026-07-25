const fs = require('fs');
const path = require('path');
const db = require('./neonClient');

// Raw text pasted by the user
const rawText = `
27	Valerie Legolas Cen	Active
45	Aaron Goldwin Semarak	Active (Grace Period)
48	Justin Maxwell	Active
49	Richmond Osyan Sudilan	Active
50	Kenichi Zhou	Active
51	Cedric Yago	Active (Grace Period)
60	Sharleen Velicia Lim	Active
64	Jillian Rusly	Active (Grace Period)
125	Jayxen Maxwell	Active
141	Russell William Tanner	Active
149	Elaine Velicia	Active
249	Emily Santo	Active
274	Candice Winardi Wong	Active
329	Vrederick Benaricco Tanjaya	Active
333	Jasmine Yenarti	Active
368	Felice Vallerie Angkasa	Active
440	Sofia Grace Wu	Active
528	Kiery Keionna Kie	Active (Grace Period)
531	Max Chen	Active
532	Yasmin Fadhila Azzakiyah	Active
545	Brandon Chiang	Active
255	Denzel Geraldo Wijaya	Active
269	Fresia Victoria Chendry	Active
285	Clairine Joshanley	Active
301	Chloe Zhou	Active
375	Darren Gabriel	Active
429	Charrelle Anthony	Active
442	Beatrys Vanesa Moiras	Active
443	Candyce Valezka Moiras	Active
482	Reizo Kazuo Wong	Active
483	Jolie Huang	Active
490	Shane Ferrucio Lim	Active
548	Fiona Candiof	Active
553	Florencia Hewi	Active
566	Jollyn Felicia Wong	Active
569	Josevin Carel H.	Active
574	Brandon Tiojaya	Active
575	Mandy Ellen Sanusi	Active
580	Vivienne Zheng	Active
581	Nicholas Zheng	Active
582	Ethan Aldrich Lie	Active
585	Harvey Wijaya	Active
586	Annabella Wijaya	Active
587	Enrico Victorian	Active
601	Mikaella Hutteleigh Ng	Active
602	Alexandra Joan Micheline	Active
604	Hugo Viandi	Active
613	Junior Auson Halim	Active
614	Rayden Chiang	Active
618	Yamin Yenardo	Active (Grace Period)
621	Ufaira Tiandra Dalimunthe	Active (Grace Period)
625	Audrey Hartono Lee	Active
629	Joey Frederica Ang	Active
631	Queency Joycelyn Yieginia	Active
633	Fiona Jolys Chong	Active
636	Zia Arafa Khairina	Active
638	Chloe Olivia Ruslie	Active
639	Bianca Olivia Ruslie	Active (Grace Period)
651	Ashley Claire Lorence	Active
654	Rayden Oh	Active
665	Khoo Shu Han	Active
670	Christian Anderson Lee	Active
673	Nathan Immanuel Winanto	Active
675	Maxen Zo Leon	Active
676	Grace Alexandra	Active
679	Fiorenza Eleanor Wijaya	Active
680	Gracelyn Yap	Active
683	Stanley Ace Lorence	Active
686	Owen Linwood	Active
704	Morgan Valentino Lowis	Active
707	Samho Gunawan	Active
709	Winston Lawrence	Active
716	Chloe Vallerie Jie	Active
717	Dmitri Meddef Njo	Active (Grace Period)
719	Davar Aly Harahap	Active
726	Renzo Tanaka	Active
735	Kenward Melvern Djohan	Active
736	Kendrick Melvern Djohan	Active
738	Adeline Njo	Active
739	Zoefiker Putera Ngadiman	Active
740	Aubree Lisman	Active
741	Brayden Lisman	Active
745	Jesslyn	Active
751	Howie Chan	Active
754	Reagan Khei Subroto	Active
759	Warren Emanuel	Active (Grace Period)
761	Richelle Zheng	Active (Grace Period)
763	Safira Reynia Hanum	Active
767	Theodore Joachim Wihardjo	Active
768	Josh Seravino Zhang	Active (Grace Period)
779	Jayden Tarmidi	Active
783	Evelynn Lee	Active
784	Garrix Ardent Putra	Active
785	Kelly Alyse Tanary	Active
790	Hardey Moeldoko Law	Active
801	Hillary Calista Tamado Panjaitan	Active
803	Lovea Fendy Kho	Active
806	Efrata Iskandar Liunardi	Active
809	Emilia Niko Nyoman	Active
811	Arthur Floyd Salim	Active
819	Maria Jill Lumbantoruan	Active
821	Vallerio	Active (Grace Period)
822	Clarissa Olivia Anne Lammora Panjaitan	Active
835	Finn Aldrich Luman	Active
836	Kent Arthur Luman	Active
837	Clairine Angela Indrajaya	Active
838	Louis Harvey Soesanto	Active
842	Ethan Moeritz	Active
845	Wallace Evencio	Active
850	Karin Destynsia	Active
852	Cellistia Cangdiago	Active
855	Cayden Louis Auwrich	Active
857	Hogan Chan	Active
858	Delmond Osyan Sudilan	Active
859	Clarissa Kho	Active
863	Bonita Gaudeti Sinaga	Active
865	Victoria Yap	Active
866	Carlsen Simen	Active
867	Cherlyn Simen	Active
868	Sergio Garcia Ang	Active
872	Kenneth Samuel Lim	Active
874	Muhammad Rafli Arkan	Active
875	Clarissa Fredelyn Jeoh	Active
876	Jacqueline Vallerie Chen	Active
880	Joel Edward	Active
883	Joanne Lynch	Active
887	Filia Cielo Lim	Active
889	Madelyn Odelia Lowis	Active
896	Nicolas Carlie Kuwira	Active
897	Valerie Ivana Chen	Active
898	Ricson Stanlay	Active
902	Malcolm	Active
903	Harvey Oliver Lee	Active
904	Callista Aurelia Tasma	Active
909	Keona Jaileynn Lawrence	Active
910	Michael Thamida	Active
911	Meivellynn Thamida	Active
913	Roselie Kirana Wijaya	Active
914	Leia Kaytlyn Tioe	Active
922	Victoria Cenata	Active
927	Richela Stanlay	Active
929	Trevor Hartono Lee	Active
932	Olivia Tjoa	Active
933	Ivy Jeane Chanella	Active
935	Gisella Nyoto	Active (Grace Period)
937	Jillian Claire Kuanrius	Active
938	Reagan Nyoto	Active (Grace Period)
939	Rexcaden Jazper Shu	Active (Grace Period)
942	Elaine Viandi	Active
945	Angeline Felice Theo	Active
947	Nayyara Ayaskara Prakasita	Active
948	Erick Winner Teo	Active
950	Audrey Madison Loewe	Active
951	Mavin Jericho Phen	Active
955	Naomi Grace Edward	Active
956	Aileen Sophie Kesuma	Active
962	Ananda Putera Ngadiman	Active
963	Yasmina Athirah Rifqi	Active
964	Yazeed Abizar Rifqi	Active
965	Modric Agusta Daruma	Active
968	Lady Valery Sinambela	Active
970	Annabela Himeko Winarta	Active
980	Ezio Lim	Active
981	Joey Milan Phen	Active
982	Abigail Hazel Tamin	Active
986	Jason Allen Tjoa	Active
987	Caren Pandiago	Active
988	Gavyn Wijaya	Active
989	Federico Fredelyn Jeoh	Active
990	Zason Riady Ko	Active
991	Arya Kho	Active
992	James Ananda Wijaya	Active
995	Qori Putri Syahviah	Active
996	Venesia Anggini Purba	Active
997	Jovin Limcoln	Active
998	Fedrick Wijaya	Active
999	Annabelle Grace Wu	Active
1003	Arthur Alexander Hakim	Active
1007	Davina Grace Ong	Active
1008	Sydney Princessa Lim	Active
1009	Felicia Grace Ong	Active
1010	Gracielle Grace Ong	Active
1012	Clarence Aurelia Colim	Active (Grace Period)
1015	Fransisca	Active
1017	Harvardo Lovenzo Susanto	Active
1019	Louis Clinton Chai	Active
1020	Caren Axella Natania Lumbantoruan	Active
1022	Efraim Lucas Dimitri	Active
1023	Darryl Raynold Leowe	Active
1024	Chloe Audrey Chen	Active
1025	Hermione Lovely Susanto	Active
1027	Elnino Jehanra Saragih	Active
1028	Darren Winston	Active
1029	Luna Antoinette Linne	Active
1030	Valerie Rosalyn Yap	Active
1031	Jacques Lewinsky	Active
1033	Shelvina Howie	Active
1034	Cherryl Riquelme Potan	Active
1037	Caitlyn Allison Yaphen	Active
1038	Devon Jau	Active
1039	Naafa Maisyva Ginting	Active
1040	Shane Anastasya Kristy Simangunsong	Active
1041	Chloe Taydey	Active
1043	Kenrich Thantio Yangderson	Active
1044	Dominic Kie	Active
1045	Silvario Soedidjo	Active
1047	Jordan Tanutama	Active
1049	Rafael Maximillian Sitorus	Active
1050	Galang Roland Besch	Active
1051	Timothy Anwi Panca	Active
1053	Elaine Clemence Annabell	Active
1056	Yeslin Yap	Active
1057	Louis Xavier Leonardi	Active
1058	Gracia Tiffany Susanto	Active
1059	Meuthia Gadiza	Active
1060	Zac Aldrich Mayor	Active
1061	Kayden Skylar Sanso	Active
1062	Queensya Lovely Reya	Active
1065	Maxwell Louis Jaya	Active
1066	Samuel Christopher Halim	Active (Grace Period)
1067	Richester Casvio Liong	Active
1071	Chloe Aurelia Ten	Active
1072	Hazel Natalie Ten	Active
1073	Scarlett Avery Ten	Active (Grace Period)
1074	Ayska Najya Prakasita	Active
1075	Bryan Michael Ng	Active
1076	Brayden Matthew Ng	Active
1077	Alqueenza Syifa Winona	Active
1078	Ethan Kenny Daruma	Active
1079	Keigo Kusuno Soh	Active
1080	Reynara Amber Koiman	Active
1081	Carlton Kho	Active
1083	Gillian Alexa Pearl	Active (Grace Period)
1084	Leonard Nyoto	Active (Grace Period)
1085	Garent Nyoto	Active (Grace Period)
1086	Kayden Ethan Zhou	Active
1088	Alesha Sofia Andhika	Active
1089	Jessica Jo	Active
1090	Healey Tjoe	Active
1093	Annastasia Hideko Winarta	Active
1096	Maxwell Kenson Wibisono	Active
1097	Reia Rose Winfield	Active
1098	Naia Sydney Winfield	Active
1101	Fredella Alexa Maranggi Siregar	Active
1102	Adhyasta William Nugroho	Active
1103	Nicholas Tjin	Active
1104	Abbygael Mikaela Tangelyn	Active
1105	Keiko Aiby Lim	Active
1106	Vierra Cleevany Ryu	Active
1111	Howie Leonard Wijaya	Active (Grace Period)
1113	Joe Benedict Japto	Active
1114	James Tjoa	Active (Grace Period)
1115	Reagan Oliver Zhuang	Active
1116	Kim Megumi	Active (Grace Period)
1117	Claire Gabrielle Oscar	Active
1119	Andrea Dimitri Ashraafi Lazzaroni	Active (Grace Period)
1120	Reynand Wijaya	Active
1121	Liam John Rickson	Active
1122	Leeanne Jane Lim	Active
1123	Joequinn Felysse Warsono	Active
1124	Felicia Liangso	Active
1125	Grace Anastasia Zeng	Active
1127	Edric Luiz Ongka	Active
1128	Lashira Awbinsriee Pane	Active
1129	Stephanie Evelyn Luo	Active
1130	Ethan Ray Maxwell	Active
1131	Vinxiero Carrick Francoiz	Active
1132	Nicole Lee	Active
1133	Natalie Willeen Zhang	Active
1134	Kent Nanda Daruma	Active
1135	Cherysse Auryn Khobert	Active
1137	Celine Angeline Yiandri	Active
1138	Mike Louis Wijaya	Active
1139	Wilbert Wijaya	Active
1140	Keita Raelyn Deng	Active
1141	Joyce Nathania Shen	Active (Grace Period)
1142	Oscar Linwood	Active
1143	Rico Alvaro Chandra	Active
1144	Kayla Shilyn Gani	Active
1145	Gallen Yuman King	Active
1146	Charis Yafa Tobing	Active
1147	Calista Kasih Aprilia Harahap	Active
1148	Talysha Sri Nayla	Active
1149	Arnold Alexander Hakim	Active
1150	Kellyn Chandra	Active
1151	Theona Zefanya Purba	Active
1152	Javerson Joshua Tobing	Active
1153	Philippe Benedict Zhuang	Active
1154	Aca Raymond Tjemerlang	Active
1155	Howard Winston Louis	Active
1161	Randa Miracle Boasly Sihombing	Active
1164	Felicia Ivana Silalahi	Active
70100004	Maryam Shareen Anandifa	Active
70100005	Lyvia Verlynn	Active
70100019	Andrea Tabitha Florencia Simatupang	Active
70100020	Diandra Ezra Nauli Simatupang	Active
70100023	Evonne Gwen Lim	Active
70100027	Daniel Goh	Active
70100028	Elaine Gwen Lim	Active
70100037	Abigail Rhea Lim	Active
70100041	Raisha Adila Gunawan	Active
70100042	Jessica Sharon	Active
70100046	Kirania Inara Azalea	Active
70100047	Keyzia Faiana Daulay	Active
70100051	Enzo Howell	Active
70100052	Darrel Hizkia Tambunan	Active
70100059	Rebecca Florencia Siregar	Active
70100060	Lincoln Blaine	Active
70100061	Colleen Blaine	Active
70100062	Nichole Hasan	Active
70100063	Calysta Celorine Bakara	Active
70100064	Rachel Nathania Situmorang	Active
70100068	Radinka Agra Sitepu	Active
70100070	Keysha Kania Ramaditya	Active
70100071	Muhammad Al Khawarizmi Fairel	Active
70100075	Maro Louis Dear Purba	Active
70100076	Marwa Alya Sakinah Rangkuti	Active
70100077	Aldiana Masha Lovelia Br Sembiring	Active
70100078	Sakina Alima Regune Harahap	Active
70100080	Dewi Syaahira Sabina Siregar	Active
70100086	Maria Graciana Chica Purba	Active
70100090	Annisa Letizia Shanum	Active
70100098	Erland Sohilida Laia	Active
70100102	Bryan Taslim	Active (Grace Period)
70100106	Dareen Davinci Ginting	Active
70100112	Fathi Arkan Wiyatmika	Active
70100113	Jiselle Hartanto	Active
70100117	Akhdan Arief Athaya	Active
70100118	Cladys Nadine Frietania	Active (Grace Period)
70100121	Shane Anthony Jawson	Active
70100122	Shadrina Azheema Lubis	Active
70100123	Shafiqa Adeeva Lubis	Active
70100126	Berliando Lovely Sihombing	Active (Grace Period)
70100127	Gabriel Ihut Martuaro Sihombing	Active
70100128	Syia Kim	Active (Grace Period)
70100130	Muhammad Rafa Al Siena	Active
70100131	Clairine Bellvania Gavrila Ginting	Active (Grace Period)
70100133	Lionel Maverick	Active
70100134	Diandra Santika	Active
70100135	Adib Nufal Wibowo	Active
70100136	Syakirah Khairani Jamilah	Active
70100139	Daniella Demeintieva	Active
70100140	Gabriella Theofanny Putri Meliala	Active
70100143	Kaleb Edgar Goel Hasugian	Active
70100144	Faqih Fadhilah Wijaya	Active
70100145	Hafiqa Raikhsa Karo Karo	Active
70100146	Alexa Brianna Tambunan	Active
70100147	Faza Kiyana Azdah	Active
70100148	Davina Elisha Ginting	Active
70100149	Jaeson Nathan Yap	Active
70100150	Nadhira Calista Purba	Active
70100151	Fakhira Idris Harahap	Active
70100152	Abigail Carissa	Active
70100153	Dareen Azel Matthew Sembiring	Active
70100154	Ashera Natama Sitorus	Active
70100155	Stella Aprilia Sianipar	Active
70100156	Tengku Muhammad Malik Al Fatih	Active
70100157	Faqhan Asshadiq Winata	Active
70100158	Gracelyn Patricia	Active
70100159	Nadia Fathaniah Chandra	Active
70100160	Jordan Noel Yap	Active
70100161	Khezya Queen Zareen Br Panggabean	Active
70100162	Arya Satya	Active
90100001	Rowan Maverick Ang	Active
90100002	Giselle Liandy	Active
90100004	Jeovenna Cangie	Active
90100005	Felynn Holy Richson	Active
90100007	Carrick Classico	Active
90100010	Chloe Marjorie Wen	Active
90100011	Chloe Quisha Anggara	Active
90100013	Candice Julian Sakiwa	Active
90100020	Winston Hubert	Active
90100021	Aidan	Active
90100022	Jeanice Wu	Active
90100024	Welceline Charissa Tsjin	Active
90100035	Carlen Edeline Br. Keliat	Active
90100036	Carlos Ferdinand Putra	Active
90100039	Reynard Alderich Guntur	Active
90100042	Justin Nawi	Active
90100043	Valentino Owen Liu	Active
90100044	Velove Alexa Winstan	Active
90100045	David Howard	Active
90100046	Hugo Maximus Ling	Active
90100047	Bryant Maximus Ling	Active
90100049	Harvey Susanto	Active
90100055	Felicia Tham	Active
90100056	Thalissha Yeonan	Active
90100060	Alfred Smaver Tanasal	Active
90100061	Elaine Gabriella Chandella	Active
90100064	Olson Arfayo	Active
90100066	Celine Oubre	Active
90100067	Victor Alexander Winstan	Active
90100068	Ixchel Lowell Tankiono	Active
90100070	Jack Austin Sia	Active
90100074	Faulina Theresia Pangaribuan	Active
90100075	Kingsley Alisson Tenang	Active
90100079	Gracella Cangie	Active
90100080	Vanessa Cangie	Active
90100081	Hayden Fredderick Halim	Active
90100082	Tang En Xin	Active
90100083	Filbert Laithen	Active
90100086	Eric Williarn	Active
90100087	Finn Maxwell	Active
90100088	Khairiy Raka Azizi Hermansyah	Active
90100089	Alvyn Zhu	Active
90100090	Alfarizy Raqila Hermansyah	Active
90100093	Jesslyn Lee	Active
90100094	Feliks Ananda Lee	Active
90100097	Annabel Audriana	Active
90100099	Rowan Tirta Lee	Active
90100100	Jasmine Zhang	Active
90100101	Jayden Zhang	Active
90100102	Chloe Marche Khu	Active
90100103	Claire Eugenia Khu	Active
90100104	Hannah Sophia Salim	Active
90100107	Stoffel Swandeez Angkasa	Active
90100108	Vergio Gavino Chaikoff	Active
90100109	Jolin Thianda	Active
90100112	Richie Alvaro Tandinata	Active
90100113	Reynard Shendior	Active
90100114	Kate Elizabeth Huang	Active
90100115	William Lauda	Active
90100116	Janessa Hofang	Active
90100117	Jarell Hofang	Active
90100118	Jesslyn Hofang	Active
90100120	Jocelyn Sydney	Active
90100122	Tiffany Toh	Active
90100123	Trevor Toh	Active
90100127	Davin Bradford	Active
90100128	Dustin Bradley	Active
90100129	Jasmine Ryana Ngadimin	Active
90100130	Maurice Claire Genevieve	Active
90100131	Gillian Natalie Wilfred	Active
90100132	Louis Adrian	Active
90100133	Josh Andrew	Active
90100134	Rodrick Stefano Halim	Active
90100135	Rainie Lynn	Active
90100136	Miho Qanitah Sihombing	Active
90100137	Keiko Hanara Sihombing	Active (Grace Period)
90100138	Vyon Wynter Huang	Active
90100139	Mikayla Seline Wu	Active (Grace Period)
90100140	Jadellyne Gretchenagatha Zhuotio	Active
90100143	Jason Lewis Theo	Active
90100144	Vincenzo	Active
90100148	Kei Evander Buhari	Active
90100153	Ethan Putra Gotama	Active
90100154	Emmeline Aurelia Lie	Active
90100155	Nathan Archie Gunawan	Active
90100156	Nicole Anastasia	Active
90100160	Klarissa Evania Buhari	Active
90100161	Harvey Taufik	Active (Grace Period)
90100163	Videline Gillian Chaikoff	Active (Grace Period)
90100164	Jarred Eldridge Tantama	Active
90100166	Reinz Stythan	Active
90100167	Alicia Quinn chandranata	Active (Grace Period)
90100168	Madelyn Henryetta Fang	Active
90100169	Eleora Iskandar Liunardi	Active
90100170	Viyona Gavriela Muis	Active
90100171	Eileen Yui Chen	Active
90100173	Jeneiro	Active
90100174	Otto Valerino Lim	Active
90100175	Jovan Leonard Lui	Active
90100176	Rahma Nakita Afifah	Active
90100177	Dominica Cherish Sheiramoth	Active
90100178	MIRACLE HUANG	Active
90100179	Emily moraine hakim	Active
90100180	Jayden jiefferson	Active
90100182	MAXWELL TENAR	Active
90100183	Heinz victorio zhou	Active
90100185	Natasha Clairine Wu	Active
90100186	Samantha Clairine Wu	Active
90100188	Rebecca kelly ashari	Active
90100189	Abigail avery ashari	Active
90100190	Daphne Nathania Ang	Active
90100191	Bosco Lim	Active
90100192	Jayden Jingga	Active
90100193	Tyra Louise Tohnika	Active
90100194	Tyler Howard Tohnika	Active (Grace Period)
90100195	Sarah Oktorela Sitorus	Active
90100196	Jordan Philip Wihono	Active
90100197	Jeffrey Yap	Active
90100198	Jordan Swiss Cliftan	Active
90100200	Galent hansen wuner	Active
90100206	Metta Louise ellen	Active
90100208	Patricia	Active
90100209	George	Active
90100211	Callista Aurelia alven	Active
90100214	Louis kendrick	Active
`;

async function syncTrainees() {
  try {
    console.log('🔄 Backing up current dashboard_trainne table...');
    const backupResult = await db.query('SELECT * FROM dashboard_trainne');
    const backupPath = path.join(__dirname, 'trainee_backup_before_cleanup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backupResult.rows, null, 2), 'utf8');
    console.log(`✅ Backup successfully saved to: ${backupPath}`);

    // Parse raw text input
    const parsedTrainees = [];
    const lines = rawText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Match ID (digits), followed by spaces/tabs, followed by Name (anything in between), followed by Status (Active or Active (Grace Period))
      const match = trimmed.match(/^(\d+)\s+(.+?)\s+(Active(?:\s*\(Grace Period\))?)$/);
      if (match) {
        parsedTrainees.push({
          id: match[1],
          name: match[2],
          status: match[3]
        });
      } else {
        console.warn(`⚠️ Could not parse line: "${trimmed}"`);
      }
    }

    console.log(`📋 Parsed ${parsedTrainees.length} trainees from the list.`);
    const parsedIds = parsedTrainees.map(t => t.id);

    // Delete any trainee whose ID is not in the parsed list
    console.log('🗑️ Deleting trainees not in the list...');
    const deleteResult = await db.query(
      'DELETE FROM dashboard_trainne WHERE id NOT IN (SELECT unnest($1::varchar[]))',
      [parsedIds]
    );
    console.log(`✅ Deleted ${deleteResult.rowCount} trainees not in the list.`);

    // Upsert the parsed trainees and set phone/password to NULL
    console.log('🔄 Syncing, inserting new, and clearing phone/password for matched trainees...');
    let updatedCount = 0;
    let insertedCount = 0;

    for (const trainee of parsedTrainees) {
      // Check if trainee exists
      const check = await db.query('SELECT id FROM dashboard_trainne WHERE id = $1', [trainee.id]);
      if (check.rows.length > 0) {
        // Update: set phone/password to NULL and ensure name/status are synced
        await db.query(`
          UPDATE dashboard_trainne
          SET trainee_name = $1, status = $2, phone = NULL, password = NULL
          WHERE id = $3
        `, [trainee.name, trainee.status, trainee.id]);
        updatedCount++;
      } else {
        // Insert new
        await db.query(`
          INSERT INTO dashboard_trainne (id, trainee_name, status, phone, password)
          VALUES ($1, $2, $3, NULL, NULL)
        `, [trainee.id, trainee.name, trainee.status]);
        insertedCount++;
      }
    }

    console.log(`✅ Database synced successfully!`);
    console.log(`   - Trainees updated (phone, password cleared): ${updatedCount}`);
    console.log(`   - New trainees inserted: ${insertedCount}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing trainees:', err);
    process.exit(1);
  }
}

syncTrainees();
