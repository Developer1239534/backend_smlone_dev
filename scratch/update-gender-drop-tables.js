require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Raw data provided by the user
const rawTraineeData = `
27	Valerie Legolas Cen	Female
45	Aaron Goldwin Semarak	Male
48	Justin Maxwell	Male
49	Richmond Osyan Sudilan	Male
50	Kenichi Zhou	Male
60	Sharleen Velicia Lim	Female
125	Jayxen Maxwell	Male
136	Claudine Joshanley	Female
141	Russell William Tanner	Male
149	Elaine Velicia	Female
249	Emily Santo	Female
255	Denzel Geraldo Wijaya	Male
269	Fresia Victoria Chendry	Female
274	Candice Winardi Wong	Female
285	Clairine Joshanley	Female
301	Chloe Zhou	Female
329	Vrederick Benaricco Tanjaya	Male
333	Jasmine Yenarti	Female
368	Felice Vallerie Angkasa	Female
375	Darren Gabriel	Male
410	Dyra Muntazsirah	Female
429	Charrelle Anthony	Female
440	Sofia Grace Wu	Female
442	Beatrys Vanesa Moiras	Female
443	Candyce Valezka Moiras	Female
482	Reizo Kazuo Wong	Male
483	Jolie Huang	Female
490	Shane Ferrucio Lim	Male
528	Kiery Keionna Kie	Female
531	Max Chen	Male
532	Yasmin Fadhila Azzakiyah	Female
545	Brandon Chiang	Male
548	Fiona Candiof	Female
553	Florencia Hewi	Female
566	Jollyn Felicia Wong	Female
569	Josevin Carel H.	Male
574	Brandon Tiojaya	Male
575	Mandy Ellen Sanusi	Female
580	Vivienne Zheng	Female
581	Nicholas Zheng	Male
582	Ethan Aldrich Lie	Male
585	Harvey Wijaya	Male
586	Annabella Wijaya	Female
587	Enrico Victorian	Male
601	Mikaella Hutteleigh Ng	Female
602	Alexandra Joan Micheline	Female
604	Hugo Viandi	Male
613	Junior Auson Halim	Male
614	Rayden Chiang	Male
625	Audrey Hartono Lee	Female
629	Joey Frederica Ang	Female
631	Queency Joycelyn Yieginia	Female
633	Fiona Jolys Chong	Female
636	Zia Arafa Khairina	Female
638	Chloe Olivia Ruslie	Female
639	Bianca Olivia Ruslie	Female
651	Ashley Claire Lorence	Female
654	Rayden Oh	Male
665	Khoo Shu Han	Female
670	Christian Anderson Lee	Male
673	Nathan Immanuel Winanto	Male
675	Maxen Zo Leon	Male
676	Grace Alexandra	Female
679	Fiorenza Eleanor Wijaya	Female
680	Gracelyn Yap	Female
683	Stanley Ace Lorence	Male
686	Owen Linwood	Male
704	Morgan Valentino Lowis	Male
707	Samho Gunawan	Male
709	Winston Lawrence	Male
716	Chloe Vallerie Jie	Female
717	Dmitri Meddef Njo	Male
719	Davar Aly Harahap	Male
726	Renzo Tanaka	Male
735	Kenward Melvern Djohan	Male
736	Kendrick Melvern Djohan	Male
738	Adeline Njo	Female
739	Zoefiker Putera Ngadiman	Male
740	Aubree Lisman	Female
741	Brayden Lisman	Male
745	Jesslyn	Female
751	Howie Chan	Male
754	Reagan Khei Subroto	Male
759	Warren Emanuel	Female
761	Richelle Zheng	Female
763	Safira Reynia Hanum	Female
767	Theodore Joachim Wihardjo	Male
768	Josh Seravino Zhang	Male
779	Jayden Tarmidi	Male
783	Evelynn Lee	Female
784	Garrix Ardent Putra	Male
785	Kelly Alyse Tanary	Female
790	Hardey Moeldoko Law	Male
801	Hillary Calista Tamado Panjaitan	Female
803	Lovea Fendy Kho	Female
806	Efrata Iskandar Liunardi	Female
809	Emilia Niko Nyoman	Female
811	Arthur Floyd Salim	Male
819	Maria Jill Lumbantoruan	Female
822	Clarissa Olivia Anne Lammora Panjaitan	Female
835	Finn Aldrich Luman	Male
836	Kent Arthur Luman	Male
837	Clairine Angela Indrajaya	Female
838	Louis Harvey Soesanto	Male
842	Ethan Moeritz	Male
845	Wallace Evencio	Male
850	Karin Destynsia	Female
852	Cellistia Cangdiago	Female
855	Cayden Louis Auwrich	Male
857	Hogan Chan	Male
858	Delmond Osyan Sudilan	Male
859	Clarissa Kho	Female
863	Bonita Gaudeti Sinaga	Female
865	Victoria Yap	Female
866	Carlsen Simen	Male
867	Cherlyn Simen	Female
868	Sergio Garcia Ang	Male
872	Kenneth Samuel Lim	Male
874	Muhammad Rafli Arkan	Male
875	Clarissa Fredelyn Jeoh	Female
876	Jacqueline Vallerie Chen	Female
880	Joel Edward	Male
883	Joanne Lynch	Female
887	Filia Cielo Lim	Female
889	Madelyn Odelia Lowis	Female
896	Nicolas Carlie Kuwira	Male
897	Valerie Ivana Chen	Female
898	Ricson Stanlay	Male
902	Malcolm	Male
903	Harvey Oliver Lee	Male
904	Callista Aurelia Tasma	Female
909	Keona Jaileynn Lawrence	Female
910	Michael Thamida	Male
911	Meivellynn Thamida	Female
913	Roselie Kirana Wijaya	Female
914	Leia Kaytlyn Tioe	Female
922	Victoria Cenata	Female
927	Richela Stanlay	Female
929	Trevor Hartono Lee	Male
932	Olivia Tjoa	Female
933	Ivy Jeane Chanella	Female
935	Gisella Nyoto	Female
937	Jillian Claire Kuanrius	Female
938	Reagan Nyoto	Male
939	Rexcaden Jazper Shu	Male
942	Elaine Viandi	Female
945	Angeline Felice Theo	Female
947	Nayyara Ayaskara Prakasita	Female
948	Erick Winner Teo	Male
950	Audrey Madison Loewe	Female
951	Mavin Jericho Phen	Male
955	Naomi Grace Edward	Female
956	Aileen Sophie Kesuma	Female
962	Ananda Putera Ngadiman	Male
963	Yasmina Athirah Rifqi	Female
964	Yazeed Abizar Rifqi	Male
965	Modric Agusta Daruma	Male
968	Lady Valery Sinambela	Female
970	Annabela Himeko Winarta	Female
980	Ezio Lim	Male
981	Joey Milan Phen	Female
982	Abigail Hazel Tamin	Female
986	Jason Allen Tjoa	Male
987	Caren Pandiago	Female
988	Gavyn Wijaya	Male
989	Federico Fredelyn Jeoh	Male
990	Zason Riady Ko	Male
991	Arya Kho	Male
992	James Ananda Wijaya	Male
994	Valisha Sofi Tjandra	Female
995	Qori Putri Syahviah	Female
996	Venesia Anggini Purba	Female
997	Jovin Limcoln	Male
998	Fedrick Wijaya	Male
999	Annabelle Grace Wu	Female
1003	Arthur Alexander Hakim	Male
1007	Davina Grace Ong	Female
1008	Sydney Princessa Lim	Female
1009	Felicia Grace Ong	Female
1010	Gracielle Grace Ong	Female
1012	Clarence Aurelia Colim	Female
1015	Fransisca	Female
1017	Harvardo Lovenzo Susanto	Male
1019	Louis Clinton Chai	Male
1020	Caren Axella Natania Lumbantoruan	Female
1022	Efraim Lucas Dimitri	Male
1023	Darryl Raynold Leowe	Male
1024	Chloe Audrey Chen	Female
1025	Hermione Lovely Susanto	Female
1027	Elnino Jehanra Saragih	Male
1027	Elnino Jehanra Saragih	Male
1028	Darren Winston	Male
1029	Luna Antoinette Linne	Female
1030	Valerie Rosalyn Yap	Female
1031	Jacques Lewinsky	Male
1033	Shelvina Howie	Female
1034	Cherryl Riquelme Potan	Female
1037	Caitlyn Allison Yaphen	Female
1038	Devon Jau	Female
1039	Naafa Maisyva Ginting	Female
1040	Shane Anastasya Kristy Simangunsong	Female
1041	Chloe Taydey	Female
1043	Kenrich Thantio Yangderson	Male
1044	Dominic Kie	Male
1045	Silvario Soedidjo	Male
1047	Jordan Tanutama	Male
1049	Rafael Maximillian Sitorus	Female
1050	Galang Roland Besch	Female
1051	Timothy Anwi Panca	Male
1053	Elaine Clemence Annabell	Female
1056	Yeslin Yap	Female
1057	Louis Xavier Leonardi	Male
1058	Gracia Tiffany Susanto	Female
1059	Meuthia Gadiza	Female
1060	Zac Aldrich Mayor	Male
1061	Kayden Skylar Sanso	Male
1062	Queensya Lovely Reya	Female
1065	Maxwell Louis Jaya	Male
1066	Samuel Christopher Halim	Male
1067	Richester Casvio Liong	Male
1071	Chloe Aurelia Ten	Female
1072	Hazel Natalie Ten	Female
1073	Scarlett Avery Ten	Female
1074	Ayska Najya Prakasita	Female
1075	Bryan Michael Ng	Male
1076	Brayden Matthew Ng	Male
1077	Alqueenza Syifa Winona	Female
1078	Ethan Kenny Daruma	Male
1079	Keigo Kusuno Soh	Male
1080	Reynara Amber Koiman	Female
1081	Carlton Kho	Male
1083	Gillian Alexa Pearl	Female
1084	Leonard Nyoto	Male
1085	Garent Nyoto	Male
1086	Kayden Ethan Zhou	Male
1088	Alesha Sofia Andhika	Female
1089	Jessica Jo	Female
1090	Healey Tjoe	Female
1093	Annastasia Hideko Winarta	Female
1096	Maxwell Kenson Wibisono	Male
1097	Reia Rose Winfield	Female
1098	Naia Sydney Winfield	Female
1101	Fredella Alexa Maranggi Siregar	Female
1102	Adhyasta William Nugroho	Male
1103	Nicholas Tjin	Male
1104	Abbygael Mikaela Tangelyn	Female
1105	Keiko Aiby Lim	Female
1106	Vierra Cleevany Ryu	Female
1107	Gwyneth Louisa Yap	Female
1113	Joe Benedict Japto	Male
1114	James Tjoa	Male
1115	Reagan Oliver Zhuang	Male
1116	Kim Megumi	Female
1117	Claire Gabrielle Oscar	Female
1119	Andrea Dimitri Ashraafi Lazzaroni	Male
1120	Reynand Wijaya	Male
1121	Liam John Rickson	Male
1122	Leeanne Jane Lim	Female
1123	Joequinn Felysse Warsono	Female
1124	Felicia Liangso	Female
1125	Grace Anastasia Zeng	Female
1127	Edric Luiz Ongka	Male
1128	Lashira Awbinsriee Pane	Female
1129	Stephanie Evelyn Luo	Female
1130	Ethan Ray Maxwell	Male
1131	Vinxiero Carrick Francoiz	Male
1132	Nicole Lee	Female
1133	Natalie Willeen Zhang	Female
1134	Kent Nanda Daruma	Male
1135	Cherysse Auryn Khobert	Female
1137	Celine Angeline Yiandri	Female
1138	Mike Louis Wijaya	Male
1139	Wilbert Wijaya	Male
1140	Keita Raelyn Deng	Female
1141	Joyce Nathania Shen	Female
1142	Oscar Linwood	Male
1143	Rico Alvaro Chandra	Male
1144	Kayla Shilyn Gani	Female
1145	Gallen Yuman King	Male
1146	Charis Yafa Tobing	Female
1147	Calista Kasih Aprilia Harahap	Female
1148	Talysha Sri Nayla	Female
1149	Arnold Alexander Hakim	Male
1150	Kellyn Chandra	Female
1151	Theona Zefanya Purba	Female
1152	Javerson Joshua Tobing	Female
1153	Philippe Benedict Zhuang	Male
1154	Aca Raymond Tjemerlang	Male
1155	Howard Winston Louis	Male
1156	Alika Zelmira Wibowo	Female
1157	Gywen Stefanie Wiley	Female
1158	Kendrick Eoghan	Male
1161	Randa Miracle Boasly Sihombing	Male
1162	Carine Susanto Lie	Female
1164	Felicia Ivana Silalahi	Female
1167	Fredericka Sigalingging	Female
70100004	Maryam Shareen Anandifa	Female
70100005	Lyvia Verlynn	Female
70100019	Andrea Tabitha Florencia Simatupang	Female
70100020	Diandra Ezra Nauli Simatupang	Female
70100023	Evonne Gwen Lim	Female
70100027	Daniel Goh	Male
70100028	Elaine Gwen Lim	Female
70100037	Abigail Rhea Lim	Female
70100041	Raisha Adila Gunawan	Female
70100042	Jessica Sharon	Female
70100046	Kirania Inara Azalea	Female
70100047	Keyzia Faiana Daulay	Female
70100051	Enzo Howell	Male
70100052	Darrel Hizkia Tambunan	Male
70100059	Rebecca Florencia Siregar	Female
70100060	Lincoln Blaine	Male
70100061	Colleen Blaine	Female
70100062	Nichole Hasan	Female
70100063	Calysta Celorine Bakara	Female
70100064	Rachel Nathania Situmorang	Female
70100068	Radinka Agra Sitepu	Male
70100070	Keysha Kania Ramaditya	Female
70100071	Muhammad Al Khawarizmi Fairel	Male
70100075	Maro Louis Dear Purba	Male
70100076	Marwa Alya Sakinah Rangkuti	Female
70100077	Aldiana Masha Lovelia Br Sembiring	Female
70100078	Sakina Alima Regune Harahap	Female
70100080	Dewi Syaahira Sabina Siregar	Female
70100086	Maria Graciana Chica Purba	Female
70100090	Annisa Letizia Shanum	Female
70100098	Erland Sohilida Laia	Male
70100102	Bryan Taslim	Male
70100104	Danisha Ozza Aurellia. S 	Female
70100106	Dareen Davinci Ginting	Male
70100112	Fathi Arkan Wiyatmika	Male
70100113	Jiselle Hartanto	Female
70100117	Akhdan Arief Athaya	Male
70100118	Cladys Nadine Frietania	Female
70100121	Shane Anthony Jawson	Male
70100122	Shadrina Azheema Lubis	Female
70100123	Shafiqa Adeeva Lubis	Female
70100126	Berliando Lovely Sihombing	Female
70100127	Gabriel Ihut Martuaro Sihombing	Male
70100130	Muhammad Rafa Al Siena	Male
70100131	Clairine Bellvania Gavrila Ginting	Female
70100133	Lionel Maverick 	Male
70100134	Diandra Santika	Female
70100135	Adib Nufal Wibowo	Male
70100136	Syakirah Khairani Jamilah	Female
70100139	Daniella Demeintieva	Female
70100140	Gabriella Theofanny Putri Meliala	Female
70100143	Kaleb Edgar Goel Hasugian	Male
70100144	Faqih Fadhilah Wijaya	Male
70100145	Hafiqa Raikhsa Karo Karo	Female
70100146	Alexa Brianna Tambunan	Female
70100147	Faza Kiyana Azdah	Female
70100148	Davina Elisha Ginting	Female
70100149	Jaeson Nathan Yap	Male
70100150	Nadhira Calista Purba	Female
70100151	Fakhira Idris Harahap	Female
70100152	Abigail Carissa 	Female
70100153	Dareen Azel Matthew Sembiring	Male
70100154	Ashera Natama Sitorus	Female
70100155	Stella Aprilia Sianipar 	Female
70100156	Tengku Muhammad Malik Al Fatih	Male
70100157	Faqhan Asshadiq Winata	Male
70100158	Gracelyn Patricia	Female
70100159	Nadia Fathaniah Chandra	Female
70100160	Jordan Noel Yap	Male
70100161	Khezya Queen Zareen Br Panggabean 	Female
70100162	Arya Satya	Male
70100173	Muhammad Naufal Athariz Ritonga	Male
70100174	Jerrick Onggoro Hakim	Male
90100001	Rowan Maverick Ang	Male
90100002	Giselle Liandy	Female
90100004	Jeovenna Cangie	Female
90100005	Felynn Holy Richson	Female
90100007	Carrick Classico	Male
90100010	Chloe Marjorie Wen	Female
90100011	Chloe Quisha Anggara	Female
90100013	Candice Julian Sakiwa	Female
90100020	Winston Hubert	Male
90100020	Winston Hubert	Male
90100021	Aidan Benjamin Yapar	Male
90100022	Jeanice Wu	Female
90100024	Welceline Charissa Tsjin	Female
90100035	Carlen Edeline Br. Keliat	Female
90100036	Carlos Ferdinand Putra	Male
90100039	Reynard Alderich Guntur	Male
90100042	Justin Nawi	Male
90100043	Valentino Owen Liu	Male
90100044	Velove Alexa Winstan	Female
90100045	David Howard	Male
90100046	Hugo Maximus Ling	Male
90100047	Bryant Maximus Ling	Male
90100049	Harvey Susanto	Male
90100055	Felicia Tham	Female
90100056	Thalissha Yeonan	Female
90100060	Alfred Smaver Tanasal	Male
90100061	Elaine Gabriella Chandella	Female
90100064	Olson Arfayo	Male
90100066	Celine Oubre	Female
90100067	Victor Alexander Winstan	Male
90100068	Ixchel Lowell Tankiono	Female
90100070	Jack Austin Sia	Male
90100074	Faulina Theresia Pangaribuan	Female
90100075	Kingsley Alisson Tenang	Male
90100079	Gracella Cangie	Female
90100080	Vanessa Cangie	Female
90100081	Hayden Fredderick Halim	Male
90100082	Tang En Xin	Female
90100083	Filbert Laithen	Male
90100086	Eric Williarn	Male
90100087	Finn Maxwell	Male
90100088	Khairiy Raka Azizi Hermansyah	Male
90100089	Alvyn Zhu	Male
90100090	Alfarizy Raqila Hermansyah	Male
90100093	Jesslyn Lee	Female
90100094	Feliks Ananda Lee	Male
90100097	Annabel Audriana	Female
90100099	Rowan Tirta Lee	Male
90100100	Jasmine Zhang	Female
90100101	Jayden Zhang	Male
90100102	Chloe Marche Khu	Female
90100103	Claire Eugenia Khu	Female
90100104	Hannah Sophia Salim	Female
90100107	Stoffel Swandeez Angkasa	Male
90100108	Vergio Gavino Chaikoff	Male
90100109	Jolin Thianda	Female
90100112	Richie Alvaro Tandinata	Male
90100113	Reynard Shendior	Male
90100114	Kate Elizabeth Huang	Female
90100115	William Lauda	Male
90100116	Janessa Hofang	Female
90100117	Jarell Hofang	Male
90100118	Jesslyn Hofang	Female
90100120	Jocelyn Sydney 	Female
90100122	Tiffany Toh	Female
90100123	Trevor Toh	Male
90100127	Davin Bradford	Male
90100128	Dustin Bradley	Male
90100129	Jasmine Ryana Ngadimin	Female
90100130	Maurice Claire Genevieve	Female
90100131	Gillian Natalie Wilfred	Female
90100132	Louis Adrian	Male
90100133	Josh Andrew	Male
90100134	Rodrick Stefano Halim	Male
90100135	Rainie Lynn	Female
90100136	Miho Qanitah Sihombing	Female
90100137	Keiko Hanara Sihombing	Female
90100138	Vyon Wynter Huang	Female
90100139	Mikayla Seline Wu	Female
90100140	Jadellyne Gretchenagatha Zhuotio	Female
90100143	Jason Lewis Theo	Male
90100144	Vincenzo	Male
90100148	Kei Evander Buhari 	Male
90100153	Ethan Putra Gotama	Male
90100154	Emmeline Aurelia Lie	Female
90100155	Nathan Archie Gunawan	Male
90100156	Nicole Anastasia	Female
90100160	Klarissa Evania Buhari 	Male
90100161	Harvey Taufik	Male
90100163	Videline Gillian Chaikoff	Female
90100164	Jarred Eldridge Tantama	Male
90100166	Reinz Stythan 	Male
90100167	Alicia Quinn chandranata	Female
90100168	Madelyn Henryetta Fang	Female
90100169	Eleora Iskandar Liunardi	Female
90100170	Viyona Gavriela Muis	Female
90100171	Eileen Yui Chen	Female
90100173	Jeneiro	Male
90100174	Otto Valerino Lim	Male
90100175	Jovan Leonard Lui	Male
90100176	Rahma Nakita Afifah	Female
90100177	Dominica Cherish Sheiramoth	Female
90100178	MIRACLE HUANG	Female
90100179	Emily moraine hakim	Female
90100180	Jayden jiefferson	Male
90100182	MAXWELL TENAR	Male
90100183	Heinz victorio zhou	Male
90100185	Natasha Clairine Wu	Female
90100186	Samantha Clairine Wu	Female
90100188	Rebecca kelly ashari	Female
90100189	Abigail avery ashari	Female
90100190	Daphne Nathania Ang	Female
90100191	Bosco Lim	Male
90100192	Jayden Jingga	Male
90100193	Tyra Louise Tohnika	Female
90100194	Tyler Howard Tohnika	Male
90100195	Sarah Oktorela Sitorus	Female
90100196	Jordan Philip Wihono	Male
90100197	Jeffrey Yap	Male
90100198	Jordan Swiss Cliftan 	Male
90100200	Galent hansen wuner	Male
90100206	Metta Louise ellen	Female
90100208	Patricia	Female
90100209	George 	Male
90100211	Callista Aurelia alven 	Female
90100214	Louis kendrick	Male
90100215	Phebe Lalita	Female
90100223	Feodora Meidy Leandra	Female
`;

