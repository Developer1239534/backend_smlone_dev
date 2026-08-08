const fs = require('fs');
const path = require('path');
const db = require('../src/db/neonClient');

const rawInputText = `
27
Real Stage 47
[https://drive.google.com/file/d/1XNN0qo5jpEmtAPb1gctBR6oUKTqSB3_l/view?usp=drivesdk](https://drive.google.com/file/d/1XNN0qo5jpEmtAPb1gctBR6oUKTqSB3_l/view?usp=drivesdk)
45
Real Stage 47
[https://drive.google.com/file/d/1ahbt_VYGRZasJO4KZ4OIF4QWfwwwcjmz/view?usp=drivesdk](https://drive.google.com/file/d/1ahbt_VYGRZasJO4KZ4OIF4QWfwwwcjmz/view?usp=drivesdk)
48
Real Stage 47
[https://drive.google.com/file/d/1jbIMsDlbItDFQ8AFNNRMRw35lNBHXBgW/view?usp=drivesdk](https://drive.google.com/file/d/1jbIMsDlbItDFQ8AFNNRMRw35lNBHXBgW/view?usp=drivesdk)
49
Real Stage 47
[https://drive.google.com/file/d/1QOxh5taZs2ANu8odhvnMd8o5L46--R-A/view?usp=drivesdk](https://drive.google.com/file/d/1QOxh5taZs2ANu8odhvnMd8o5L46--R-A/view?usp=drivesdk)
333
Real Stage 47
[https://drive.google.com/file/d/1RgEce8A76kKt4lvr_aGCMj-KyQQ7AWlC/view?usp=drivesdk](https://drive.google.com/file/d/1RgEce8A76kKt4lvr_aGCMj-KyQQ7AWlC/view?usp=drivesdk)
429
Real Stage 47
[https://drive.google.com/file/d/1QTToAXbJjw-UA-Z-FWg7ephgmPe12fKJ/view?usp=drivesdk](https://drive.google.com/file/d/1QTToAXbJjw-UA-Z-FWg7ephgmPe12fKJ/view?usp=drivesdk)
575
Real Stage 47
[https://drive.google.com/file/d/1DkhDSCpxaNUGlrT380px5cOBmxqpyv-F/view?usp=drivesdk](https://drive.google.com/file/d/1DkhDSCpxaNUGlrT380px5cOBmxqpyv-F/view?usp=drivesdk)
580
Real Stage 47
[https://drive.google.com/file/d/1aBulUP3BL8UUkjj332IL-LkiPB1nOMcD/view?usp=drivesdk](https://drive.google.com/file/d/1aBulUP3BL8UUkjj332IL-LkiPB1nOMcD/view?usp=drivesdk)
614
Real Stage 47
[https://drive.google.com/file/d/1CeeKCB3nFtRZWR1YMJNdVPj2BEGcHv-C/view?usp=drivesdk](https://drive.google.com/file/d/1CeeKCB3nFtRZWR1YMJNdVPj2BEGcHv-C/view?usp=drivesdk)
852
Real Stage 47
[https://drive.google.com/file/d/1KsrGbzByNERnc9zwP6li8RAM4wtAcDUp/view?usp=drivesdk](https://drive.google.com/file/d/1KsrGbzByNERnc9zwP6li8RAM4wtAcDUp/view?usp=drivesdk)
865
Real Stage 47
[https://drive.google.com/file/d/1I-Or_Qk9Tn4OhTTtQCNaSh0RJxr4EnjS/view?usp=drivesdk](https://drive.google.com/file/d/1I-Or_Qk9Tn4OhTTtQCNaSh0RJxr4EnjS/view?usp=drivesdk)
896
Real Stage 47
[https://drive.google.com/file/d/1x4pZ_qiJ8NV_lW7XSoeQrvePorJyRABD/view?usp=drivesdk](https://drive.google.com/file/d/1x4pZ_qiJ8NV_lW7XSoeQrvePorJyRABD/view?usp=drivesdk)
904
Real Stage 47
[https://drive.google.com/file/d/1jS4raB55ss9r-q2pmjCS-H2MmskaYl_m/view?usp=drivesdk](https://drive.google.com/file/d/1jS4raB55ss9r-q2pmjCS-H2MmskaYl_m/view?usp=drivesdk)
932
Real Stage 47
[https://drive.google.com/file/d/1ziHwivaOIzYnMwSCLxlU8xy5rFyBDL9y/view?usp=drivesdk](https://drive.google.com/file/d/1ziHwivaOIzYnMwSCLxlU8xy5rFyBDL9y/view?usp=drivesdk)
965
Real Stage 47
[https://drive.google.com/file/d/1bdfs1p1_KnQGHh7OSrzdSJv9D4OUBiR3/view?usp=drivesdk](https://drive.google.com/file/d/1bdfs1p1_KnQGHh7OSrzdSJv9D4OUBiR3/view?usp=drivesdk)
988
Real Stage 47
[https://drive.google.com/file/d/1i5vfXkeHpS-tcqTm9Lsr95gYZqmqbaCs/view?usp=drivesdk](https://drive.google.com/file/d/1i5vfXkeHpS-tcqTm9Lsr95gYZqmqbaCs/view?usp=drivesdk)
1015
Real Stage 47
[https://drive.google.com/file/d/17xgFQUVCEYEtR_5eUpjje2M5nF52CUz0/view?usp=drivesdk](https://drive.google.com/file/d/17xgFQUVCEYEtR_5eUpjje2M5nF52CUz0/view?usp=drivesdk)
1025
Real Stage 47
[https://drive.google.com/file/d/1U8sQoVP6rxyCLPF8GTPYeHzVaMb9oyCX/view?usp=drivesdk](https://drive.google.com/file/d/1U8sQoVP6rxyCLPF8GTPYeHzVaMb9oyCX/view?usp=drivesdk)
1027
Real Stage 47
[https://drive.google.com/file/d/12zpMdgAKoEPezR-tZBE3iTnTdXCEGUkN/view?usp=drivesdk](https://drive.google.com/file/d/12zpMdgAKoEPezR-tZBE3iTnTdXCEGUkN/view?usp=drivesdk)
1045
Real Stage 47
[https://drive.google.com/file/d/1qJ3DWC8ABz7X9zGe3C7y4ysS6NmPMo5l/view?usp=drivesdk](https://drive.google.com/file/d/1qJ3DWC8ABz7X9zGe3C7y4ysS6NmPMo5l/view?usp=drivesdk)
1071
Real Stage 47
[https://drive.google.com/file/d/1uBEmfftMbxX-PVDhKmnqbbYv6zZKi5g8/view?usp=drivesdk](https://drive.google.com/file/d/1uBEmfftMbxX-PVDhKmnqbbYv6zZKi5g8/view?usp=drivesdk)
70100004
Real Stage 47
[https://drive.google.com/file/d/1uBEmfftMbxX-PVDhKmnqbbYv6zZKi5g8/view?usp=drivesdk](https://drive.google.com/file/d/1uBEmfftMbxX-PVDhKmnqbbYv6zZKi5g8/view?usp=drivesdk)
70100019
Real Stage 47
[https://drive.google.com/file/d/1vhl6xhJO6agnY8DZOR-fDJK4kr7NOyhF/view?usp=drivesdk](https://drive.google.com/file/d/1vhl6xhJO6agnY8DZOR-fDJK4kr7NOyhF/view?usp=drivesdk)
70100020
Real Stage 47
[https://drive.google.com/file/d/18x0HYXYUgmMVv6mdBS1j0WyejsEPIxIa/view?usp=drivesdk](https://drive.google.com/file/d/18x0HYXYUgmMVv6mdBS1j0WyejsEPIxIa/view?usp=drivesdk)
70100042
Real Stage 47
[https://drive.google.com/file/d/19JGoxPSNIL82DEyllkMTcbKIA-N7hfyo/view?usp=drivesdk](https://drive.google.com/file/d/19JGoxPSNIL82DEyllkMTcbKIA-N7hfyo/view?usp=drivesdk)
70100059
Real Stage 47
[https://drive.google.com/file/d/1aUkiElhAhNLc4qDV2jJZZDFYKNYpZDGT/view?usp=drivesdk](https://drive.google.com/file/d/1aUkiElhAhNLc4qDV2jJZZDFYKNYpZDGT/view?usp=drivesdk)
70100064
Real Stage 47
[https://drive.google.com/file/d/1ziHwivaOIzYnMwSCLxlU8xy5rFyBDL9y/view?usp=drivesdk](https://drive.google.com/file/d/1ziHwivaOIzYnMwSCLxlU8xy5rFyBDL9y/view?usp=drivesdk)
70100078
Real Stage 47
[https://drive.google.com/file/d/1dicbrT2b1TfNvnr_ClmEFlfZcspLip7O/view?usp=drivesdk](https://drive.google.com/file/d/1dicbrT2b1TfNvnr_ClmEFlfZcspLip7O/view?usp=drivesdk)
70100102
Real Stage 47
[https://drive.google.com/file/d/1D5gffqf6B_taDaqTSXS2-GZXNrQZ6-Ze/view?usp=drivesdk](https://drive.google.com/file/d/1D5gffqf6B_taDaqTSXS2-GZXNrQZ6-Ze/view?usp=drivesdk)
70100112
Real Stage 47
[https://drive.google.com/file/d/1jPVfrT57Jcp6Qof9RusXnSxRwLGdU_2e/view?usp=drivesdk](https://drive.google.com/file/d/1jPVfrT57Jcp6Qof9RusXnSxRwLGdU_2e/view?usp=drivesdk)
70100121
Real Stage 47
[https://drive.google.com/file/d/1DuY-cQuXCgWgzI9dtEUzafOonGxlrljH/view?usp=drivesdk](https://drive.google.com/file/d/1DuY-cQuXCgWgzI9dtEUzafOonGxlrljH/view?usp=drivesdk)
90100064
Real Stage 47
[https://drive.google.com/file/d/1N_IPGAT0n3FDs8QBK3JW3VH10lQqhIGe/view?usp=drivesdk](https://drive.google.com/file/d/1N_IPGAT0n3FDs8QBK3JW3VH10lQqhIGe/view?usp=drivesdk)
90100097
Real Stage 47
[https://drive.google.com/file/d/1jGGXlC6ipHSj1FqExY3idYNpI6WgnagJ/view?usp=drivesdk](https://drive.google.com/file/d/1jGGXlC6ipHSj1FqExY3idYNpI6WgnagJ/view?usp=drivesdk)
`;

