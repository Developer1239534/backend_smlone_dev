const db = require('../src/db/neonClient');

const rawData = `
27	L2. S.Project 8
45	L6. S.Project 1
48	L6. S.Project 2
49	L6. S.Project 5
50	L3. S.Project 10
60	L5. S.Project 10
125	L4. S.Project 3
136	L3. S.Project 10
141	L4. S.Project 10
149	L3. S.Project 8
249	L2. S.Project 3
255	L2. S.Project 7
269	L4. S.Project 10
274	L4. S.Project 10
285	L4. S.Project 10
301	L3. S.Project 9
329	L3. S.Project 10
333	L6. S.Project 2
368	L4. S.Project 10
375	L4. S.Project 9
410	L4. S.Project 10
429	L6. S.Project 6
440	L4. S.Project 10
442	L6. S.Project 1
443	L5. S.Project 2
482	L4. S.Project 5
483	L5. S.Project 6
490	L3. S.Project 8
528	L3. S.Project 2
531	L2. S.Project 6
532	L3. S.Project 5
545	L5. S.Project 9
548	L3. S.Project 9
553	L3. S.Project 9
566	L4. S.Project 10
569	L3. S.Project 10
574	L4. S.Project 1
575	L4. S.Project 10
580	L6. S.Project 6
581	L5. S.Project 8
582	L3. S.Project 9
585	L3. S.Project 10
586	L3. S.Project 10
587	L4. S.Project 2
601	L4. S.Project 6
602	L4. S.Project 2
604	L2. S.Project 10
613	L3. S.Project 5
614	L4. S.Project 1
625	L1. S.Project 4
629	L1. S.Project 3
631	L3. S.Project 7
633	L3. S.Project 9
636	L3. S.Project 8
638	L3. S.Project 7
639	L1. S.Project 8
651	L1. S.Project 5
654	L3. S.Project 5
665	L3. S.Project 6
670	L2. S.Project 10
673	L2. S.Project 8
675	L3. S.Project 9
676	L5. S.Project 1
679	L5. S.Project 3
680	L5. S.Project 6
683	L3. S.Project 10
686	L3. S.Project 3
704	L3. S.Project 6
707	L3. S.Project 4
709	L4. S.Project 5
716	L3. S.Project 3
717	L2. S.Project 2
719	L5. S.Project 10
726	L3. S.Project 10
735	L3. S.Project 6
736	L3. S.Project 6
738	L3. S.Project 7
739	L3. S.Project 4
740	L3. S.Project 10
741	L4. S.Project 2
745	L5. S.Project 10
751	L3. S.Project 10
754	L2. S.Project 9
759	L2. S.Project 10
761	L2. S.Project 10
763	L1. S.Project 8
767	L2. S.Project 10
768	L3. S.Project 7
779	L3. S.Project 1
783	L2. S.Project 10
784	L1. S.Project 8
785	L2. S.Project 10
790	L4. S.Project 8
801	L4. S.Project 9
803	L4. S.Project 10
806	L1. S.Project 7
809	L1. S.Project 5
811	L1. S.Project 8
819	L3. S.Project 4
822	L3. S.Project 10
835	L1. S.Project 5
836	
837	L1. S.Project 8
838	
842	L1. S.Project 7
845	L3. S.Project 10
850	L3. S.Project 8
852	L4. S.Project 10
855	L2. S.Project 10
857	L3. S.Project 7
858	L2. S.Project 8
859	L1. S.Project 4
863	L3. S.Project 8
865	L3. S.Project 8
866	L2. S.Project 6
867	L2. S.Project 8
868	L3. S.Project 8
872	L3. S.Project 9
874	L2. S.Project 6
875	L2. S.Project 8
876	L2. S.Project 10
880	L3. S.Project 2
883	L1. S.Project 8
887	L6. S.Project 8
889	L3. S.Project 10
896	L5. S.Project 2
897	L2. S.Project 8
898	
902	L2. S.Project 7
903	L1. S.Project 8
904	L3. S.Project 8
909	L2. S.Project 10
910	L2. S.Project 7
911	L2. S.Project 10
913	L2. S.Project 7
914	L1. S.Project 7
922	L2. S.Project 9
927	L2. S.Project 2
929	L2. S.Project 1
932	L2. S.Project 7
933	
935	L2. S.Project 7
937	L2. S.Project 6
938	L2. S.Project 8
939	L3. S.Project 1
942	L1. S.Project 8
945	L1. S.Project 6
947	L2. S.Project 7
948	L2. S.Project 10
950	L1. S.Project 6
951	L2. S.Project 4
955	L2. S.Project 6
956	L2. S.Project 5
962	L2. S.Project 1
963	L1. S.Project 8
964	L1. S.Project 6
965	L2. S.Project 7
968	L2. S.Project 2
970	L2. S.Project 3
980	L2. S.Project 3
981	L2. S.Project 7
982	L2. S.Project 1
986	L2. S.Project 5
987	L1. S.Project 8
988	L2. S.Project 6
989	L1. S.Project 8
990	
991	L1. S.Project 7
992	L1. S.Project 5
994	L1. S.Project 7
995	L2. S.Project 1
996	L1. S.Project 8
997	L2. S.Project 2
998	L1. S.Project 8
999	L2. S.Project 1
1003	L2. S.Project 3
1007	L2. S.Project 1
1008	L1. S.Project 8
1009	L1. S.Project 8
1010	L2. S.Project 1
1012	L1. S.Project 8
1015	L2. S.Project 4
1017	L2. S.Project 2
1019	L1. S.Project 8
1020	L2. S.Project 2
1022	L1. S.Project 6
1023	L1. S.Project 8
1024	
1025	L2. S.Project 4
1027	L2. S.Project 5
1027	L2. S.Project 5
1028	L1. S.Project 5
1029	L1. S.Project 8
1030	L1. S.Project 8
1031	L2. S.Project 1
1033	L2. S.Project 3
1034	L2. S.Project 2
1037	L2. S.Project 2
1038	L2. S.Project 4
1039	L2. S.Project 1
1040	L1. S.Project 8
1041	L2. S.Project 1
1043	
1044	L1. S.Project 8
1045	L2. S.Project 7
1047	L1. S.Project 8
1049	L1. S.Project 7
1050	L1. S.Project 8
1051	L2. S.Project 2
1053	L1. S.Project 8
1056	L1. S.Project 8
1057	L1. S.Project 6
1058	L2. S.Project 3
1059	L1. S.Project 8
1060	L1. S.Project 7
1061	
1062	L2. S.Project 3
1065	
1066	
1067	
1071	L2. S.Project 8
1072	L1. S.Project 8
1073	
1074	L1. S.Project 8
1075	L1. S.Project 8
1076	L1. S.Project 8
1077	L2. S.Project 1
1078	L1. S.Project 6
1079	L1. S.Project 4
1080	L1. S.Project 4
1081	L1. S.Project 6
1083	
1084	
1085	
1086	L1. S.Project 6
1088	L2. S.Project 2
1089	
1090	L1. S.Project 5
1093	
1096	
1097	
1098	
1101	L1. S.Project 4
1102	L1. S.Project 3
1103	L2. S.Project 4
1104	L1. S.Project 8
1105	
1106	L1. S.Project 5
1107	L1. S.Project 5
1113	
1114	
1115	
1116	L1. S.Project 7
1117	
1119	
1120	
1121	L1. S.Project 2
1122	
1123	L1. S.Project 4
1124	L1. S.Project 3
1125	L1. S.Project 5
1127	L1. S.Project 4
1128	
1129	L1. S.Project 3
1130	L1. S.Project 4
1131	L1. S.Project 5
1132	L1. S.Project 2
1133	L1. S.Project 3
1134	L1. S.Project 2
1135	L2. S.Project 2
1137	L1. S.Project 2
1138	L2. S.Project 2
1139	L1. S.Project 4
1140	
1141	
1142	
1143	
1144	L1. S.Project 4
1145	
1146	L1. S.Project 4
1147	L1. S.Project 1
1148	L1. S.Project 1
1149	
1150	L1. S.Project 4
1151	L1. S.Project 4
1152	L4. S.Project 3
1153	L1. S.Project 1
1154	
1155	L1. S.Project 3
1156	
1157	
1158	
1161	
1162	
1164	
1167	
70100004	L3. S.Project 4
70100005	L3. S.Project 10
70100019	L3. S.Project 3
70100020	L3. S.Project 4
70100023	L2. S.Project 10
70100027	L2. S.Project 10
70100028	L2. S.Project 10
70100037	L1. S.Project 8
70100041	L3. S.Project 1
70100042	L3. S.Project 2
70100046	L3. S.Project 7
70100047	L3. S.Project 4
70100051	L2. S.Project 1
70100052	L2. S.Project 9
70100059	L4. S.Project 3
70100060	L2. S.Project 6
70100061	L1. S.Project 5
70100062	L3. S.Project 1
70100063	L2. S.Project 1
70100064	L2. S.Project 2
70100068	L2. S.Project 10
70100070	L3. S.Project 8
70100071	L1. S.Project 7
70100075	L2. S.Project 6
70100076	L3. S.Project 1
70100077	L2. S.Project 9
70100078	L4. S.Project 10
70100080	L2. S.Project 10
70100086	
70100090	L2. S.Project 3
70100098	L2. S.Project 2
70100102	L2. S.Project 2
70100104	
70100106	L2. S.Project 5
70100112	L2. S.Project 1
70100113	L1. S.Project 8
70100117	L1. S.Project 6
70100118	
70100121	L2. S.Project 8
70100122	L2. S.Project 2
70100123	L1. S.Project 8
70100126	
70100127	L1. S.Project 8
70100130	L1. S.Project 8
70100131	
70100133	L1. S.Project 7
70100134	L1. S.Project 7
70100135	L1. S.Project 6
70100136	L1. S.Project 4
70100139	L2. S.Project 4
70100140	L1. S.Project 7
70100143	L1. S.Project 5
70100144	L1. S.Project 4
70100145	L1. S.Project 2
70100146	L1. S.Project 2
70100147	L1. S.Project 7
70100148	L1. S.Project 3
70100149	L1. S.Project 2
70100150	L1. S.Project 1
70100151	L1. S.Project 2
70100152	L1. S.Project 3
70100153	L1. S.Project 3
70100154	
70100155	L1. S.Project 4
70100156	L1. S.Project 3
70100157	L1. S.Project 2
70100158	L1. S.Project 3
70100159	L1. S.Project 1
70100160	L1. S.Project 3
70100161	L1. S.Project 3
70100162	L1. S.Project 2
70100173	
70100174	
90100001	L1. S.Project 5
90100002	L3. S.Project 1
90100004	L2. S.Project 9
90100005	L2. S.Project 10
90100007	L2. S.Project 2
90100010	L2. S.Project 8
90100011	L2. S.Project 8
90100013	L2. S.Project 8
90100020	L4. S.Project 10
90100021	
90100022	L2. S.Project 10
90100024	L2. S.Project 7
90100035	L1. S.Project 8
90100036	L2. S.Project 8
90100039	
90100042	L1. S.Project 8
90100043	L1. S.Project 8
90100044	L2. S.Project 10
90100045	L2. S.Project 5
90100046	
90100047	L2. S.Project 4
90100049	L2. S.Project 2
90100055	L1. S.Project 8
90100056	L2. S.Project 6
90100060	L2. S.Project 4
90100061	L1. S.Project 8
90100064	L2. S.Project 2
90100066	L1. S.Project 5
90100067	L2. S.Project 6
90100068	L2. S.Project 2
90100070	L1. S.Project 6
90100074	L1. S.Project 8
90100075	
90100079	L2. S.Project 2
90100080	L2. S.Project 8
90100081	L3. S.Project 3
90100082	L2. S.Project 2
90100083	L2. S.Project 5
90100086	L1. S.Project 2
90100087	L2. S.Project 2
90100088	L2. S.Project 1
90100089	L1. S.Project 8
90100090	
90100093	L1. S.Project 6
90100094	L1. S.Project 8
90100097	L2. S.Project 2
90100099	L1. S.Project 6
90100100	L1. S.Project 4
90100101	L1. S.Project 4
90100102	L1. S.Project 2
90100103	
90100104	L2. S.Project 8
90100107	
90100108	L1. S.Project 8
90100109	L2. S.Project 1
90100112	L2. S.Project 1
90100113	
90100114	L2. S.Project 2
90100115	L1. S.Project 8
90100116	L1. S.Project 5
90100117	L1. S.Project 5
90100118	
90100120	L2. S.Project 3
90100122	L1. S.Project 6
90100123	L1. S.Project 5
90100127	L1. S.Project 8
90100128	L2. S.Project 1
90100129	
90100130	L1. S.Project 2
90100131	L1. S.Project 7
90100132	L1. S.Project 8
90100133	L1. S.Project 6
90100134	L1. S.Project 8
90100135	L1. S.Project 8
90100136	L1. S.Project 8
90100137	
90100138	L1. S.Project 7
90100139	
90100140	L2. S.Project 2
90100143	L2. S.Project 1
90100144	L1. S.Project 4
90100148	L1. S.Project 8
90100153	L2. S.Project 4
90100154	L1. S.Project 5
90100155	L1. S.Project 4
90100156	L1. S.Project 5
90100160	L1. S.Project 5
90100161	
90100163	
90100164	
90100166	
90100167	
90100168	L1. S.Project 4
90100169	
90100170	
90100171	
90100173	L1. S.Project 3
90100174	L1. S.Project 4
90100175	L1. S.Project 2
90100176	L1. S.Project 1
90100177	
90100178	
90100179	L1. S.Project 4
90100180	L1. S.Project 2
90100182	L1. S.Project 1
90100183	L1. S.Project 3
90100185	L1. S.Project 3
90100186	L1. S.Project 5
90100188	L1. S.Project 2
90100189	
90100190	L1. S.Project 3
90100191	L1. S.Project 4
90100192	L1. S.Project 3
90100193	L1. S.Project 2
90100194	
90100195	L1. S.Project 3
90100196	L1. S.Project 1
90100197	
90100198	L1. S.Project 5
90100200	L1. S.Project 1
90100206	L1. S.Project 4
90100208	L1. S.Project 1
90100209	L1. S.Project 1
90100211	L1. S.Project 1
90100214	L1. S.Project 1
90100215	
90100223	L1. S.Project 1
`;

