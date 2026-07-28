const fs = require('fs');
const db = require('./src/db/neonClient');

// Raw data provided by user
const rawData = `
70100176	22 Jul 26	L1. S.Project 1
70100160	22 Jul 26	L6. S.Project 6
70100185	22 Jul 26	L1. S.Project 2
70100175	22 Jul 26	L1. S.Project 1
70100184	18 Jul 26	L1. S.Project 1
70100160	18 Jul 26	L1. S.Project 4
70100174	18 Jul 26	L1. S.Project 2
70100187	18 Jul 26	L1. S.Project 1
70100121	18 Jul 26	L2. S.Project 6
70100190	18 Jul 26	L1. S.Project 1
70100161	18 Jul 26	L1. S.Project 4
70100149	18 Jul 26	L1. S.Project 4
70100130	18 Jul 26	L2. S.Project 2
70100150	17 Jul 26	L1. S.Project 3
70100153	17 Jul 26	L1. S.Project 5
70100122	17 Jul 26	L2. S.Project 3
70100159	17 Jul 26	L1. S.Project 3
70100152	17 Jul 26	L1. S.Project 5
70100127	17 Jul 26	L2. S.Project 1
70100186	15 Jul 26	L1. S.Project 1
70100191	15 Jul 26	L1. S.Project 1
70100180	15 Jul 26	L1. S.Project 1
70100179	15 Jul 26	L1. S.Project 1
70100185	15 Jul 26	L1. S.Project 1
70100167	15 Jul 26	L1. S.Project 1
70100168	15 Jul 26	L1. S.Project 1
70100147	11 Jul 26	L2. S.Project 4
70100102	11 Jul 26	L2. S.Project 4
70100139	11 Jul 26	L2. S.Project 6
70100156	10 Jul 26	L1. S.Project 4
70100148	10 Jul 26	L1. S.Project 8
70100112	10 Jul 26	L2. S.Project 1
70100173	10 Jul 26	L1. S.Project 1
70100148	10 Jul 26	L1. S.Project 7
70100098	8 Jul 26	L2. S.Project 4
70100143	4 Jul 26	L1. S.Project 7
70100143	4 Jul 26	L1. S.Project 8
70100155	4 Jul 26	L1. S.Project 7
70100155	4 Jul 26	L1. S.Project 8
70100139	4 Jul 26	L2. S.Project 5
70100130	4 Jul 26	L2. S.Project 1
70100121	4 Jul 26	L2. S.Project 5
70100133	4 Jul 26	L2. S.Project 2
70100144	4 Jul 26	L1. S.Project 3
70100147	4 Jul 26	L2. S.Project 3
70100152	3 Jul 26	L1. S.Project 4
70100148	3 Jul 26	L1. S.Project 6
70100158	3 Jul 26	L1. S.Project 8
70100174	27 Jun 26	L1. S.Project 1
70100155	27 Jun 26	L1. S.Project 6
70100143	27 Jun 26	L1. S.Project 6
70100153	26 Jun 26	L1. S.Project 4
70100150	26 Jun 26	L1. S.Project 2
70100146	26 Jun 26	L1. S.Project 3
70100158	26 Jun 26	L1. S.Project 6
70100098	24 Jun 26	L2. S.Project 3
70100147	20 Jun 26	L2. S.Project 2
70100134	20 Jun 26	L1. S.Project 8
70100155	20 Jun 26	L1. S.Project 6
70100102	20 Jun 26	L2. S.Project 3
70100117	20 Jun 26	L1. S.Project 7
70100117	20 Jun 26	L1. S.Project 8
70100162	20 Jun 26	L1. S.Project 3
70100136	20 Jun 26	L1. S.Project 5
70100133	20 Jun 26	L2. S.Project 1
70100159	19 Jun 26	L1. S.Project 2
70100148	19 Jun 26	L1. S.Project 5
70100127	19 Jun 26	L2. S.Project 2
70100158	19 Jun 26	L1. S.Project 5
70100135	17 Jun 26	L1. S.Project 8
70100106	17 Jun 26	L2. S.Project 6
70100123	17 Jun 26	L2. S.Project 1
70100155	13 Jun 26	L1. S.Project 5
70100147	13 Jun 26	L2. S.Project 1
70100161	13 Jun 26	L1. S.Project 3
70100148	13 Jun 26	L1. S.Project 4
70100156	12 Jun 26	L1. S.Project 3
70100151	12 Jun 26	L1. S.Project 3
70100106	6 Jun 26	L2. S.Project 5
70100158	5 Jun 26	L1. S.Project 4
70100135	3 Jun 26	L1. S.Project 6
70100098	3 Jun 26	L2. S.Project 2
70100160	30 May 26	L1. S.Project 3
70100143	30 May 26	L1. S.Project 5
70100155	30 May 26	L1. S.Project 4
70100121	30 May 26	L2. S.Project 4
70100134	30 May 26	L1. S.Project 7
70100102	30 May 26	L2. S.Project 2
70100139	30 May 26	L2. S.Project 4
70100153	29 May 26	L1. S.Project 3
70100158	29 May 26	L1. S.Project 3
70100156	22 May 26	L1. S.Project 2
70100146	22 May 26	L1. S.Project 2
70100122	22 May 26	L2. S.Project 2
70100112	22 May 26	L2. S.Project 1
70100152	22 May 26	L1. S.Project 3
70100106	16 May 26	L2. S.Project 3
70100162	16 May 26	L1. S.Project 2
70100136	16 May 26	L1. S.Project 4
70100144	16 May 26	L1. S.Project 4
70100150	15 May 26	L1. S.Project 1
70100159	15 May 26	L1. S.Project 1
70100153	15 May 26	L1. S.Project 2
70100127	15 May 26	L1. S.Project 8
70100158	15 May 26	L1. S.Project 2
70100135	13 May 26	L1. S.Project 5
70100098	13 May 26	L2. S.Project 1
70100160	9 May 26	L1. S.Project 2
70100157	9 May 26	L1. S.Project 2
70100147	9 May 26	L1. S.Project 7
70100161	9 May 26	L1. S.Project 2
70100148	9 May 26	L1. S.Project 3
70100127	8 May 26	L1. S.Project 5
70100151	8 May 26	L1. S.Project 2
70100127	8 May 26	L1. S.Project 7
70100127	8 May 26	L1. S.Project 6
70100106	2 May 26	L2. S.Project 4
70100147	2 May 26	L1. S.Project 7
70100149	2 May 26	L1. S.Project 2
70100139	2 May 26	L2. S.Project 3
70100147	25 Apr 26	L1. S.Project 5
70100147	25 Apr 26	L1. S.Project 6
70100160	18 Apr 26	L1. S.Project 1
70100147	18 Apr 26	L1. S.Project 3
70100142	18 Apr 26	L1. S.Project 5
70100143	18 Apr 26	L1. S.Project 4
70100134	18 Apr 26	L1. S.Project 5
70100155	18 Apr 26	L1. S.Project 3
70100147	18 Apr 26	L1. S.Project 4
70100161	18 Apr 26	L1. S.Project 1
70100130	18 Apr 26	L1. S.Project 8
70100121	18 Apr 26	L2. S.Project 8
70100145	18 Apr 26	L1. S.Project 2
70100140	18 Apr 26	L1. S.Project 7
70100117	18 Apr 26	L1. S.Project 5
70100116	18 Apr 26	L1. S.Project 8
70100122	17 Apr 26	L2. S.Project 1
70100123	17 Apr 26	L1. S.Project 7
70100156	17 Apr 26	L1. S.Project 1
70100127	17 Apr 26	L1. S.Project 4
70100139	11 Apr 26	L2. S.Project 2
70100149	11 Apr 26	L1. S.Project 1
70100130	11 Apr 26	L1. S.Project 6
70100121	11 Apr 26	L2. S.Project 3
70100117	11 Apr 26	L1. S.Project 4
70100133	11 Apr 26	L1. S.Project 7
70100116	11 Apr 26	L1. S.Project 6
70100140	11 Apr 26	L1. S.Project 6
70100162	11 Apr 26	L1. S.Project 1
70100158	10 Apr 26	L1. S.Project 1
70100152	10 Apr 26	L1. S.Project 2
70100148	10 Apr 26	L1. S.Project 2
70100106	4 Apr 26	L2. S.Project 3
70100157	4 Apr 26	L1. S.Project 1
70100147	4 Apr 26	L1. S.Project 2
70100155	4 Apr 26	L1. S.Project 2
70100139	4 Apr 26	L2. S.Project 1
70100121	4 Apr 26	L2. S.Project 2
70100132	4 Apr 26	L1. S.Project 6
70100144	4 Apr 26	L1. S.Project 3
70100116	4 Apr 26	L1. S.Project 6
70100135	1 Apr 26	L1. S.Project 4
70100143	28 Mar 26	L1. S.Project 3
70100123	14 Mar 26	L1. S.Project 8
70100102	14 Mar 26	L2. S.Project 1
70100155	14 Mar 26	L1. S.Project 1
70100136	14 Mar 26	L1. S.Project 4
70100133	14 Mar 26	L1. S.Project 6
70100151	13 Mar 26	L1. S.Project 1
70100127	6 Mar 26	L1. S.Project 3
70100113	4 Mar 26	L1. S.Project 8
70100098	4 Mar 26	L1. S.Project 8
70100120	28 Feb 26	L1. S.Project 4
70100129	28 Feb 26	L1. S.Project 8
70100139	28 Feb 26	L1. S.Project 8
70100144	28 Feb 26	L1. S.Project 2
70100140	28 Feb 26	L1. S.Project 5
70100116	28 Feb 26	L1. S.Project 4
70100153	27 Feb 26	L1. S.Project 1
70100130	14 Feb 26	L1. S.Project 4
70100121	14 Feb 26	L2. S.Project 1
70100117	14 Feb 26	L1. S.Project 3
70100141	14 Feb 26	L1. S.Project 4
70100145	14 Feb 26	L1. S.Project 1
70100136	14 Feb 26	L1. S.Project 3
70100152	13 Feb 26	L1. S.Project 1
70100148	13 Feb 26	L1. S.Project 1
70100134	7 Feb 26	L1. S.Project 4
70100143	7 Feb 26	L1. S.Project 2
70100142	7 Feb 26	L1. S.Project 3
70100132	7 Feb 26	L1. S.Project 5
70100140	7 Feb 26	L1. S.Project 4
70100133	7 Feb 26	L1. S.Project 5
70100138	7 Feb 26	L1. S.Project 4
70100136	7 Feb 26	L1. S.Project 2
70100123	6 Feb 26	L1. S.Project 6
70100134	31 Jan 26	L1. S.Project 3
70100119	31 Jan 26	L1. S.Project 6
70100139	31 Jan 26	L1. S.Project 7
70100147	31 Jan 26	L1. S.Project 1
70100130	31 Jan 26	L1. S.Project 5
70100117	31 Jan 26	L1. S.Project 2
70100132	31 Jan 26	L1. S.Project 4
70100133	31 Jan 26	L1. S.Project 4
70100146	28 Jan 26	L1. S.Project 1
70100143	24 Jan 26	L1. S.Project 1
70100142	24 Jan 26	L1. S.Project 2
70100139	24 Jan 26	L1. S.Project 6
70100125	24 Jan 26	L1. S.Project 4
70100141	24 Jan 26	L1. S.Project 3
70100132	24 Jan 26	L1. S.Project 3
70100144	24 Jan 26	L1. S.Project 1
70100140	24 Jan 26	L1. S.Project 3
70100138	24 Jan 26	L1. S.Project 3
70100116	24 Jan 26	L1. S.Project 3
70100123	23 Jan 26	L1. S.Project 5
70100098	21 Jan 26	L1. S.Project 5
70100106	17 Jan 26	L2. S.Project 2
70100142	17 Jan 26	L1. S.Project 1
70100120	17 Jan 26	L1. S.Project 3
70100133	17 Jan 26	L1. S.Project 3
70100135	14 Jan 26	L1. S.Project 3
70100113	14 Jan 26	L1. S.Project 6
70100106	10 Jan 26	L2. S.Project 1
70100119	10 Jan 26	L1. S.Project 7
70100139	10 Jan 26	L1. S.Project 5
70100121	10 Jan 26	L1. S.Project 8
70100129	20 Dec 25	L1. S.Project 5
70100125	20 Dec 25	L1. S.Project 3
70100129	13 Dec 25	L1. S.Project 4
70100119	13 Dec 25	L1. S.Project 5
70100130	13 Dec 25	L1. S.Project 3
70100141	13 Dec 25	L1. S.Project 2
70100138	13 Dec 25	L1. S.Project 2
70100136	13 Dec 25	L1. S.Project 2
70100135	11 Dec 25	L1. S.Project 2
70100098	11 Dec 25	L1. S.Project 2
70100122	6 Dec 25	L1. S.Project 7
70100120	6 Dec 25	L1. S.Project 2
70100139	6 Dec 25	L1. S.Project 4
70100121	6 Dec 25	L1. S.Project 6
70100140	6 Dec 25	L1. S.Project 2
70100116	6 Dec 25	L1. S.Project 2
70100133	6 Dec 25	L1. S.Project 2
70100122	5 Dec 25	L1. S.Project 6
70100127	5 Dec 25	L1. S.Project 2
70100113	3 Dec 25	L1. S.Project 5
70100129	22 Nov 25	L1. S.Project 3
70100139	22 Nov 25	L1. S.Project 3
70100130	22 Nov 25	L1. S.Project 7
70100132	22 Nov 25	L1. S.Project 2
70100138	22 Nov 25	L1. S.Project 1
70100122	21 Nov 25	L1. S.Project 5
70100123	21 Nov 25	L1. S.Project 4
70100135	19 Nov 25	L1. S.Project 2
70100102	15 Nov 25	L1. S.Project 8
70100111	15 Nov 25	L1. S.Project 5
70100102	15 Nov 25	L1. S.Project 8
70100119	15 Nov 25	L1. S.Project 4
70100121	15 Nov 25	L1. S.Project 5
70100117	15 Nov 25	L1. S.Project 1
70100140	15 Nov 25	L1. S.Project 1
70100112	14 Nov 25	L1. S.Project 7
70100098	12 Nov 25	L1. S.Project 3
70100102	8 Nov 25	L1. S.Project 6
70100102	8 Nov 25	L1. S.Project 7
70100134	8 Nov 25	L1. S.Project 1
70100124	8 Nov 25	L1. S.Project 3
70100102	8 Nov 25	L1. S.Project 7
70100139	8 Nov 25	L1. S.Project 2
70100141	8 Nov 25	L1. S.Project 1
70100133	8 Nov 25	L1. S.Project 1
70100116	8 Nov 25	L1. S.Project 1
70100136	8 Nov 25	L1. S.Project 1
70100122	7 Nov 25	L1. S.Project 4
70100113	5 Nov 25	L1. S.Project 4
70100121	1 Nov 25	L1. S.Project 4
70100139	1 Nov 25	L1. S.Project 1
70100132	1 Nov 25	L1. S.Project 1
70100123	31 Oct 25	L1. S.Project 3
70100112	31 Oct 25	L1. S.Project 6
70100098	29 Oct 25	L1. S.Project 2
70100119	25 Oct 25	L1. S.Project 3
70100106	18 Oct 25	L1. S.Project 8
70100129	18 Oct 25	L1. S.Project 2
70100121	18 Oct 25	L1. S.Project 3
70100122	17 Oct 25	L1. S.Project 2
70100135	15 Oct 25	L1. S.Project 1
70100106	11 Oct 25	L1. S.Project 6
70100102	11 Oct 25	L1. S.Project 6
70100119	11 Oct 25	L1. S.Project 2
70100121	11 Oct 25	L1. S.Project 2
70100123	10 Oct 25	L1. S.Project 2
70100112	10 Oct 25	L1. S.Project 5
70100113	8 Oct 25	L1. S.Project 3
70100106	4 Oct 25	L1. S.Project 5
70100130	4 Oct 25	L1. S.Project 2
70100121	4 Oct 25	L1. S.Project 1
70100120	27 Sep 25	L1. S.Project 1
70100125	27 Sep 25	L1. S.Project 1
70100122	26 Sep 25	L1. S.Project 1
70100123	26 Sep 25	L1. S.Project 1
70100127	26 Sep 25	L1. S.Project 1
70100111	20 Sep 25	L1. S.Project 3
70100124	20 Sep 25	L1. S.Project 2
70100129	20 Sep 25	L1. S.Project 1
70100119	20 Sep 25	L1. S.Project 1
70100130	20 Sep 25	L1. S.Project 1
70100112	19 Sep 25	L1. S.Project 4
70100098	17 Sep 25	L1. S.Project 1
70100106	13 Sep 25	L1. S.Project 4
70100098	10 Sep 25	L1. S.Project 1
70100113	10 Sep 25	L1. S.Project 2
70100112	22 Aug 25	L1. S.Project 3
70100110	22 Aug 25	L1. S.Project 5
70100102	16 Aug 25	L1. S.Project 4
70100124	16 Aug 25	L1. S.Project 1
70100110	15 Aug 25	L1. S.Project 4
70100113	13 Aug 25	L1. S.Project 1
70100106	9 Aug 25	L1. S.Project 3
70100111	9 Aug 25	L1. S.Project 2
70100112	8 Aug 25	L1. S.Project 2
70100110	8 Aug 25	L1. S.Project 3
70100106	2 Aug 25	L1. S.Project 2
70100111	26 Jul 25	L1. S.Project 1
70100112	25 Jul 25	L1. S.Project 1
70100106	19 Jul 25	L1. S.Project 1
70100102	19 Jul 25	L1. S.Project 3
70100110	11 Jul 25	L1. S.Project 1
70100102	5 Jul 25	L1. S.Project 1
70100102	7 Jun 25	L1. S.Project 1
`;