async function main() {
  try {
    console.log('⚡ Starting Database Update...');

    // 1. Drop the quarterly_report tables
    console.log('🗑️ Dropping quarterly_report_1, quarterly_report_2, quarterly_report_3, quarterly_report_4 tables...');
    await pool.query(`
      DROP TABLE IF EXISTS 
        quarterly_report_1, 
        quarterly_report_2, 
        quarterly_report_3, 
        quarterly_report_4 
      CASCADE;
    `);
    console.log('✅ Tables dropped successfully.');

    // 2. Parse Trainee Data
    console.log('parsing trainee data...');
    const lines = rawTraineeData.trim().split('\n');
    const trainees = [];
    const seen = new Set();

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      
      const parts = cleanLine.split(/\t+/);
      if (parts.length < 3) {
        // Fallback for space separated or other delimiters
        const spaceParts = cleanLine.split(/\s{2,}/);
        if (spaceParts.length >= 3) {
          const id = spaceParts[0].trim();
          const name = spaceParts[1].trim();
          const gender = spaceParts[2].trim();
          const key = `${id}-${name}`;
          if (!seen.has(key)) {
            seen.add(key);
            trainees.push({ id, name, gender });
          }
        }
        continue;
      }
      
      const id = parts[0].trim();
      const name = parts[1].trim();
      const gender = parts[2].trim();
      
      const key = `${id}-${name}`;
      if (!seen.has(key)) {
        seen.add(key);
        trainees.push({ id, name, gender });
      }
    }

    console.log(`Parsed ${trainees.length} unique trainees for gender update.`);

    // 3. Update Genders in dashboard_trainne
    console.log('🔄 Updating genders in dashboard_trainne table...');
    let updatedCount = 0;
    const notFound = [];

    for (const t of trainees) {
      // Try to update matching both ID and Name
      const res = await pool.query(
        `UPDATE dashboard_trainne 
         SET gender = $1 
         WHERE TRIM(id) = TRIM($2) AND TRIM(trainee_name) = TRIM($3)`,
        [t.gender, t.id, t.name]
      );

      if (res.rowCount > 0) {
        updatedCount += res.rowCount;
      } else {
        // Fallback: Check if the ID exists but name is slightly different
        const checkId = await pool.query(
          'SELECT trainee_name, gender FROM dashboard_trainne WHERE TRIM(id) = TRIM($1)',
          [t.id]
        );
        if (checkId.rows.length > 0) {
          const dbName = checkId.rows[0].trainee_name;
          console.warn(`⚠️ Warning: ID ${t.id} matched but name differed. DB: "${dbName}", List: "${t.name}". Updating anyway...`);
          const forceUpdate = await pool.query(
            'UPDATE dashboard_trainne SET gender = $1 WHERE TRIM(id) = TRIM($2)',
            [t.gender, t.id]
          );
          updatedCount += forceUpdate.rowCount;
        } else {
          notFound.push(t);
        }
      }
    }

    console.log(`\n🎉 Database Update Complete!`);
    console.log(`✅ Successfully updated genders for ${updatedCount} trainees.`);
    if (notFound.length > 0) {
      console.log(`❌ Failed to find ${notFound.length} trainees in DB:`);
      for (const nf of notFound) {
        console.log(`   - ID: ${nf.id} | Name: ${nf.name} | Gender: ${nf.gender}`);
      }
    }

  } catch (error) {
    console.error('❌ Database migration error:', error);
  } finally {
    await pool.end();
  }
}

main();