async function check() {
  try {
    const lines = rawData.trim().split('\n');
    const records = [];
    const dedupSet = new Set();

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 1) continue;
      const id = parts[0].trim();
      const project = parts[1] ? parts[1].trim() : '';
      if (!id || isNaN(id)) continue;

      if (dedupSet.has(id)) {
        continue;
      }
      dedupSet.add(id);
      records.push({ id, expectedProject: project || null });
    }

    console.log(`Parsed ${records.length} unique trainees for checking.`);

    let matchedCount = 0;
    let mismatchedCount = 0;
    let nullInDbCount = 0;
    let missingIds = [];
    const mismatches = [];

    for (const record of records) {
      const checkResult = await db.query('SELECT last_speaking_project, trainee_name FROM dashboard_trainne WHERE id = $1', [record.id]);
      if (checkResult.rows.length === 0) {
        missingIds.push(record.id);
        continue;
      }

      const dbVal = checkResult.rows[0].last_speaking_project;
      const traineeName = checkResult.rows[0].trainee_name;

      if (dbVal === record.expectedProject) {
        matchedCount++;
      } else {
        mismatchedCount++;
        if (dbVal === null) {
          nullInDbCount++;
        }
        mismatches.push({
          id: record.id,
          name: traineeName,
          expected: record.expectedProject,
          dbValue: dbVal
        });
      }
    }

    console.log('\n--- SCAN RESULTS ---');
    console.log(`Matched exactly: ${matchedCount}`);
    console.log(`Mismatched: ${mismatchedCount} (of which ${nullInDbCount} are NULL in the database)`);
    console.log(`Missing in DB: ${missingIds.length}`);
    if (missingIds.length > 0) {
      console.log('Missing IDs:', missingIds);
    }
    
    if (mismatches.length > 0) {
      console.log('\nFirst 20 mismatches (Sample):');
      console.log(JSON.stringify(mismatches.slice(0, 20), null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  }
}

check();