function parseDate(dateStr) {
  if (!dateStr) return 0;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    let [day, monthStr, yearStr] = parts;
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[monthStr.toLowerCase().substring(0, 3)];
    let year = parseInt(yearStr, 10);
    if (year < 100) year += 2000;
    return new Date(year, month, parseInt(day, 10)).getTime();
  }
  return 0;
}

async function run() {
  const lines = rawData.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  const latestProjectMap = new Map();

  for (const line of lines) {
    const parts = line.split(/\t+/);
    if (parts.length < 3) continue;
    const id = parts[0].trim();
    const dateStr = parts[1].trim();
    const project = parts[2].trim();

    if (!/^\d+$/.test(id)) continue;

    const timestamp = parseDate(dateStr);

    if (!latestProjectMap.has(id)) {
      latestProjectMap.set(id, { id, project, dateStr, timestamp });
    } else {
      const existing = latestProjectMap.get(id);
      if (timestamp > existing.timestamp) {
        latestProjectMap.set(id, { id, project, dateStr, timestamp });
      }
    }
  }

  console.log(`Extracted latest speaking project for ${latestProjectMap.size} unique trainees.`);

  let updatedCount = 0;
  for (const [id, item] of latestProjectMap.entries()) {
    const res = await db.query(`
      UPDATE portal_trainee
      SET latest_speaking_project = $2, updated_at = NOW()
      WHERE trainee_id = $1
    `, [id, item.project]);

    if (res.rowCount > 0) {
      updatedCount++;
    } else {
      await db.query(`
        INSERT INTO portal_trainee (trainee_id, latest_speaking_project, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (trainee_id) DO UPDATE SET
          latest_speaking_project = EXCLUDED.latest_speaking_project,
          updated_at = NOW()
      `, [id, item.project]);
      updatedCount++;
    }
  }

  console.log(`Successfully updated latest_speaking_project for ${updatedCount} trainees in database.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error importing speaking projects:', err);
  process.exit(1);
});