async function main() {
  console.log('🚀 Embedded fast batch updating Real Stage Reports into report_trainee...');

  const lines = rawInputText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Parse ID, Stage Title, Link
  const entries = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\d+$/.test(line)) {
      const id = line;
      const title = lines[i + 1] || 'Real Stage';
      let rawLink = lines[i + 2] || '';
      
      const match = rawLink.match(/\[(.*?)\]\((.*?)\)/);
      const link = match ? match[2] : rawLink;

      if (link.startsWith('http')) {
        entries.push({ id, title, link });
        i += 3;
        continue;
      }
    }
    i++;
  }

  console.log(`Parsed ${entries.length} real stage entries.`);

  // Get existing rows into memory
  const allRows = await db.query('SELECT id, trainee_id, link_reports_3 FROM report_trainee');
  const rowMap = new Map();
  allRows.rows.forEach(r => {
    rowMap.set(String(r.id).toLowerCase(), r);
    rowMap.set(String(r.trainee_id).toLowerCase(), r);
  });

  let updatedCount = 0;
  for (const entry of entries) {
    const existing = rowMap.get(String(entry.id).toLowerCase());
    let linkReports3Arr = [];
    if (existing) {
      if (Array.isArray(existing.link_reports_3)) {
        linkReports3Arr = existing.link_reports_3;
      } else if (typeof existing.link_reports_3 === 'string') {
        try { linkReports3Arr = JSON.parse(existing.link_reports_3); } catch(e) {}
      }
    }

    linkReports3Arr = linkReports3Arr.filter(t => t.title !== entry.title && t.stage !== entry.title);
    linkReports3Arr.push({ title: entry.title, stage: entry.title, link: entry.link });

    const updateRes = await db.query(`
      UPDATE report_trainee
      SET 
        report_title_3 = $1,
        link_to_report = $2,
        link_reports_3 = $3::jsonb,
        updated_at = NOW()
      WHERE LOWER(id::text) = LOWER($4) OR LOWER(trainee_id::text) = LOWER($4)
    `, [entry.title, entry.link, JSON.stringify(linkReports3Arr), entry.id]);

    if (updateRes.rowCount === 0) {
      await db.query(`
        INSERT INTO report_trainee (id, trainee_id, report_title_3, link_to_report, link_reports_3, created_at, updated_at)
        VALUES ($1, $1, $2, $3, $4::jsonb, NOW(), NOW())
      `, [entry.id, entry.title, entry.link, JSON.stringify(linkReports3Arr)]);
    }

    updatedCount++;
  }

  console.log(`✅ Successfully updated/inserted ${updatedCount} real stage reports!`);

  // Sync names with login_portal_fix
  await db.query(`
    UPDATE report_trainee r
    SET name = l.name, updated_at = NOW()
    FROM login_portal_fix l
    WHERE LOWER(r.id::text) = LOWER(l.id::text) OR LOWER(r.trainee_id::text) = LOWER(l.id::text);
  `);

  // Re-export seed_report_trainee.json
  const exportRes = await db.query('SELECT * FROM report_trainee ORDER BY id ASC');
  const jsonPath = path.join(__dirname, 'seed_report_trainee.json');
  fs.writeFileSync(jsonPath, JSON.stringify(exportRes.rows, null, 2), 'utf8');
  console.log(`📦 Saved seed_report_trainee.json successfully! (${exportRes.rows.length} total rows)`);

  process.exit(0);
}

main().catch(console.error);
